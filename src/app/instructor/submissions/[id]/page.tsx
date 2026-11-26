import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminTitle, Badge, Card, Notice, btnGhost, btnPrimary, date } from "@/components/admin/ui";
import { one } from "@/lib/db";
import { requireInstructor } from "@/lib/session";
import { getTheologyCourse } from "@/lib/theology/content";
import type { SimilarityReport } from "@/lib/theology/plagiarism";
import { gradeSubmission } from "@/app/instructor/actions";

export default async function Submission({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireInstructor();
  const { id } = await params;
  const sp = await searchParams;
  const s = await one<{ id: number; user_id: string; name: string; email: string; slug: string; title: string; assignment_no: number; text: string; file_name: string | null; file_text: string; declaration: string; declared_at: string; similarity: SimilarityReport; status: string; score: number | null; feedback: string; graded_by: string | null; graded_at: string | null; submitted_at: string }>(
    `SELECT s.*, u.name, u.email, c.slug, c.title FROM th_submission s JOIN "user" u ON u.id=s.user_id JOIN lms_course c ON c.id=s.course_id WHERE s.id=$1`,
    [Number(id)],
  );
  if (!s) notFound();
  const course = getTheologyCourse(s.slug);
  const task = course?.assignments[s.assignment_no - 1];
  const sim = s.similarity;
  return (
    <>
      <AdminTitle title={`${s.name}: assignment ${s.assignment_no}`} intro={`${s.title} · handed in ${date(s.submitted_at)} · ${s.email}`} back={{ href: "/instructor/submissions/", label: "Assignments" }}>
        {s.status === "graded" ? <Badge tone="ok">Graded {s.score}/100</Badge> : s.status === "returned" ? <Badge tone="warn">Returned</Badge> : <Badge tone="gold">To grade</Badge>}
      </AdminTitle>
      {sp.saved && <Notice>Saved. The learner can see the result now.</Notice>}
      {sp.error === "score" && <Notice kind="error">Enter a score from 0 to 100.</Notice>}
      {sp.error === "feedback" && <Notice kind="error">Write feedback so the learner knows what to revise.</Notice>}
      {task && (
        <Card title={`The task: ${task.title}`}>
          <p className="whitespace-pre-line text-[0.9375rem] text-ink">{task.prompt}</p>
          <p className="text-sm text-muted">Expected length: {task.words} words.</p>
        </Card>
      )}
      <Card title="Similarity check">
        {sim?.checkedAt ? (
          <>
            <p className="text-[0.9375rem]">
              <strong className={sim.overall >= 30 ? "text-[#8a1c1c]" : "text-navy"}>{sim.overall}%</strong> of the wording ({sim.words} words checked) also appears in other learners&rsquo; work or the course lessons.
            </p>
            {sim.matches.length > 0 && <ul className="flex flex-col gap-1 text-sm">{sim.matches.map((m) => <li key={m.source}>{m.percent}% · {m.source}</li>)}</ul>}
            {sim.note && <p className="text-sm text-[#7a5a12]">{sim.note}</p>}
            <p className="text-xs text-muted">The check compares wording only. It does not search the internet and cannot tell whether AI tools were used. The learner declared: &ldquo;{s.declaration}&rdquo; on {date(s.declared_at)}.</p>
          </>
        ) : <p className="text-muted">Not checked.</p>}
      </Card>
      <Card title="The learner's work">
        {s.text ? <div className="whitespace-pre-wrap rounded-xl border border-line p-4 text-[0.9375rem] text-ink">{s.text}</div> : <p className="text-muted">No typed answer.</p>}
        {s.file_name && (
          <div className="flex flex-col gap-2">
            <p className="text-sm">Attached file: <a href={`/theology/file/${s.id}/`}>{s.file_name}</a></p>
            {s.file_text && <details className="rounded-xl bg-mist p-3 text-sm"><summary className="cursor-pointer font-semibold text-navy">Text read from the file</summary><p className="whitespace-pre-wrap pt-2">{s.file_text.slice(0, 20000)}</p></details>}
          </div>
        )}
      </Card>
      <Card title="Grade">
        <form action={gradeSubmission} className="flex flex-col gap-3">
          <input type="hidden" name="id" value={s.id} />
          <label className="label max-w-[10rem]">Score out of 100<input name="score" type="number" min={0} max={100} defaultValue={s.score ?? ""} className="field" /></label>
          <label className="label">Feedback to the learner<textarea name="feedback" rows={6} defaultValue={s.feedback} className="field py-2" /></label>
          <div className="flex flex-wrap gap-2">
            <button type="submit" name="decision" value="grade" className={btnPrimary}>Save grade</button>
            <button type="submit" name="decision" value="return" className={btnGhost}>Return for revision</button>
          </div>
          {s.graded_by && <p className="text-xs text-muted">Last marked by {s.graded_by} on {date(s.graded_at)}.</p>}
        </form>
      </Card>
      <Link href={`/instructor/gradebook/?course=${s.slug}`} className="text-sm">See this course&rsquo;s gradebook →</Link>
    </>
  );
}
