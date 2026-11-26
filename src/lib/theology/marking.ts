import "server-only";
import type { TheologyCourse } from "@/content/theology/types";
import { one, q } from "@/lib/db";
import { autoMark, findQuestion, getTheologyCourse, percentOf, type Mark, type PaperItem } from "@/lib/theology/content";
import { courseRow, settleCourse } from "@/lib/theology/progress";

/** Seconds allowed after the deadline for a slow connection to deliver the answers. */
export const GRACE_SECONDS = 90;

export type AttemptRow = { id: number; user_id: string; course_id: number; kind: string; week: number | null; questions: PaperItem[]; answers: Record<string, string>; status: string; deadline_at: string | null };

export function markPaper(c: TheologyCourse, paper: PaperItem[], answers: Record<string, string>) {
  const marks: Record<string, Mark> = {};
  for (const item of paper) {
    const qn = findQuestion(c, item.id);
    if (qn) marks[item.id] = autoMark(qn, item, answers[item.id]);
  }
  return { marks, score: percentOf(marks) };
}

export async function finishExam(a: AttemptRow, c: TheologyCourse, answers: Record<string, string>) {
  const { marks, score } = markPaper(c, a.questions, answers);
  await q(`UPDATE th_attempt SET answers=$2, marks=$3, score=$4, status='submitted', submitted_at=now() WHERE id=$1 AND status='open'`, [a.id, JSON.stringify(answers), JSON.stringify(marks), score]);
}

/** Closes an exam whose time has run out, marking the answers that were saved. */
export async function closeExpiredExam(userId: string, slug: string) {
  const c = getTheologyCourse(slug);
  const row = c ? await courseRow(slug) : null;
  if (!c || !row) return;
  const a = await one<AttemptRow>(
    `SELECT id, user_id, course_id, kind, week, questions, answers, status, deadline_at FROM th_attempt
     WHERE user_id=$1 AND course_id=$2 AND kind='exam' AND status='open' AND deadline_at < now() - make_interval(secs => $3)`,
    [userId, row.id, GRACE_SECONDS],
  );
  if (!a) return;
  await finishExam(a, c, a.answers ?? {});
  await settleCourse(userId, c, row);
}
