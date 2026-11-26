import Link from "next/link";
import { AdminTitle, Badge, btnGhost, date } from "@/components/admin/ui";
import { q } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

const PAGE = 50;

export default async function Students({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; role?: string }> }) {
  await requireAdmin();
  const { q: search = "", page = "1", role } = await searchParams;
  const p = Math.max(1, Number(page) || 1);
  const where: string[] = [];
  const args: unknown[] = [];
  if (search) {
    args.push(`%${search.toLowerCase()}%`);
    where.push(`(lower(u.name) LIKE $${args.length} OR lower(u.email) LIKE $${args.length})`);
  }
  if (role === "admin") where.push(`u.role = 'admin'`);
  const w = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const total = (await q<{ n: number }>(`SELECT count(*)::int AS n FROM "user" u ${w}`, args))[0].n;
  const rows = await q<{ id: string; name: string; email: string; role: string | null; banned: boolean | null; createdAt: string; enrolled: number; completed: number; last: string | null }>(
    `SELECT u.id, u.name, u.email, u.role, u.banned, u."createdAt",
       (SELECT count(*)::int FROM lms_enrolment e WHERE e.user_id=u.id) AS enrolled,
       (SELECT count(*)::int FROM lms_enrolment e WHERE e.user_id=u.id AND e.completed_at IS NOT NULL) AS completed,
       (SELECT max(e.last_active_at) FROM lms_enrolment e WHERE e.user_id=u.id) AS last
     FROM "user" u ${w} ORDER BY u."createdAt" DESC LIMIT ${PAGE} OFFSET ${(p - 1) * PAGE}`,
    args,
  );
  const qs = (n: number) => `?${new URLSearchParams({ ...(search && { q: search }), ...(role && { role }), page: String(n) })}`;
  return (
    <>
      <AdminTitle title="Students" intro={`${total} ${total === 1 ? "person" : "people"} registered.`} />
      <form className="flex flex-wrap gap-2">
        <input name="q" defaultValue={search} placeholder="Search by name or email" className="field max-w-sm" />
        <select name="role" defaultValue={role ?? ""} className="field w-40"><option value="">Everyone</option><option value="admin">Admins only</option></select>
        <button type="submit" className={btnGhost}>Search</button>
      </form>
      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[42rem] text-left text-sm">
          <thead className="bg-mist text-xs uppercase tracking-wide text-muted">
            <tr><th className="px-4 py-3">Name</th><th className="px-3">Courses</th><th className="px-3">Completed</th><th className="px-3">Last studied</th><th className="px-3">Joined</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/students/${u.id}/`} className="font-semibold">{u.name}</Link>{" "}
                  {u.role === "admin" && <Badge tone="navy">Admin</Badge>} {u.banned && <Badge tone="warn">Blocked</Badge>}
                  <p className="text-xs text-muted">{u.email}</p>
                </td>
                <td className="px-3 py-3">{u.enrolled}</td>
                <td className="px-3 py-3">{u.completed}</td>
                <td className="px-3 py-3">{date(u.last)}</td>
                <td className="px-3 py-3">{date(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-3 text-sm">
        {p > 1 && <Link href={qs(p - 1)}>← Previous</Link>}
        {p * PAGE < total && <Link href={qs(p + 1)}>Next →</Link>}
      </div>
    </>
  );
}
