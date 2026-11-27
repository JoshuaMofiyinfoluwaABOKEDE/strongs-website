import Link from "next/link";
import { revalidatePath } from "next/cache";
import { q } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { getArticle } from "@/content/articles";

type Row = { id: number; article: string; author: string; body: string; created_at: string; deleted: boolean; reports: number; reasons: string[] };

async function remove(form: FormData) {
  "use server";
  const admin = await requireAdmin();
  const id = Number(form.get("id"));
  await q(`UPDATE site_comment SET deleted_at = now(), deleted_by = $2 WHERE id = $1 AND deleted_at IS NULL`, [id, admin.id]);
  await q(`UPDATE site_comment_report SET resolved_at = now() WHERE comment_id = $1 AND resolved_at IS NULL`, [id]);
  revalidatePath("/admin/comments/");
}

async function restore(form: FormData) {
  "use server";
  await requireAdmin();
  await q(`UPDATE site_comment SET deleted_at = NULL, deleted_by = NULL WHERE id = $1`, [Number(form.get("id"))]);
  revalidatePath("/admin/comments/");
}

async function dismiss(form: FormData) {
  "use server";
  await requireAdmin();
  await q(`UPDATE site_comment_report SET resolved_at = now() WHERE comment_id = $1 AND resolved_at IS NULL`, [Number(form.get("id"))]);
  revalidatePath("/admin/comments/");
}

export default async function ArticleCommentsAdmin() {
  // Reported comments first, then the newest.
  const rows = await q<Row>(
    `SELECT c.id, c.article, u.name AS author, c.body, c.created_at, (c.deleted_at IS NOT NULL) AS deleted,
            count(r.comment_id) FILTER (WHERE r.resolved_at IS NULL)::int AS reports,
            array_remove(array_agg(NULLIF(r.reason, '')) FILTER (WHERE r.resolved_at IS NULL), NULL) AS reasons
       FROM site_comment c JOIN "user" u ON u.id = c.user_id LEFT JOIN site_comment_report r ON r.comment_id = c.id
      GROUP BY c.id, u.name
      ORDER BY (count(r.comment_id) FILTER (WHERE r.resolved_at IS NULL) > 0) DESC, c.created_at DESC
      LIMIT 150`,
  );
  return (
    <>
      <h1 className="text-2xl font-bold text-navy">Article comments</h1>
      <p className="text-muted">Comments on articles and poems in Resources. Reported comments come first. Removing a comment hides it from the article at once.</p>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-line p-6 text-muted">No comments yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((r) => (
            <li key={r.id} className={`flex flex-col gap-2 rounded-2xl border p-5 ${r.reports ? "border-gold" : "border-line"}`}>
              <p className="text-sm text-muted">
                <Link href={`/resources/${r.article}/#comments`}>{getArticle(r.article)?.title ?? r.article}</Link> · by {r.author} ·{" "}
                {new Date(r.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                {r.reports > 0 && <strong className="ml-2 rounded-full bg-gold px-2 text-xs text-navy">{r.reports} {r.reports === 1 ? "report" : "reports"}</strong>}
              </p>
              <p className={`whitespace-pre-wrap break-words rounded-xl bg-mist p-3 ${r.deleted ? "text-muted line-through" : ""}`}>{r.body}</p>
              {r.reasons.length > 0 && <p className="text-sm"><strong>Reasons:</strong> {r.reasons.join(" · ")}</p>}
              <div className="flex gap-3">
                {r.deleted ? (
                  <form action={restore}><input type="hidden" name="id" value={r.id} /><button className="btn btn-line min-h-10 cursor-pointer px-4 font-[inherit] text-sm">Restore</button></form>
                ) : (
                  <form action={remove}><input type="hidden" name="id" value={r.id} /><button className="btn btn-navy min-h-10 cursor-pointer border-0 px-4 font-[inherit] text-sm">Remove</button></form>
                )}
                {r.reports > 0 && !r.deleted && (
                  <form action={dismiss}><input type="hidden" name="id" value={r.id} /><button className="btn btn-line min-h-10 cursor-pointer px-4 font-[inherit] text-sm">Dismiss report</button></form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
