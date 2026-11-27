import "server-only";
import { one, q } from "@/lib/db";
import { ensureReady } from "@/lib/setup";
import type { SessionUser } from "@/lib/session";

/** A course's discussion forum: its course, and whether this person may take part. */
export type ForumCourse = { id: number; slug: string; title: string; school: string | null };
export type ForumAccess = { course: ForumCourse; canPost: boolean; moderator: boolean; enrolled: boolean };

export async function forumAccess(slug: string, user: SessionUser | null): Promise<ForumAccess | null> {
  await ensureReady();
  const course = await one<ForumCourse>(`SELECT id, slug, title, school FROM lms_course WHERE slug = $1`, [slug]);
  if (!course) return null;
  const moderator = !!user && (user.role === "admin" || user.role === "instructor");
  const enrolled = !!user && !!(await one(`SELECT 1 FROM lms_enrolment WHERE user_id = $1 AND course_id = $2`, [user.id, course.id]));
  return { course, moderator, enrolled, canPost: enrolled || moderator };
}

/** Where the course itself lives, so the forum can link back to it. */
export const courseHome = (c: ForumCourse, enrolled: boolean) =>
  c.school === "theology" ? (enrolled ? `/theology/${c.slug}/` : `/courses/theology/${c.slug}/`) : enrolled ? `/learn/${c.slug}/` : `/courses/${c.slug}/`;

export type Post = {
  id: number;
  parent_id: number | null;
  user_id: string;
  name: string;
  role: string;
  body: string;
  created_at: string;
  deleted: boolean;
  location: string;
  phone: string | null;
};

export async function getThreads(courseId: number, limit = 40): Promise<{ thread: Post; replies: Post[] }[]> {
  const cols = `p.id, p.parent_id, p.user_id, u.name, u.role, p.body, p.created_at, (p.deleted_at IS NOT NULL) AS deleted,
    COALESCE(pr.location, '') AS location, CASE WHEN pr.share_phone THEN NULLIF(pr.phone, '') END AS phone`;
  const from = `FROM lms_forum_post p JOIN "user" u ON u.id = p.user_id LEFT JOIN lms_profile pr ON pr.user_id = p.user_id`;
  const threads = await q<Post>(`SELECT ${cols} ${from} WHERE p.course_id = $1 AND p.parent_id IS NULL ORDER BY p.last_activity_at DESC LIMIT $2`, [courseId, limit]);
  if (!threads.length) return [];
  const replies = await q<Post>(`SELECT ${cols} ${from} WHERE p.parent_id = ANY($1::int[]) ORDER BY p.created_at`, [threads.map((t) => t.id)]);
  return threads.map((t) => ({ thread: t, replies: replies.filter((r) => r.parent_id === t.id) }));
}

export type Classmate = { user_id: string; name: string; location: string; languages: string; about: string; phone: string | null; enrolled_at: string };

/** Everyone enrolled in the course. Phone numbers only for those who chose to share them. */
export async function getClassmates(courseId: number): Promise<Classmate[]> {
  return q<Classmate>(
    `SELECT e.user_id, u.name, COALESCE(pr.location, '') AS location, COALESCE(pr.languages, '') AS languages, COALESCE(pr.about, '') AS about,
            CASE WHEN pr.share_phone THEN NULLIF(pr.phone, '') END AS phone, e.enrolled_at
       FROM lms_enrolment e JOIN "user" u ON u.id = e.user_id LEFT JOIN lms_profile pr ON pr.user_id = e.user_id
      WHERE e.course_id = $1 ORDER BY e.enrolled_at DESC LIMIT 500`,
    [courseId],
  );
}

export async function postCount(courseId: number): Promise<number> {
  const r = await one<{ n: number }>(`SELECT count(*)::int AS n FROM lms_forum_post WHERE course_id = $1 AND deleted_at IS NULL`, [courseId]);
  return r?.n ?? 0;
}

/** Digits only, with a Nigerian 0 turned into 234, for wa.me and tel: links. */
export function phoneDigits(phone: string): string {
  const d = phone.replace(/\D/g, "");
  return d.startsWith("0") && d.length === 11 ? `234${d.slice(1)}` : d;
}
