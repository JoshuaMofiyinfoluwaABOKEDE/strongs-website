"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { one, q } from "@/lib/db";
import { forumAccess } from "@/lib/forum";
import { requireUser } from "@/lib/session";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const back = (slug: string, extra = "") => `/forum/${slug}/${extra}`;

/** Start a discussion, or reply to one. */
export async function createPost(form: FormData) {
  const slug = str(form, "slug");
  const user = await requireUser(back(slug));
  const access = await forumAccess(slug, user);
  if (!access) redirect("/courses/");
  if (!access.canPost) redirect(back(slug, "?error=enrol"));

  const body = str(form, "body").replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").slice(0, 2000);
  if (body.length < 2) redirect(back(slug, "?error=empty"));

  // A simple guard against flooding: 30 posts an hour per person.
  const recent = await one<{ n: number }>(`SELECT count(*)::int AS n FROM lms_forum_post WHERE user_id = $1 AND created_at > now() - interval '1 hour'`, [user.id]);
  if ((recent?.n ?? 0) >= 30) redirect(back(slug, "?error=slow"));

  const parentRaw = Number(str(form, "parent"));
  let parent: number | null = null;
  if (parentRaw) {
    const p = await one<{ id: number; parent_id: number | null }>(`SELECT id, parent_id FROM lms_forum_post WHERE id = $1 AND course_id = $2 AND deleted_at IS NULL`, [parentRaw, access.course.id]);
    if (!p) redirect(back(slug));
    parent = p.parent_id ?? p.id; // replies stay one level deep
  }
  const row = await one<{ id: number }>(
    `INSERT INTO lms_forum_post (course_id, user_id, parent_id, body) VALUES ($1, $2, $3, $4) RETURNING id`,
    [access.course.id, user.id, parent, body],
  );
  if (parent) await q(`UPDATE lms_forum_post SET last_activity_at = now() WHERE id = $1`, [parent]);
  revalidatePath(back(slug));
  redirect(back(slug, `#post-${parent ?? row?.id}`));
}

/** The author, or a moderator, removes a post. */
export async function deletePost(form: FormData) {
  const slug = str(form, "slug");
  const user = await requireUser(back(slug));
  const access = await forumAccess(slug, user);
  if (!access) redirect("/courses/");
  const id = Number(str(form, "id"));
  await q(
    `UPDATE lms_forum_post SET deleted_at = now(), deleted_by = $3 WHERE id = $1 AND course_id = $2 AND deleted_at IS NULL AND (user_id = $3 OR $4::boolean)`,
    [id, access.course.id, user.id, access.moderator],
  );
  await q(`UPDATE lms_forum_report SET resolved_at = now() WHERE post_id = $1 AND resolved_at IS NULL`, [id]);
  revalidatePath(back(slug));
  redirect(back(slug));
}

/** Flag a post for the STRONGS team to review. */
export async function reportPost(form: FormData) {
  const slug = str(form, "slug");
  const user = await requireUser(back(slug));
  const access = await forumAccess(slug, user);
  if (!access?.canPost) redirect(back(slug));
  const id = Number(str(form, "id"));
  await q(
    `INSERT INTO lms_forum_report (post_id, user_id, reason) SELECT id, $2, $3 FROM lms_forum_post WHERE id = $1 AND course_id = $4
     ON CONFLICT (post_id, user_id) DO NOTHING`,
    [id, user.id, str(form, "reason").slice(0, 300), access.course.id],
  );
  redirect(back(slug, "?reported=1"));
}
