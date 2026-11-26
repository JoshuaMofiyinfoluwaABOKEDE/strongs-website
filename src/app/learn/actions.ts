"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { one, q } from "@/lib/db";
import { assessmentHref, checkCompletion, getOutline, getProgress, lessonHref, nextStep, type QuestionRow } from "@/lib/lms";
import { requireUser } from "@/lib/session";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const int = (f: FormData, k: string) => Number.parseInt(str(f, k), 10);

/** Enrol in a course (free), then go to its first lesson. */
export async function enrol(form: FormData) {
  const slug = str(form, "slug");
  const user = await requireUser(`/courses/${slug}/`);
  const o = await getOutline(slug);
  if (!o || !o.course.enrolment_open) redirect(`/courses/${slug}/`);
  await q(`INSERT INTO lms_enrolment (user_id, course_id) VALUES ($1, $2) ON CONFLICT (user_id, course_id) DO NOTHING`, [user.id, o.course.id]);
  revalidatePath("/dashboard/");
  redirect(`/learn/${slug}/`);
}

/** Load a lesson's course and confirm the learner may open it. */
async function lessonContext(lessonId: number) {
  const user = await requireUser();
  const row = await one<{ course_id: number; slug: string; kind: string }>(
    `SELECT c.id AS course_id, c.slug, l.kind FROM lms_lesson l JOIN lms_module m ON m.id = l.module_id JOIN lms_course c ON c.id = m.course_id
     WHERE l.id = $1 AND l.published`,
    [lessonId],
  );
  if (!row) redirect("/dashboard/");
  const enrolled = await one(`SELECT 1 FROM lms_enrolment WHERE user_id = $1 AND course_id = $2`, [user.id, row.course_id]);
  if (!enrolled) redirect(`/courses/${row.slug}/`);
  return { user, ...row };
}

/** Mark a reading lesson as done and go to the next step. */
export async function completeLesson(form: FormData) {
  const lessonId = int(form, "lessonId");
  const { user, course_id, slug, kind } = await lessonContext(lessonId);
  if (kind === "reading") {
    await q(`INSERT INTO lms_lesson_progress (user_id, lesson_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [user.id, lessonId]);
  }
  await q(`UPDATE lms_enrolment SET last_active_at = now() WHERE user_id = $1 AND course_id = $2`, [user.id, course_id]);
  await checkCompletion(user.id, course_id);
  revalidatePath(`/learn/${slug}/`, "layout");
  revalidatePath("/dashboard/");
  await goNext(user.id, slug);
}

async function goNext(userId: string, slug: string) {
  const o = await getOutline(slug);
  if (!o) redirect("/dashboard/");
  const p = await getProgress(userId, o);
  const n = nextStep(o, p);
  if (!n) redirect(`/learn/${slug}/?done=1`);
  redirect(n.type === "lesson" ? lessonHref(slug, n.lesson.id) : assessmentHref(slug, n.assessment.id));
}

/** Hand in (or re-submit) a practical assignment for review. */
export async function submitAssignment(form: FormData) {
  const lessonId = int(form, "lessonId");
  const { user, slug, kind } = await lessonContext(lessonId);
  if (kind !== "assignment") redirect(lessonHref(slug, lessonId));
  const text = str(form, "text").slice(0, 20000);
  const link = str(form, "link").slice(0, 500);
  if (!text && !link) redirect(`${lessonHref(slug, lessonId)}?error=empty`);
  if (link && !/^https?:\/\//i.test(link)) redirect(`${lessonHref(slug, lessonId)}?error=link`);
  await q(
    `INSERT INTO lms_submission (user_id, lesson_id, text, link) VALUES ($1,$2,$3,$4)
     ON CONFLICT (user_id, lesson_id) DO UPDATE SET text = EXCLUDED.text, link = EXCLUDED.link, status = CASE WHEN lms_submission.status = 'approved' THEN 'approved' ELSE 'pending' END, submitted_at = now()`,
    [user.id, lessonId, text, link],
  );
  revalidatePath(lessonHref(slug, lessonId));
  redirect(`${lessonHref(slug, lessonId)}?sent=1`);
}

/** Mark a quiz or final assessment and record the attempt. */
export async function submitAssessment(form: FormData) {
  const user = await requireUser();
  const assessmentId = int(form, "assessmentId");
  const a = await one<{ id: number; course_id: number; pass_mark: number; slug: string }>(
    `SELECT a.id, a.course_id, a.pass_mark, c.slug FROM lms_assessment a JOIN lms_course c ON c.id = a.course_id WHERE a.id = $1 AND a.published`,
    [assessmentId],
  );
  if (!a) redirect("/dashboard/");
  const enrolled = await one(`SELECT 1 FROM lms_enrolment WHERE user_id = $1 AND course_id = $2`, [user.id, a.course_id]);
  if (!enrolled) redirect(`/courses/${a.slug}/`);

  const questions = await q<QuestionRow>(`SELECT * FROM lms_question WHERE assessment_id = $1 ORDER BY position, id`, [assessmentId]);
  if (!questions.length) redirect(assessmentHref(a.slug, assessmentId));
  const answers: Record<string, string[]> = {};
  let right = 0;
  for (const qn of questions) {
    const given = form.getAll(`q${qn.id}`).map(String).sort();
    answers[qn.id] = given;
    const want = [...qn.correct].sort();
    if (given.length === want.length && given.every((g, i) => g === want[i])) right++;
  }
  const score = Math.round((right / questions.length) * 100);
  const passed = score >= a.pass_mark;
  const row = await one<{ id: number }>(
    `INSERT INTO lms_attempt (user_id, assessment_id, score, passed, answers) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [user.id, assessmentId, score, passed, JSON.stringify(answers)],
  );
  await q(`UPDATE lms_enrolment SET last_active_at = now() WHERE user_id = $1 AND course_id = $2`, [user.id, a.course_id]);
  if (passed) await checkCompletion(user.id, a.course_id);
  revalidatePath(`/learn/${a.slug}/`, "layout");
  revalidatePath("/dashboard/");
  redirect(`${assessmentHref(a.slug, assessmentId)}?attempt=${row!.id}`);
}

/** The name printed on certificates. */
export async function updateName(form: FormData) {
  const user = await requireUser();
  const name = str(form, "name").replace(/\s+/g, " ").slice(0, 80);
  if (name.length < 2) redirect("/dashboard/?error=name");
  await q(`UPDATE "user" SET name = $2, "updatedAt" = now() WHERE id = $1`, [user.id, name]);
  revalidatePath("/dashboard/");
  redirect("/dashboard/?saved=1");
}
