import "server-only";
import { theologyRules } from "@/content/theology/catalog";
import type { TheologyCourse } from "@/content/theology/types";
import { one, q } from "@/lib/db";
import { newCertificateCode } from "@/lib/lms";
import { lessonKeys } from "@/lib/theology/content";

export type CourseRef = { id: number; slug: string; title: string };

/** The lms_course row behind a theology course (created by the sync on start-up). */
export async function courseRow(slug: string): Promise<CourseRef | null> {
  return one<CourseRef>(`SELECT id, slug, title FROM lms_course WHERE slug = $1 AND school = 'theology'`, [slug]);
}

export type Gradebook = {
  enrolled: boolean;
  lastKey: string | null;
  lessonsDone: Set<string>;
  lessonsTotal: number;
  /** Best quiz score for each week (index 0 = week 1), or null if not yet attempted. */
  quizBest: (number | null)[];
  quizzesPassed: number;
  testAttempts: { id: number; score: number | null; status: string; submitted_at: string | null }[];
  testBest: number | null;
  testOpen: number | null;
  exam: { id: number; score: number | null; status: string; deadline_at: string | null; submitted_at: string | null } | null;
  assignments: ({ id: number; status: string; score: number | null; feedback: string; submitted_at: string } | null)[];
  components: { quizzes: number; test: number; assignments: number; exam: number };
  total: number;
  parts: { lessons: boolean; quizzes: boolean; test: boolean; assignments: boolean; exam: boolean };
  complete: boolean;
  passed: boolean;
  percentDone: number;
};

export async function gradebook(userId: string, c: TheologyCourse, row: CourseRef): Promise<Gradebook> {
  const [enrol, done, attempts, subs] = await Promise.all([
    one<{ last_key: string | null }>(`SELECT last_key FROM lms_enrolment WHERE user_id = $1 AND course_id = $2`, [userId, row.id]),
    q<{ lesson_key: string }>(`SELECT lesson_key FROM th_lesson_done WHERE user_id = $1 AND course_id = $2`, [userId, row.id]),
    q<{ id: number; kind: string; week: number | null; score: number | null; status: string; deadline_at: string | null; submitted_at: string | null }>(
      `SELECT id, kind, week, score, status, deadline_at, submitted_at FROM th_attempt WHERE user_id = $1 AND course_id = $2 ORDER BY started_at`,
      [userId, row.id],
    ),
    q<{ id: number; assignment_no: number; status: string; score: number | null; feedback: string; submitted_at: string }>(
      `SELECT id, assignment_no, status, score, feedback, submitted_at FROM th_submission WHERE user_id = $1 AND course_id = $2`,
      [userId, row.id],
    ),
  ]);
  const keys = lessonKeys(c);
  const lessonsDone = new Set(done.map((d) => d.lesson_key).filter((k) => keys.includes(k)));
  const weeks = c.modules.length;
  const quizBest = Array.from({ length: weeks }, (_, i) => {
    const s = attempts.filter((a) => a.kind === "quiz" && a.week === i + 1 && a.status === "submitted").map((a) => a.score ?? 0);
    return s.length ? Math.max(...s) : null;
  });
  const quizzesPassed = quizBest.filter((s) => (s ?? 0) >= theologyRules.quiz.pass).length;
  const tests = attempts.filter((a) => a.kind === "test");
  const testScores = tests.filter((a) => a.status === "submitted").map((a) => a.score ?? 0);
  const exam = attempts.find((a) => a.kind === "exam") ?? null;
  const assignments = c.assignments.map((_, i) => subs.find((s) => s.assignment_no === i + 1) ?? null);
  const graded = assignments.filter((a) => a?.status === "graded");

  const components = {
    quizzes: Math.round(quizBest.reduce<number>((n, s) => n + (s ?? 0), 0) / Math.max(1, weeks)),
    test: testScores.length ? Math.max(...testScores) : 0,
    assignments: Math.round(assignments.reduce((n, a) => n + (a?.status === "graded" ? a.score ?? 0 : 0), 0) / Math.max(1, c.assignments.length)),
    exam: exam?.status === "submitted" ? exam.score ?? 0 : 0,
  };
  const w = theologyRules.weights;
  const total = Math.round((components.exam * w.exam + components.test * w.test + components.assignments * w.assignments + components.quizzes * w.quizzes) / 100);
  const parts = {
    lessons: lessonsDone.size === keys.length,
    quizzes: quizzesPassed === weeks,
    test: testScores.length > 0,
    assignments: graded.length === c.assignments.length,
    exam: exam?.status === "submitted",
  };
  const complete = Object.values(parts).every(Boolean);
  const steps = keys.length + weeks + 1 + c.assignments.length + 1;
  const stepsDone = lessonsDone.size + quizzesPassed + (parts.test ? 1 : 0) + graded.length + (parts.exam ? 1 : 0);
  return {
    enrolled: !!enrol,
    lastKey: enrol?.last_key ?? null,
    lessonsDone,
    lessonsTotal: keys.length,
    quizBest,
    quizzesPassed,
    testAttempts: tests.map((t) => ({ id: t.id, score: t.score, status: t.status, submitted_at: t.submitted_at })),
    testBest: testScores.length ? Math.max(...testScores) : null,
    testOpen: tests.find((t) => t.status === "open")?.id ?? null,
    exam: exam ? { id: exam.id, score: exam.score, status: exam.status, deadline_at: exam.deadline_at, submitted_at: exam.submitted_at } : null,
    assignments,
    components,
    total,
    parts,
    complete,
    passed: complete && total >= theologyRules.passMark,
    percentDone: Math.round((stepsDone / steps) * 100),
  };
}

/**
 * Records completion and issues the certificate once every part is done and the weighted
 * total is at least the pass mark. Safe to call any number of times.
 */
export async function settleCourse(userId: string, c: TheologyCourse, row: CourseRef) {
  const g = await gradebook(userId, c, row);
  if (!g.enrolled || !g.complete) return g;
  await q(`UPDATE lms_enrolment SET completed_at = coalesce(completed_at, now()) WHERE user_id = $1 AND course_id = $2`, [userId, row.id]);
  if (g.passed) {
    const exists = await one(`SELECT 1 FROM lms_certificate WHERE user_id = $1 AND course_id = $2`, [userId, row.id]);
    if (!exists) {
      const u = await one<{ name: string }>(`SELECT name FROM "user" WHERE id = $1`, [userId]);
      await q(
        `INSERT INTO lms_certificate (code, user_id, course_id, learner_name, course_title) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (user_id, course_id) DO NOTHING`,
        [newCertificateCode(), userId, row.id, u?.name ?? "Learner", row.title],
      );
    }
  }
  return g;
}

/** Progress for the My learning page: percent of steps done, for several theology courses at once. */
export async function theologySummary(userId: string, list: { course_id: number; slug: string }[], load: (slug: string) => TheologyCourse | null) {
  const out = new Map<number, { percentDone: number; total: number; complete: boolean; passed: boolean }>();
  for (const e of list) {
    const c = load(e.slug);
    if (!c) continue;
    const g = await gradebook(userId, c, { id: e.course_id, slug: e.slug, title: c.title });
    out.set(e.course_id, { percentDone: g.percentDone, total: g.total, complete: g.complete, passed: g.passed });
  }
  return out;
}
