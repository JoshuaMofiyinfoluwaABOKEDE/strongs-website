import Link from "next/link";
import { AdminTitle, Badge, btnGhost, date } from "@/components/admin/ui";
import { q } from "@/lib/db";
import { requireInstructor } from "@/lib/session";

export default async function Submissions({ searchParams }: { searchParams: Promise<{ status?: string; course?: string }> }) {
  await requireInstructor();
  const { status = "submitted", course } = await searchParams;
  const courses = await q<{ id: number; title: string }>(`SELECT id, title FROM lms_course WHERE school='theology' ORDER BY position`);
  const args: unknown[] = [];
  const where: string[] = [];
  if (status !== "all") { args.push(status); where.push(`s.status = $${args.length}`); }
  if (course) { args.push(Number(course)); where.push(`s.course_id = $${args.length}`); }
  const rows = await q<{ id: number; name: string; email: string; title: string; assignment_no: number; status: string; score: number | null; submitted_at: string; overall: number | null }>(
    `SELECT s.id, u.name, u.email, c.title, s.assignment_no, s.status, s.score, s.submitted_at, (s.similarity->>'overall')::int AS overall
     FROM th_submission s JOIN "user" u ON u.id=s.user_id JOIN lms_course c ON c.id=s.course_id
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY s.submitted_at ${status === "submitted" ? "ASC" : "DESC"} LIMIT 300`,
    args,
  );
  return (
    <>
      <AdminTitle title="Assignments" intro="Oldest first. Open one to read it, check the similarity report and grade it." />
      <form className="flex flex-wrap gap-2">
        <select name="status" defaultValue={status} className="field w-48"><option value="submitted">To grade</option><option value="returned">Returned for revision</option><option value="graded">Graded</option><option value="all">All</option></select>
        <select name="course" defaultValue={course ?? ""} className="field w-80"><option value="">All courses</option>{courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
        <button type="submit" className={btnGhost}>Show</button>
      </form>
      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="bg-mist text-xs uppercase tracking-wide text-muted"><tr><th className="px-4 py-3">Learner</th><th className="px-3">Course</th><th className="px-3">Similarity</th><th className="px-3">Handed in</th><th className="px-3">Status</th></tr></thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-muted">Nothing here.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3"><Link href={`/instructor/submissions/${r.id}/`} className="font-semibold">{r.name}</Link><p className="text-xs text-muted">{r.email}</p></td>
                <td className="px-3 py-3">{r.title}<p className="text-xs text-muted">Assignment {r.assignment_no}</p></td>
                <td className="px-3 py-3">{r.overall == null ? "–" : <Badge tone={r.overall >= 30 ? "warn" : r.overall >= 10 ? "gold" : "ok"}>{r.overall}%</Badge>}</td>
                <td className="px-3 py-3">{date(r.submitted_at)}</td>
                <td className="px-3 py-3">{r.status === "graded" ? <Badge tone="ok">{r.score}/100</Badge> : r.status === "returned" ? <Badge tone="warn">Returned</Badge> : <Badge tone="gold">To grade</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
