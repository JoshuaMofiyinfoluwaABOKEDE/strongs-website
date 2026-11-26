import Link from "next/link";
import { AdminTitle, Badge, Notice, btnGhost, btnPrimary, date } from "@/components/admin/ui";
import { q } from "@/lib/db";
import { renderMarkdown } from "@/lib/markdown";
import { reviewSubmission } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/session";

export default async function Submissions({ searchParams }: { searchParams: Promise<{ status?: string; saved?: string; error?: string; open?: string }> }) {
  await requireAdmin();
  const { status = "pending", saved, error, open } = await searchParams;
  const rows = await q<{ id: number; user_id: string; name: string; email: string; lesson: string; lesson_body: string; course: string; slug: string; text: string; link: string; status: string; feedback: string; submitted_at: string; reviewed_by: string | null }>(
    `SELECT s.id, s.user_id, u.name, u.email, l.title AS lesson, l.body AS lesson_body, c.title AS course, c.slug, s.text, s.link, s.status, s.feedback, s.submitted_at, s.reviewed_by
     FROM lms_submission s JOIN "user" u ON u.id=s.user_id JOIN lms_lesson l ON l.id=s.lesson_id JOIN lms_module m ON m.id=l.module_id JOIN lms_course c ON c.id=m.course_id
     ${status === "all" ? "" : "WHERE s.status = $1"} ORDER BY s.submitted_at ${status === "pending" ? "ASC" : "DESC"} LIMIT 200`,
    status === "all" ? [] : [status],
  );
  return (
    <>
      <AdminTitle title="Assignments to review" intro="Approve practical assignments, or send them back with feedback. A lesson counts as complete once its assignment is approved." />
      {saved && <Notice>Review saved. The learner can see it now.</Notice>}
      {error === "feedback" && <Notice kind="error">When asking for a revision, write feedback so the learner knows what to change.</Notice>}
      <div className="flex flex-wrap gap-2 text-sm">
        {[["pending", "Waiting"], ["revise", "Sent back"], ["approved", "Approved"], ["all", "All"]].map(([k, l]) => (
          <Link key={k} href={`?status=${k}`} className={`rounded-full border px-3 py-1 no-underline ${status === k ? "border-royal text-royal" : "border-line text-navy"}`}>{l}</Link>
        ))}
      </div>
      {rows.length === 0 && <p className="text-muted">Nothing here.</p>}
      <ul className="flex flex-col gap-4">
        {rows.map((s) => (
          <li key={s.id} id={`s${s.id}`} className="scroll-mt-28 rounded-2xl border border-line bg-white p-5">
            <details open={String(s.id) === open || status === "pending"}>
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-semibold text-navy">{s.lesson}</span>
                <span className="text-sm text-muted">{s.course}</span>
                <span className="flex-1" />
                <Badge tone={s.status === "approved" ? "ok" : s.status === "pending" ? "gold" : "warn"}>{s.status === "revise" ? "Sent back" : s.status === "pending" ? "Waiting" : "Approved"}</Badge>
                <span className="w-full text-sm text-muted">
                  <Link href={`/admin/students/${s.user_id}/`}>{s.name}</Link> · {s.email} · handed in {date(s.submitted_at)}{s.reviewed_by && ` · reviewed by ${s.reviewed_by}`}
                </span>
              </summary>
              <div className="mt-4 flex flex-col gap-4">
                <details className="rounded-xl bg-mist p-3 text-sm"><summary className="cursor-pointer font-semibold text-navy">The assignment</summary><div className="lesson-text pt-2 text-[0.9375rem]" dangerouslySetInnerHTML={{ __html: renderMarkdown(s.lesson_body) }} /></details>
                {s.text && <div className="whitespace-pre-wrap rounded-xl border border-line p-4 text-[0.9375rem] text-ink">{s.text}</div>}
                {s.link && <p className="text-sm">Link: <a href={s.link} target="_blank" rel="noopener noreferrer">{s.link}</a></p>}
                <form action={reviewSubmission} className="flex flex-col gap-3">
                  <input type="hidden" name="id" value={s.id} />
                  <label className="label">Feedback to the learner<textarea name="feedback" defaultValue={s.feedback} rows={3} className="field py-2" /></label>
                  <div className="flex flex-wrap gap-2">
                    <button type="submit" name="decision" value="approved" className={btnPrimary}>Approve</button>
                    <button type="submit" name="decision" value="revise" className={btnGhost}>Ask for a revision</button>
                  </div>
                </form>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </>
  );
}
