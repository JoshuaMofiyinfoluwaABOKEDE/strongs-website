import Link from "next/link";
import { AdminTitle, Badge, btnGhost, date } from "@/components/admin/ui";
import { q } from "@/lib/db";
import { requireInstructor } from "@/lib/session";

export default async function Papers({ searchParams }: { searchParams: Promise<{ kind?: string; show?: string }> }) {
  await requireInstructor();
  const { kind = "", show = "new" } = await searchParams;
  const args: unknown[] = [];
  const where = [`a.kind IN ('test','exam')`];
  if (kind) { args.push(kind); where.push(`a.kind = $${args.length}`); }
  if (show === "new") where.push(`a.status='submitted' AND a.reviewed_at IS NULL`);
  if (show === "open") where.push(`a.status='open'`);
  const rows = await q<{ id: number; name: string; title: string; kind: string; status: string; score: number | null; started_at: string; submitted_at: string | null; deadline_at: string | null; reviewed_by: string | null }>(
    `SELECT a.id, u.name, c.title, a.kind, a.status, a.score, a.started_at, a.submitted_at, a.deadline_at, a.reviewed_by
     FROM th_attempt a JOIN "user" u ON u.id=a.user_id JOIN lms_course c ON c.id=a.course_id WHERE ${where.join(" AND ")} ORDER BY coalesce(a.submitted_at, a.started_at) DESC LIMIT 300`,
    args,
  );
  return (
    <>
      <AdminTitle title="Tests and exams" intro="Check the short answers and lists that were marked by key words, and change any mark that is unfair." />
      <form className="flex flex-wrap gap-2">
        <select name="show" defaultValue={show} className="field w-56"><option value="new">Not yet reviewed</option><option value="all">All submitted</option><option value="open">In progress</option></select>
        <select name="kind" defaultValue={kind} className="field w-40"><option value="">Tests and exams</option><option value="test">Tests</option><option value="exam">Exams</option></select>
        <button type="submit" className={btnGhost}>Show</button>
      </form>
      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-mist text-xs uppercase tracking-wide text-muted"><tr><th className="px-4 py-3">Learner</th><th className="px-3">Course</th><th className="px-3">Paper</th><th className="px-3">Score</th><th className="px-3">Date</th></tr></thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-muted">Nothing here.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3"><Link href={`/instructor/papers/${r.id}/`} className="font-semibold">{r.name}</Link></td>
                <td className="px-3 py-3">{r.title}</td>
                <td className="px-3 py-3">{r.kind === "exam" ? "Final exam" : "Test"}</td>
                <td className="px-3 py-3">{r.status === "open" ? <Badge tone="gold">In progress</Badge> : <>{r.score}% {r.reviewed_by && <Badge tone="ok">Reviewed</Badge>}</>}</td>
                <td className="px-3 py-3">{date(r.submitted_at ?? r.started_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
