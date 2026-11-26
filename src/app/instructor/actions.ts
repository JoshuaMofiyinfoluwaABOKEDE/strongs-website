"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { one, q } from "@/lib/db";
import { requireInstructor } from "@/lib/session";
import { getTheologyCourse, percentOf, type Mark } from "@/lib/theology/content";
import { settleCourse } from "@/lib/theology/progress";

async function settle(userId: string, courseId: number) {
  const r = await one<{ slug: string; title: string }>(`SELECT slug, title FROM lms_course WHERE id = $1`, [courseId]);
  const c = r ? getTheologyCourse(r.slug) : null;
  if (r && c) await settleCourse(userId, c, { id: courseId, slug: r.slug, title: r.title });
  revalidatePath("/instructor/", "layout");
}

/** Grade an assignment (0–100) with feedback, or return it for revision. */
export async function gradeSubmission(form: FormData) {
  const me = await requireInstructor();
  const id = Number(form.get("id"));
  const decision = form.get("decision") === "return" ? "returned" : "graded";
  const feedback = String(form.get("feedback") ?? "").trim().slice(0, 5000);
  const score = Math.round(Number(form.get("score")));
  if (decision === "graded" && !(score >= 0 && score <= 100)) redirect(`/instructor/submissions/${id}/?error=score`);
  if (decision === "returned" && !feedback) redirect(`/instructor/submissions/${id}/?error=feedback`);
  const s = await one<{ user_id: string; course_id: number }>(
    `UPDATE th_submission SET status=$2, score=$3, feedback=$4, graded_by=$5, graded_at=now() WHERE id=$1 RETURNING user_id, course_id`,
    [id, decision, decision === "graded" ? score : null, feedback, me.name],
  );
  if (s) await settle(s.user_id, s.course_id);
  redirect(`/instructor/submissions/${id}/?saved=1`);
}

/** Change the marks on a test or exam (for example a short answer the key words missed). */
export async function overrideMarks(form: FormData) {
  const me = await requireInstructor();
  const id = Number(form.get("id"));
  const a = await one<{ user_id: string; course_id: number; marks: Record<string, Mark> }>(`SELECT user_id, course_id, marks FROM th_attempt WHERE id=$1 AND status='submitted'`, [id]);
  if (!a) redirect("/instructor/papers/");
  const marks = { ...a.marks };
  for (const [qid, m] of Object.entries(marks)) {
    const raw = form.get(`m_${qid}`);
    if (raw === null) continue;
    const v = String(raw).trim();
    if (v === "" || Number(v) === m.auto) marks[qid] = { ...m, override: null };
    else if (Number.isFinite(Number(v))) marks[qid] = { ...m, override: Math.max(0, Math.min(m.max, Number(v))) };
  }
  await q(`UPDATE th_attempt SET marks=$2, score=$3, reviewed_by=$4, reviewed_at=now() WHERE id=$1`, [id, JSON.stringify(marks), percentOf(marks), me.name]);
  await settle(a.user_id, a.course_id);
  redirect(`/instructor/papers/${id}/?saved=1`);
}
