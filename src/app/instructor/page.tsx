import Link from "next/link";
import { AdminTitle, Card, date } from "@/components/admin/ui";
import { one, q } from "@/lib/db";
import { requireInstructor } from "@/lib/session";

export default async function InstructorHome() {
  await requireInstructor();
  const s = await one<{ learners: number; enrolments: number; certs: number; subs: number; papers: number; exams: number }>(`
    SELECT (SELECT count(DISTINCT e.user_id)::int FROM lms_enrolment e JOIN lms_course c ON c.id=e.course_id WHERE c.school='theology') AS learners,
           (SELECT count(*)::int FROM lms_enrolment e JOIN lms_course c ON c.id=e.course_id WHERE c.school='theology') AS enrolments,
           (SELECT count(*)::int FROM lms_certificate ce JOIN lms_course c ON c.id=ce.course_id WHERE c.school='theology' AND NOT ce.revoked) AS certs,
           (SELECT count(*)::int FROM th_submission WHERE status='submitted') AS subs,
           (SELECT count(*)::int FROM th_attempt WHERE kind IN ('test','exam') AND status='submitted' AND reviewed_at IS NULL) AS papers,
           (SELECT count(*)::int FROM th_attempt WHERE kind='exam' AND status='open') AS exams`);
  const oldest = await q<{ id: number; name: string; title: string; assignment_no: number; submitted_at: string }>(
    `SELECT s.id, u.name, c.title, s.assignment_no, s.submitted_at FROM th_submission s JOIN "user" u ON u.id=s.user_id JOIN lms_course c ON c.id=s.course_id WHERE s.status='submitted' ORDER BY s.submitted_at LIMIT 6`,
  );
  const stats: [string, number, string][] = [
    ["Assignments to grade", s!.subs, "/instructor/submissions/"],
    ["Tests and exams not yet reviewed", s!.papers, "/instructor/papers/"],
    ["Exams in progress now", s!.exams, "/instructor/papers/?kind=exam"],
    ["Learners", s!.learners, "/instructor/gradebook/"],
    ["Enrolments", s!.enrolments, "/instructor/gradebook/"],
    ["Certificates issued", s!.certs, "/instructor/gradebook/"],
  ];
  return (
    <>
      <AdminTitle title="School of Theology" intro="Grade assignments, check short answers on tests and exams, and follow each learner's progress." />
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {stats.map(([l, n, h]) => (
          <li key={l}><Link href={h} className="flex h-full flex-col gap-1 rounded-2xl border border-line bg-white p-4 no-underline hover:border-royal"><span className="text-3xl font-extrabold text-navy">{n}</span><span className="text-sm text-muted">{l}</span></Link></li>
        ))}
      </ul>
      <Card title="Waiting longest">
        {oldest.length === 0 ? <p className="text-muted">Nothing waiting. Well done.</p> : (
          <ul className="flex flex-col divide-y divide-line text-[0.9375rem]">
            {oldest.map((o) => <li key={o.id} className="flex flex-wrap gap-x-3 py-2"><Link href={`/instructor/submissions/${o.id}/`} className="font-semibold">{o.name}</Link><span className="text-muted">{o.title} · assignment {o.assignment_no} · {date(o.submitted_at)}</span></li>)}
          </ul>
        )}
      </Card>
      <Card title="How marking works">
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[0.9375rem]">
          <li>Weights: exam 40%, test 20%, assignments 20%, quizzes 20%. Pass mark 70% overall.</li>
          <li>Quizzes and objective questions are marked automatically. Short answers and lists are marked by key words; check them in <Link href="/instructor/papers/">Tests and exams</Link> and change any mark that is unfair.</li>
          <li>Each assignment shows a similarity report: how much of its wording also appears in other learners&rsquo; work or the course lessons. It cannot detect AI writing; use your judgement, and talk to the learner if in doubt.</li>
          <li>The certificate is issued automatically once every part is done and the total reaches 70%.</li>
        </ul>
      </Card>
    </>
  );
}
