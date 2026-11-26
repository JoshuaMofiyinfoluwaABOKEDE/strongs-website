import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { hasDatabase } from "@/lib/db";
import { getOutline, getProgress } from "@/lib/lms";
import { requireUser } from "@/lib/session";

/** Everything a learner page needs: the signed-in learner, the course outline and their progress. */
export const loadLearner = cache(async function loadLearner(slug: string) {
  if (!hasDatabase) redirect(`/courses/${slug}/`);
  const user = await requireUser(`/learn/${slug}/`);
  const outline = await getOutline(slug);
  if (!outline) notFound();
  const progress = await getProgress(user.id, outline);
  if (!progress.enrolled) redirect(`/courses/${slug}/`);
  return { user, outline, progress };
});
