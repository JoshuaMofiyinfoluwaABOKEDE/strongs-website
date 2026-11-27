import Link from "next/link";
import { revalidatePath } from "next/cache";
import { q } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

type Row = { post_id: number; slug: string; title: string; author: string; body: string; deleted: boolean; reasons: string[]; reporters: number; first: string };

async function dismiss(form: FormData) {
  "use server";
  await requireAdmin();
  await q(`UPDATE lms_forum_report SET resolved_at = now() WHERE post_id = $1 AND resolved_at IS NULL`, [Number(form.get("id"))]);
  revalidatePath("/admin/forum/");
}

async function remove(form: FormData) {
  "use server";
  const admin = await requireAdmin();
  const id = Number(form.get("id"));
  await q(`UPDATE lms_forum_post SET deleted_at = now(), deleted_by = $2 WHERE id = $1 AND deleted_at IS NULL`, [id, admin.id]);
  await q(`UPDATE lms_forum_report SET resolved_at = now() WHERE post_id = $1 AND resolved_at IS NULL`, [id]);
  revalidatePath("/admin/forum/");
}

export default async function ForumReports() {
  const rows = await q<Row>(
    `SELECT r.post_id, c.slug, c.title, u.name AS author, p.body, (p.deleted_at IS NOT NULL) AS deleted,
            array_remove(array_agg(NULLIF(r.reason, '')), NULL) AS reasons, count(*)::int AS reporters, min(r.created_at) AS first
       FROM lms_forum_report r JOIN lms_forum_post p ON p.id = r.post_id JOIN lms_course c ON c.id = p.course_id JOIN "user" u ON u.id = p.user_id
      WHERE r.resolved_at IS NULL
      GROUP BY r.post_id, c.slug, c.title, u.name, p.body, p.deleted_at
      ORDER BY min(r.created_at)`,
  );
  return (
    <>
      <h1 className="text-2xl font-bold text-navy">Forum reports</h1>
      <p className="text-muted">Posts that learners have reported in course forums. Remove a post, or dismiss the report if it is fine. Admins and instructors can also delete any post directly in a forum.</p>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-line p-6 text-muted">Nothing to review.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((r) => (
            <li key={r.post_id} className="flex flex-col gap-2 rounded-2xl border border-line p-5">
              <p className="text-sm text-muted">
                <Link href={`/forum/${r.slug}/#post-${r.post_id}`}>{r.title}</Link> · by {r.author} · {r.reporters} {r.reporters === 1 ? "report" : "reports"}
              </p>
              <p className="whitespace-pre-wrap break-words rounded-xl bg-mist p-3">{r.deleted ? <em>Already removed.</em> : r.body}</p>
              {r.reasons.length > 0 && <p className="text-sm"><strong>Reasons:</strong> {r.reasons.join(" · ")}</p>}
              <div className="flex gap-3">
                <form action={remove}><input type="hidden" name="id" value={r.post_id} /><button className="btn btn-navy min-h-10 cursor-pointer border-0 px-4 font-[inherit] text-sm">Remove post</button></form>
                <form action={dismiss}><input type="hidden" name="id" value={r.post_id} /><button className="btn btn-line min-h-10 cursor-pointer px-4 font-[inherit] text-sm">Dismiss</button></form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
