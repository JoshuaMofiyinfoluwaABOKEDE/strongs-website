import Link from "next/link";
import { AdminTitle, Badge, btnGhost } from "@/components/admin/ui";
import { theologyRules } from "@/content/theology/catalog";
import { q } from "@/lib/db";
import { requireInstructor } from "@/lib/session";
import { allTheologyCourses, getTheologyCourse } from "@/lib/theology/content";
import { courseRow, gradebook } from "@/lib/theology/progress";

export default async function Gradebook({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  await requireInstructor();
  const { course } = await searchParams;
  const all = allTheologyCourses();
  const c = course ? getTheologyCourse(course) : null;
  const row = c ? await courseRow(c.slug) : null;
  const learners = row ? await q<{ user_id: string; name: string; email: string }>(`SELECT e.user_id, u.name, u.email FROM lms_enrolment e JOIN "user" u ON u.id=e.user_id WHERE e.course_id=$1 ORDER BY u.name`, [row.id]) : [];
  const books = c && row ? await Promise.all(learners.map(async (l) => ({ l, g: await gradebook(l.user_id, c, row) }))) : [];
  const counts = await q<{ slug: string; n: number }>(`SELECT c.slug, count(e.*)::int AS n FROM lms_course c LEFT JOIN lms_enrolment e ON e.course_id=c.id WHERE c.school='theology' GROUP BY c.slug`);
  return (
    <>
      <AdminTitle title="Gradebook" intro={`Weights: exam ${theologyRules.weights.exam}%, test ${theologyRules.weights.test}%, assignments ${theologyRules.weights.assignments}%, quizzes ${theologyRules.weights.quizzes}%. Pass mark ${theologyRules.passMark}%.`} />
      <form className="flex flex-wrap gap-2">
        <select name="course" defaultValue={course ?? ""} className="field w-96">
          <option value="">Choose a course</option>
          {all.map((x) => <option key={x.slug} value={x.slug}>{x.title} ({counts.find((k) => k.slug === x.slug)?.n ?? 0})</option>)}
        </select>
        <button type="submit" className={btnGhost}>Show</button>
      </form>
      {c && (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="bg-mist text-xs uppercase tracking-wide text-muted">
              <tr><th className="px-4 py-3">Learner</th><th className="px-2">Lessons</th><th className="px-2">Quizzes</th><th className="px-2">Assignments</th><th className="px-2">Test</th><th className="px-2">Exam</th><th className="px-2">Total</th><th className="px-2">Result</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {books.length === 0 && <tr><td colSpan={8} className="px-4 py-6 text-muted">No one is enrolled yet.</td></tr>}
              {books.map(({ l, g }) => (
                <tr key={l.user_id}>
                  <td className="px-4 py-3"><span className="font-semibold text-navy">{l.name}</span><p className="text-xs text-muted">{l.email}</p></td>
                  <td className="px-2">{g.lessonsDone.size}/{g.lessonsTotal}</td>
                  <td className="px-2">{g.components.quizzes}% <span className="text-muted">({g.quizzesPassed}/{c.modules.length})</span></td>
                  <td className="px-2">{g.components.assignments}% <span className="text-muted">({g.assignments.filter((a) => a?.status === "graded").length}/{c.assignments.length})</span></td>
                  <td className="px-2">{g.testBest ?? "–"}{g.testBest != null && "%"}</td>
                  <td className="px-2">{g.exam?.status === "submitted" ? `${g.exam.score}%` : g.exam ? "in progress" : "–"}</td>
                  <td className="px-2 font-bold text-navy">{g.total}%</td>
                  <td className="px-2">{g.passed ? <Badge tone="ok">Passed</Badge> : g.complete ? <Badge tone="warn">Below pass</Badge> : <Badge>In progress</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {c && <Link href={`/courses/theology/${c.slug}/`} className="text-sm">Course page →</Link>}
    </>
  );
}
