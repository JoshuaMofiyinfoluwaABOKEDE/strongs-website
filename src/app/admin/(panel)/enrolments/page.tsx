import Link from "next/link";
import { AdminTitle, Badge, btnGhost, date } from "@/components/admin/ui";
import { q } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

const PAGE = 100;

export default async function Enrolments({ searchParams }: { searchParams: Promise<{ course?: string; status?: string; page?: string }> }) {
  await requireAdmin();
  const { course, status, page = "1" } = await searchParams;
  const p = Math.max(1, Number(page) || 1);
  const courses = await q<{ id: number; title: string }>(`SELECT id, title FROM lms_course ORDER BY title`);
  const where: string[] = [];
  const args: unknown[] = [];
  if (course) { args.push(Number(course)); where.push(`e.course_id = $${args.length}`); }
  if (status === "completed") where.push(`e.completed_at IS NOT NULL`);
  if (status === "active") where.push(`e.completed_at IS NULL`);
  const w = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const rows = await q<{ user_id: string; name: string; email: string; course_id: number; title: string; enrolled_at: string; last_active_at: string; completed_at: string | null; done: number; total: number }>(
    `SELECT e.user_id, u.name, u.email, e.course_id, c.title, e.enrolled_at, e.last_active_at, e.completed_at,
       (SELECT count(*)::int FROM lms_lesson_progress lp JOIN lms_lesson l ON l.id=lp.lesson_id JOIN lms_module m ON m.id=l.module_id WHERE lp.user_id=e.user_id AND m.course_id=e.course_id AND l.published)
       + (SELECT count(DISTINCT t.assessment_id)::int FROM lms_attempt t JOIN lms_assessment a ON a.id=t.assessment_id WHERE t.user_id=e.user_id AND a.course_id=e.course_id AND a.published AND t.passed) AS done,
       (SELECT count(*)::int FROM lms_lesson l JOIN lms_module m ON m.id=l.module_id WHERE m.course_id=e.course_id AND l.published)
       + (SELECT count(*)::int FROM lms_assessment a WHERE a.course_id=e.course_id AND a.published) AS total
     FROM lms_enrolment e JOIN "user" u ON u.id=e.user_id JOIN lms_course c ON c.id=e.course_id ${w}
     ORDER BY e.last_active_at DESC LIMIT ${PAGE} OFFSET ${(p - 1) * PAGE}`,
    args,
  );
  return (
    <>
      <AdminTitle title="Enrolments" intro="Who is taking which course, and how far they have got." />
      <form className="flex flex-wrap gap-2">
        <select name="course" defaultValue={course ?? ""} className="field w-72"><option value="">All courses</option>{courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
        <select name="status" defaultValue={status ?? ""} className="field w-44"><option value="">Any status</option><option value="active">In progress</option><option value="completed">Completed</option></select>
        <button type="submit" className={btnGhost}>Filter</button>
      </form>
      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="bg-mist text-xs uppercase tracking-wide text-muted">
            <tr><th className="px-4 py-3">Learner</th><th className="px-3">Course</th><th className="px-3">Progress</th><th className="px-3">Enrolled</th><th className="px-3">Last studied</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-muted">No enrolments.</td></tr>}
            {rows.map((r) => {
              const pc = r.total ? Math.round((r.done / r.total) * 100) : 0;
              return (
                <tr key={`${r.user_id}-${r.course_id}`}>
                  <td className="px-4 py-3"><Link href={`/admin/students/${r.user_id}/`} className="font-semibold">{r.name}</Link><p className="text-xs text-muted">{r.email}</p></td>
                  <td className="px-3 py-3"><Link href={`/admin/courses/${r.course_id}/`}>{r.title}</Link></td>
                  <td className="px-3 py-3">{r.completed_at ? <Badge tone="ok">Completed</Badge> : <span className="flex items-center gap-2"><span className="h-1.5 w-20 overflow-hidden rounded-full bg-mist"><span className="block h-full bg-royal" style={{ width: `${pc}%` }} /></span>{pc}%</span>}</td>
                  <td className="px-3 py-3">{date(r.enrolled_at)}</td>
                  <td className="px-3 py-3">{date(r.last_active_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex gap-3 text-sm">
        {p > 1 && <Link href={`?${new URLSearchParams({ ...(course && { course }), ...(status && { status }), page: String(p - 1) })}`}>← Previous</Link>}
        {rows.length === PAGE && <Link href={`?${new URLSearchParams({ ...(course && { course }), ...(status && { status }), page: String(p + 1) })}`}>Next →</Link>}
      </div>
    </>
  );
}
