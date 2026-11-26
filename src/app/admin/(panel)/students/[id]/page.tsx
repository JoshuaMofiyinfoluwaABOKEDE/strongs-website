import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminTitle, Badge, Card, Notice, btnDanger, btnGhost, btnPrimary, date } from "@/components/admin/ui";
import { one, q } from "@/lib/db";
import { getMyCourses, percent } from "@/lib/lms";
import { getUser, requireAdmin } from "@/lib/session";
import { adminEnrol, issueCertificate, removeEnrolment, setBanned, setPassword, setRole } from "@/app/admin/actions";

const saved: Record<string, string> = {
  role: "Role updated.",
  password: "New password set. Tell the learner privately.",
  access: "Access updated.",
  enrolled: "Enrolled.",
  removed: "Enrolment removed.",
  issued: "Certificate issued.",
};
const errors: Record<string, string> = {
  self: "You cannot remove your own admin access or block yourself.",
  password: "Passwords must be at least 8 characters.",
  issue: "Could not issue that certificate.",
};

export default async function Student({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const u = await one<{ id: string; name: string; email: string; role: string | null; banned: boolean | null; banReason: string | null; createdAt: string }>(
    `SELECT id, name, email, role, banned, "banReason", "createdAt" FROM "user" WHERE id=$1`,
    [id],
  );
  if (!u) notFound();
  const me = await getUser();
  const courses = await getMyCourses(u.id);
  const all = await q<{ id: number; title: string }>(`SELECT id, title FROM lms_course ORDER BY title`);
  const subs = await q<{ id: number; title: string; course: string; status: string; submitted_at: string }>(
    `SELECT s.id, l.title, c.title AS course, s.status, s.submitted_at FROM lms_submission s JOIN lms_lesson l ON l.id=s.lesson_id JOIN lms_module m ON m.id=l.module_id JOIN lms_course c ON c.id=m.course_id WHERE s.user_id=$1 ORDER BY s.submitted_at DESC`,
    [u.id],
  );

  return (
    <>
      <AdminTitle title={u.name} intro={`${u.email} · joined ${date(u.createdAt)}`} back={{ href: "/admin/students/", label: "Students" }}>
        <div className="flex gap-2">{u.role === "admin" ? <Badge tone="navy">Admin</Badge> : <Badge>Learner</Badge>}{u.banned && <Badge tone="warn">Blocked</Badge>}</div>
      </AdminTitle>
      {sp.saved && saved[sp.saved] && <Notice>{saved[sp.saved]}</Notice>}
      {sp.error && errors[sp.error] && <Notice kind="error">{errors[sp.error]}</Notice>}

      <Card title="Courses">
        {courses.length === 0 ? <p className="text-muted">Not enrolled in any course.</p> : (
          <ul className="flex flex-col divide-y divide-line">
            {courses.map((c) => (
              <li key={c.course_id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 text-sm">
                <Link href={`/admin/courses/${c.course_id}/`} className="font-semibold">{c.title}</Link>
                <span className="text-muted">{percent(c.complete, c.total)}% · {c.complete}/{c.total} · last studied {date(c.last_active_at)}</span>
                {c.completed_at && <Badge tone="ok">Completed {date(c.completed_at)}</Badge>}
                {c.certificate && <Link href={`/certificates/${c.certificate}/`} className="text-xs">{c.certificate}</Link>}
                <span className="flex-1" />
                <form action={removeEnrolment} className="flex items-center gap-2">
                  <input type="hidden" name="userId" value={u.id} />
                  <input type="hidden" name="courseId" value={c.course_id} />
                  <label className="flex items-center gap-1 text-xs text-muted"><input type="checkbox" name="reset" /> also clear progress</label>
                  <button type="submit" className={btnGhost}>Unenrol</button>
                </form>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-4 border-t border-line pt-4">
          <form action={adminEnrol} className="flex flex-wrap gap-2">
            <input type="hidden" name="userId" value={u.id} />
            <select name="courseId" className="field min-h-9 w-64 py-1 text-sm">{all.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
            <button type="submit" className={btnPrimary}>Enrol</button>
          </form>
          <form action={issueCertificate} className="flex flex-wrap gap-2">
            <input type="hidden" name="userId" value={u.id} />
            <select name="courseId" className="field min-h-9 w-64 py-1 text-sm">{all.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
            <button type="submit" className={btnGhost}>Issue certificate by hand</button>
          </form>
        </div>
        <p className="text-xs text-muted">Issue a certificate by hand only for a learner who completed the course another way, such as in a class.</p>
      </Card>

      <Card title="Assignments">
        {subs.length === 0 ? <p className="text-muted">None handed in.</p> : (
          <ul className="flex flex-col divide-y divide-line text-sm">
            {subs.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-3 py-2">
                <Link href={`/admin/submissions/?status=all&open=${s.id}#s${s.id}`} className="font-semibold">{s.title}</Link>
                <span className="text-muted">{s.course} · {date(s.submitted_at)}</span>
                <Badge tone={s.status === "approved" ? "ok" : s.status === "pending" ? "gold" : "warn"}>{s.status === "revise" ? "To revise" : s.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Role">
          <form action={setRole} className="flex flex-col gap-3">
            <input type="hidden" name="userId" value={u.id} />
            <select name="role" defaultValue={u.role === "admin" ? "admin" : "learner"} className="field"><option value="learner">Learner</option><option value="admin">Administrator</option></select>
            <button type="submit" className={`${btnPrimary} self-start`} disabled={u.id === me?.id}>Save role</button>
          </form>
        </Card>
        <Card title="Set a new password">
          <form action={setPassword} className="flex flex-col gap-3">
            <input type="hidden" name="userId" value={u.id} />
            <input name="password" type="text" minLength={8} required autoComplete="off" placeholder="At least 8 characters" className="field" />
            <button type="submit" className={`${btnPrimary} self-start`}>Set password</button>
          </form>
        </Card>
        <Card title="Access">
          <form action={setBanned} className="flex flex-col gap-3">
            <input type="hidden" name="userId" value={u.id} />
            <input type="hidden" name="ban" value={u.banned ? "false" : "true"} />
            {!u.banned && <input name="reason" placeholder="Reason (private)" className="field" />}
            {u.banned && u.banReason && <p className="text-sm text-muted">Reason: {u.banReason}</p>}
            <button type="submit" className={`${u.banned ? btnPrimary : btnDanger} self-start`} disabled={u.id === me?.id}>{u.banned ? "Restore access" : "Block this account"}</button>
          </form>
        </Card>
      </div>
    </>
  );
}
