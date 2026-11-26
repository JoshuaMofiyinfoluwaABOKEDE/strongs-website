"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { theologyRules } from "@/content/theology/catalog";
import { one, q } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getTheologyCourse, lessonKey, lessonKeys, quizPaper, writtenPaper, type PaperItem } from "@/lib/theology/content";
import { courseRow, gradebook, settleCourse } from "@/lib/theology/progress";
import { GRACE_SECONDS, finishExam, markPaper, type AttemptRow } from "@/lib/theology/marking";
import { extractText, similarity } from "@/lib/theology/plagiarism";

const str = (f: FormData, k: string, max = 20000) => String(f.get(k) ?? "").slice(0, max);
const int = (f: FormData, k: string) => Number.parseInt(String(f.get(k) ?? ""), 10);
const base = (slug: string) => `/theology/${slug}/`;

/** The course, its database row and the signed-in, enrolled learner. */
async function context(slug: string, mustBeEnrolled = true) {
  const user = await requireUser(base(slug));
  const c = getTheologyCourse(slug);
  const row = c ? await courseRow(slug) : null;
  if (!c || !row) redirect("/courses/theology/");
  if (mustBeEnrolled) {
    const e = await one(`SELECT 1 FROM lms_enrolment WHERE user_id = $1 AND course_id = $2`, [user.id, row.id]);
    if (!e) redirect(`/courses/theology/${slug}/`);
  }
  return { user, c, row };
}

function refresh(slug: string) {
  revalidatePath(base(slug), "layout");
  revalidatePath("/dashboard/");
}

/* ───────────── enrolment and lessons ───────────── */

export async function enrolTheology(form: FormData) {
  const slug = str(form, "slug", 120);
  const { user, row } = await context(slug, false);
  await q(`INSERT INTO lms_enrolment (user_id, course_id) VALUES ($1,$2) ON CONFLICT (user_id, course_id) DO NOTHING`, [user.id, row.id]);
  refresh(slug);
  redirect(base(slug));
}

export async function completeTheologyLesson(form: FormData) {
  const slug = str(form, "slug", 120);
  const { user, c, row } = await context(slug);
  const week = int(form, "week");
  const lesson = int(form, "lesson");
  const key = lessonKey(week, lesson);
  if (!lessonKeys(c).includes(key)) redirect(base(slug));
  await q(`INSERT INTO th_lesson_done (user_id, course_id, lesson_key) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`, [user.id, row.id, key]);
  await q(`UPDATE lms_enrolment SET last_key = $3, last_active_at = now() WHERE user_id = $1 AND course_id = $2`, [user.id, row.id, key]);
  await settleCourse(user.id, c, row);
  refresh(slug);
  const mod = c.modules[week - 1];
  redirect(lesson < mod.lessons.length ? `${base(slug)}week/${week}/lesson/${lesson + 1}/` : `${base(slug)}week/${week}/#review`);
}

/* ───────────── marking ───────────── */


function readAnswers(form: FormData, paper: PaperItem[]) {
  const answers: Record<string, string> = {};
  for (const item of paper) {
    const v = form.get(`a_${item.id}`);
    if (v !== null) answers[item.id] = String(v).slice(0, 4000);
  }
  return answers;
}


async function ownAttempt(userId: string, id: number) {
  return one<AttemptRow>(`SELECT id, user_id, course_id, kind, week, questions, answers, status, deadline_at FROM th_attempt WHERE id = $1 AND user_id = $2`, [id, userId]);
}

/* ───────────── weekly quizzes ───────────── */

export async function startQuiz(form: FormData) {
  const slug = str(form, "slug", 120);
  const { user, c, row } = await context(slug);
  const week = int(form, "week");
  if (!c.modules[week - 1]) redirect(base(slug));
  const open = await one<{ id: number }>(
    `SELECT id FROM th_attempt WHERE user_id=$1 AND course_id=$2 AND kind='quiz' AND week=$3 AND status='open' ORDER BY id DESC LIMIT 1`,
    [user.id, row.id, week],
  );
  const id =
    open?.id ??
    (await one<{ id: number }>(
      `INSERT INTO th_attempt (user_id, course_id, kind, week, questions) VALUES ($1,$2,'quiz',$3,$4) RETURNING id`,
      [user.id, row.id, week, JSON.stringify(quizPaper(c, week, theologyRules.quiz.questions))],
    ))!.id;
  redirect(`${base(slug)}week/${week}/quiz/?a=${id}`);
}

export async function submitQuiz(form: FormData) {
  const slug = str(form, "slug", 120);
  const { user, c, row } = await context(slug);
  const a = await ownAttempt(user.id, int(form, "attempt"));
  if (!a || a.kind !== "quiz" || a.course_id !== row.id) redirect(base(slug));
  if (a.status === "open") {
    const answers = readAnswers(form, a.questions);
    const { marks, score } = markPaper(c, a.questions, answers);
    await q(`UPDATE th_attempt SET answers=$2, marks=$3, score=$4, status='submitted', submitted_at=now() WHERE id=$1 AND status='open'`, [a.id, JSON.stringify(answers), JSON.stringify(marks), score]);
    await settleCourse(user.id, c, row);
    refresh(slug);
  }
  redirect(`${base(slug)}week/${a.week}/quiz/?a=${a.id}`);
}

/* ───────────── course test (3 attempts, best counts) ───────────── */

export async function startTest(form: FormData) {
  const slug = str(form, "slug", 120);
  const { user, c, row } = await context(slug);
  const g = await gradebook(user.id, c, row);
  if (g.testOpen) redirect(`${base(slug)}test/?a=${g.testOpen}`);
  if (g.testAttempts.length >= theologyRules.test.attempts) redirect(`${base(slug)}test/`);
  const t = theologyRules.test;
  const r = await one<{ id: number }>(
    `INSERT INTO th_attempt (user_id, course_id, kind, questions) VALUES ($1,$2,'test',$3) RETURNING id`,
    [user.id, row.id, JSON.stringify(writtenPaper(c, t.mcq, t.short, t.lists))],
  );
  redirect(`${base(slug)}test/?a=${r!.id}`);
}

export async function submitTest(form: FormData) {
  const slug = str(form, "slug", 120);
  const { user, c, row } = await context(slug);
  const a = await ownAttempt(user.id, int(form, "attempt"));
  if (!a || a.kind !== "test" || a.course_id !== row.id) redirect(base(slug));
  if (a.status === "open") {
    const answers = readAnswers(form, a.questions);
    const { marks, score } = markPaper(c, a.questions, answers);
    await q(`UPDATE th_attempt SET answers=$2, marks=$3, score=$4, status='submitted', submitted_at=now() WHERE id=$1 AND status='open'`, [a.id, JSON.stringify(answers), JSON.stringify(marks), score]);
    await settleCourse(user.id, c, row);
    refresh(slug);
  }
  redirect(`${base(slug)}test/?a=${a.id}`);
}

/* ───────────── final exam (timed, one attempt) ───────────── */


export async function startExam(form: FormData) {
  const slug = str(form, "slug", 120);
  const { user, c, row } = await context(slug);
  if (form.get("ready") !== "on") redirect(`${base(slug)}exam/?error=confirm`);
  const g = await gradebook(user.id, c, row);
  if (!g.parts.lessons || !g.parts.quizzes) redirect(`${base(slug)}exam/?error=locked`);
  if (g.exam) redirect(`${base(slug)}exam/`);
  const e = theologyRules.exam;
  await q(
    `INSERT INTO th_attempt (user_id, course_id, kind, questions, deadline_at) VALUES ($1,$2,'exam',$3, now() + make_interval(mins => $4)) ON CONFLICT DO NOTHING`,
    [user.id, row.id, JSON.stringify(writtenPaper(c, e.mcq, e.short, e.lists)), c.examMinutes],
  );
  redirect(`${base(slug)}exam/`);
}

/** Saves exam answers as the learner works, so nothing is lost if the connection drops. */
export async function saveExamAnswers(slug: string, attemptId: number, answers: Record<string, string>) {
  const user = await requireUser(base(slug));
  const a = await ownAttempt(user.id, attemptId);
  if (!a || a.kind !== "exam" || a.status !== "open") return { ok: false };
  if (a.deadline_at && Date.now() > new Date(a.deadline_at).getTime() + GRACE_SECONDS * 1000) return { ok: false };
  const clean: Record<string, string> = {};
  for (const item of a.questions) if (typeof answers[item.id] === "string") clean[item.id] = answers[item.id].slice(0, 4000);
  await q(`UPDATE th_attempt SET answers = $2 WHERE id = $1 AND status = 'open'`, [a.id, JSON.stringify(clean)]);
  return { ok: true };
}

export async function submitExam(form: FormData) {
  const slug = str(form, "slug", 120);
  const { user, c, row } = await context(slug);
  const a = await ownAttempt(user.id, int(form, "attempt"));
  if (!a || a.kind !== "exam" || a.course_id !== row.id) redirect(base(slug));
  if (a.status === "open") {
    const late = a.deadline_at && Date.now() > new Date(a.deadline_at).getTime() + GRACE_SECONDS * 1000;
    // After the deadline, only the answers already saved count.
    const answers = late ? a.answers : { ...a.answers, ...readAnswers(form, a.questions) };
    await finishExam(a, c, answers);
    await settleCourse(user.id, c, row);
    refresh(slug);
  }
  redirect(`${base(slug)}exam/`);
}

 
/* ───────────── assignments ───────────── */

export async function submitTheologyAssignment(form: FormData) {
  const slug = str(form, "slug", 120);
  const { user, c, row } = await context(slug);
  const n = int(form, "assignment");
  const back = `${base(slug)}assignment/${n}/`;
  if (!c.assignments[n - 1]) redirect(base(slug));
  if (str(form, "declaration", 200) !== theologyRules.declaration) redirect(`${back}?error=declaration`);
  const existing = await one<{ status: string }>(`SELECT status FROM th_submission WHERE user_id=$1 AND course_id=$2 AND assignment_no=$3`, [user.id, row.id, n]);
  if (existing?.status === "graded") redirect(back);

  const text = str(form, "text", 60000).trim();
  const file = form.get("file");
  let fileName: string | null = null;
  let fileType: string | null = null;
  let fileData: Buffer | null = null;
  let fileText = "";
  if (file instanceof File && file.size > 0) {
    if (file.size > theologyRules.maxUploadBytes) redirect(`${back}?error=size`);
    if (!/\.(pdf|docx|txt)$/i.test(file.name)) redirect(`${back}?error=type`);
    const bytes = new Uint8Array(await file.arrayBuffer());
    fileName = file.name.slice(0, 200);
    fileType = file.type || "application/octet-stream";
    fileData = Buffer.from(bytes);
    fileText = (await extractText(bytes, fileType, fileName)).slice(0, 100000);
  }
  if (!text && !fileData) redirect(`${back}?error=empty`);

  // Plagiarism check: other learners' work on this assignment, and this course's own lessons.
  const others = await q<{ name: string; text: string; file_text: string }>(
    `SELECT u.name, s.text, s.file_text FROM th_submission s JOIN "user" u ON u.id = s.user_id WHERE s.course_id=$1 AND s.assignment_no=$2 AND s.user_id <> $3`,
    [row.id, n, user.id],
  );
  const sources = [
    ...others.map((o) => ({ label: `Another learner's submission (${o.name})`, text: `${o.text}\n${o.file_text}` })),
    ...c.modules.flatMap((m, w) => m.lessons.map((l) => ({ label: `Course lesson: Week ${w + 1}, ${l.title}`, text: l.body }))),
  ];
  const report = similarity(`${text}\n${fileText}`, sources);

  await q(
    `INSERT INTO th_submission (user_id, course_id, assignment_no, text, file_name, file_type, file_data, file_text, declaration, similarity)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     ON CONFLICT (user_id, course_id, assignment_no) DO UPDATE SET text=EXCLUDED.text,
       file_name=coalesce(EXCLUDED.file_name, th_submission.file_name), file_type=coalesce(EXCLUDED.file_type, th_submission.file_type),
       file_data=coalesce(EXCLUDED.file_data, th_submission.file_data), file_text=CASE WHEN EXCLUDED.file_data IS NULL THEN th_submission.file_text ELSE EXCLUDED.file_text END,
       declaration=EXCLUDED.declaration, declared_at=now(), similarity=EXCLUDED.similarity, status='submitted', submitted_at=now()`,
    [user.id, row.id, n, text, fileName, fileType, fileData, fileText, theologyRules.declaration, JSON.stringify(report)],
  );
  refresh(slug);
  redirect(`${back}?sent=1`);
}
