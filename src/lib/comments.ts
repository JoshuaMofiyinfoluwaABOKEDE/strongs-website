import "server-only";
import { one, q } from "@/lib/db";
import { getArticle } from "@/content/articles";
import type { SessionUser } from "@/lib/session";

/** A comment as the article page shows it. Email addresses are never sent to the browser. */
export type CommentView = {
  id: number;
  parentId: number | null;
  name: string;
  staff: boolean;
  body: string;
  createdAt: string;
  deleted: boolean;
  mine: boolean;
};

export const isArticle = (slug: string) => !!getArticle(slug);
export const isModerator = (u: SessionUser | null) => !!u && (u.role === "admin" || u.role === "instructor");

type Row = { id: number; parent_id: number | null; user_id: string; name: string; role: string | null; body: string; created_at: string; deleted: boolean };

export async function listComments(article: string, me: SessionUser | null): Promise<CommentView[]> {
  const rows = await q<Row>(
    `SELECT c.id, c.parent_id, c.user_id, u.name, u.role, c.body, c.created_at, (c.deleted_at IS NOT NULL) AS deleted
       FROM site_comment c JOIN "user" u ON u.id = c.user_id
      WHERE c.article = $1
      ORDER BY c.created_at
      LIMIT 500`,
    [article],
  );
  // A removed comment stays as a placeholder only if someone replied to it.
  const hasReplies = new Set(rows.filter((r) => r.parent_id).map((r) => r.parent_id));
  return rows
    .filter((r) => !r.deleted || hasReplies.has(r.id))
    .map((r) => ({
      id: r.id,
      parentId: r.parent_id,
      name: r.deleted ? "" : r.name,
      staff: r.role === "admin" || r.role === "instructor",
      body: r.deleted ? "" : r.body,
      createdAt: new Date(r.created_at).toISOString(),
      deleted: r.deleted,
      mine: !!me && r.user_id === me.id,
    }));
}

export async function addComment(article: string, user: SessionUser, rawBody: string, parentRaw: number | null): Promise<string | null> {
  const body = rawBody.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, 1500);
  if (body.length < 2) return "Please write something before posting.";
  const recent = await one<{ n: number }>(`SELECT count(*)::int AS n FROM site_comment WHERE user_id = $1 AND created_at > now() - interval '1 hour'`, [user.id]);
  if ((recent?.n ?? 0) >= 20) return "You have commented a lot in the last hour. Please wait a little.";
  let parent: number | null = null;
  if (parentRaw) {
    const p = await one<{ id: number; parent_id: number | null }>(`SELECT id, parent_id FROM site_comment WHERE id = $1 AND article = $2 AND deleted_at IS NULL`, [parentRaw, article]);
    if (!p) return "That comment is no longer there.";
    parent = p.parent_id ?? p.id; // replies stay one level deep
  }
  await q(`INSERT INTO site_comment (article, user_id, parent_id, body) VALUES ($1, $2, $3, $4)`, [article, user.id, parent, body]);
  return null;
}

/** The author, or a moderator, removes a comment. */
export async function removeComment(article: string, user: SessionUser, id: number) {
  await q(
    `UPDATE site_comment SET deleted_at = now(), deleted_by = $3 WHERE id = $1 AND article = $2 AND deleted_at IS NULL AND (user_id = $3 OR $4::boolean)`,
    [id, article, user.id, isModerator(user)],
  );
  await q(`UPDATE site_comment_report SET resolved_at = now() WHERE comment_id = $1 AND resolved_at IS NULL`, [id]);
}

export async function reportComment(article: string, user: SessionUser, id: number, reason: string) {
  await q(
    `INSERT INTO site_comment_report (comment_id, user_id, reason) SELECT id, $2, $3 FROM site_comment WHERE id = $1 AND article = $4
     ON CONFLICT (comment_id, user_id) DO NOTHING`,
    [id, user.id, reason.slice(0, 300), article],
  );
}
