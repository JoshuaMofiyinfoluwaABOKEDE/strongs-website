import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { hasDatabase, one } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getTheologyCourse } from "@/lib/theology/content";
import { closeExpiredExam } from "@/lib/theology/marking";
import { courseRow, gradebook } from "@/lib/theology/progress";

/** Everything a theology learner page needs. Redirects anyone not signed in or not enrolled. */
export const loadTheology = cache(async function loadTheology(slug: string) {
  if (!hasDatabase) redirect(`/courses/theology/${slug}/`);
  const user = await requireUser(`/theology/${slug}/`);
  const c = getTheologyCourse(slug);
  if (!c) notFound();
  const row = await courseRow(slug);
  if (!row) notFound();
  const enrolled = await one(`SELECT 1 FROM lms_enrolment WHERE user_id = $1 AND course_id = $2`, [user.id, row.id]);
  if (!enrolled) redirect(`/courses/theology/${slug}/`);
  await closeExpiredExam(user.id, slug);
  const g = await gradebook(user.id, c, row);
  return { user, c, row, g };
});
