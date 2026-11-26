import Link from "next/link";
import { AdminTitle, Badge, Card, date } from "@/components/admin/ui";
import { one, q } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export default async function AdminHome() {
  await requireAdmin();
  const s = await one<{ learners: number; enrolments: number; completed: number; certificates: number; pending: number; open: number; lessons: number; active: number }>(`
    SELECT (SELECT count(*)::int FROM "user") AS learners,
           (SELECT count(*)::int FROM lms_enrolment) AS enrolments,
           (SELECT count(*)::int FROM lms_enrolment WHERE completed_at IS NOT NULL) AS completed,
           (SELECT count(*)::int FROM lms_certificate WHERE NOT revoked) AS certificates,
           (SELECT count(*)::int FROM lms_submission WHERE status='pending') AS pending,
           (SELECT count(*)::int FROM lms_course WHERE enrolment_open) AS open,
           (SELECT count(*)::int FROM lms_lesson WHERE published) AS lessons,
           (SELECT count(DISTINCT user_id)::int FROM lms_enrolment WHERE last_active_at > now() - interval '30 days') AS active`);
  const recent = await q<{ name: string; email: string; user_id: string; title: string; enrolled_at: string }>(
    `SELECT u.name, u.email, e.user_id, c.title, e.enrolled_at FROM lms_enrolment e JOIN "user" u ON u.id=e.user_id JOIN lms_course c ON c.id=e.course_id ORDER BY e.enrolled_at DESC LIMIT 8`,
  );
  const stats: [string, number, string][] = [
    ["Registered learners", s!.learners, "/admin/students/"],
    ["Active in last 30 days", s!.active, "/admin/students/"],
    ["Enrolments", s!.enrolments, "/admin/enrolments/"],
    ["Courses completed", s!.completed, "/admin/enrolments/?status=completed"],
    ["Certificates issued", s!.certificates, "/admin/certificates/"],
    ["Assignments to review", s!.pending, "/admin/submissions/"],
    ["Courses open for enrolment", s!.open, "/admin/courses/"],
    ["Published lessons", s!.lessons, "/admin/courses/"],
  ];
  return (
    <>
      <AdminTitle title="Overview" intro="The STRONGS Courses platform at a glance." />
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([label, n, href]) => (
          <li key={label}>
            <Link href={href} className="flex h-full flex-col gap-1 rounded-2xl border border-line bg-white p-4 no-underline hover:border-royal">
              <span className="text-3xl font-extrabold text-navy">{n}</span>
              <span className="text-sm text-muted">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Card title="Getting a course ready">
        <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-[0.9375rem] text-ink">
          <li>In <Link href="/admin/courses/">Courses and lessons</Link>, open a course and check its details, objectives and outcomes.</li>
          <li>Write each lesson (reading or practical assignment) under its module, and publish it.</li>
          <li>Add a quiz to each module and, if wanted, a final assessment. Publish them once they have questions.</li>
          <li>Review the course against the <Link href="/admin/standards/">course standards</Link> and tick each one.</li>
          <li>Open the course for enrolment. Learners can then enrol, study and earn the certificate.</li>
        </ol>
      </Card>
      <Card title="Latest enrolments">
        {recent.length === 0 ? (
          <p className="text-muted">No enrolments yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {recent.map((r) => (
              <li key={`${r.user_id}${r.title}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 text-[0.9375rem]">
                <Link href={`/admin/students/${r.user_id}/`} className="font-semibold">{r.name}</Link>
                <span className="text-muted">{r.title}</span>
                <span className="flex-1" />
                <Badge>{date(r.enrolled_at)}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
