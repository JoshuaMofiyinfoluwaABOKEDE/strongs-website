import { notFound } from "next/navigation";
import { AdminTitle, Badge, Card, Notice, btnDanger, btnGhost, btnPrimary } from "@/components/admin/ui";
import { one, q } from "@/lib/db";
import type { AssessmentRow, QuestionRow } from "@/lib/lms";
import { deleteAssessment, deleteQuestion, saveAssessment, saveQuestion } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/session";

function QuestionForm({ assessmentId, qn }: { assessmentId: number; qn?: QuestionRow }) {
  return (
    <form action={saveQuestion} className="grid gap-3 sm:grid-cols-[1fr_6rem]">
      <input type="hidden" name="assessmentId" value={assessmentId} />
      {qn && <input type="hidden" name="id" value={qn.id} />}
      <label className="label">Question<textarea name="prompt" defaultValue={qn?.prompt} rows={2} required className="field py-2" /></label>
      <label className="label">Order<input name="position" type="number" defaultValue={qn?.position ?? 0} className="field" /></label>
      <label className="label sm:col-span-2">Answers, one per line. Start each correct answer with *
        <textarea
          name="options"
          rows={5}
          required
          defaultValue={qn ? qn.options.map((o) => `${qn.correct.includes(o.id) ? "*" : ""}${o.text}`).join("\n") : ""}
          placeholder={"Genesis\n*Exodus\nLeviticus\nNumbers"}
          className="field py-2"
        />
        <span className="text-xs font-normal text-muted">2–10 answers. Mark one correct answer for a single-choice question, or several for &ldquo;choose all that apply&rdquo;.</span>
      </label>
      <label className="label sm:col-span-2">Explanation (shown after the learner passes)<textarea name="explanation" defaultValue={qn?.explanation} rows={2} className="field py-2" /></label>
      <button type="submit" className={`${btnPrimary} justify-self-start`}>{qn ? "Save question" : "Add question"}</button>
    </form>
  );
}

export default async function AssessmentEditor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { saved, error } = await searchParams;
  const a = await one<AssessmentRow & { course_title: string }>(
    `SELECT a.*, c.title AS course_title FROM lms_assessment a JOIN lms_course c ON c.id=a.course_id WHERE a.id=$1`,
    [Number(id)],
  );
  if (!a) notFound();
  const mods = await q<{ id: number; title: string }>(`SELECT id, title FROM lms_module WHERE course_id=$1 ORDER BY position, id`, [a.course_id]);
  const questions = await q<QuestionRow>(`SELECT * FROM lms_question WHERE assessment_id=$1 ORDER BY position, id`, [a.id]);
  const stats = await one<{ attempts: number; learners: number; passed: number }>(
    `SELECT count(*)::int AS attempts, count(DISTINCT user_id)::int AS learners, count(DISTINCT user_id) FILTER (WHERE passed)::int AS passed FROM lms_attempt WHERE assessment_id=$1`,
    [a.id],
  );

  return (
    <>
      <AdminTitle title={a.title} back={{ href: `/admin/courses/${a.course_id}/#curriculum`, label: a.course_title }}>
        <div className="flex gap-2">{a.published ? <Badge tone="ok">Published</Badge> : <Badge tone="gold">Draft</Badge>}<Badge>{stats?.learners ?? 0} learners · {stats?.passed ?? 0} passed</Badge></div>
      </AdminTitle>
      {saved === "1" && <Notice>Assessment saved.</Notice>}
      {saved === "question" && <Notice>Questions updated.</Notice>}
      {error === "empty" && <Notice kind="error">Add at least one question before publishing.</Notice>}
      {error === "question" && <Notice kind="error">A question needs its text, at least two answers, and at least one answer marked with *.</Notice>}
      {error === "confirm" && <Notice kind="error">Type DELETE to confirm.</Notice>}

      <Card title="Settings">
        <form action={saveAssessment} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={a.id} />
          <label className="label sm:col-span-2">Title<input name="title" defaultValue={a.title} required className="field" /></label>
          <label className="label">Placed after
            <select name="moduleId" defaultValue={a.module_id ?? 0} className="field">
              {mods.map((m, i) => <option key={m.id} value={m.id}>Module {i + 1}: {m.title}</option>)}
              <option value={0}>The end of the course (final assessment)</option>
            </select>
          </label>
          <label className="label">Pass mark (%)<input name="pass_mark" type="number" min={0} max={100} defaultValue={a.pass_mark} className="field" /></label>
          <label className="label">Order<input name="position" type="number" defaultValue={a.position} className="field" /></label>
          <label className="label sm:col-span-2">Instructions (optional)<textarea name="instructions" defaultValue={a.instructions} rows={3} className="field py-2" /></label>
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <label className="flex items-center gap-2 font-semibold text-navy"><input type="checkbox" name="published" defaultChecked={a.published} className="h-4 w-4" /> Published</label>
            <button type="submit" className={btnPrimary}>Save</button>
          </div>
        </form>
      </Card>

      <Card title={`Questions (${questions.length})`} id="questions">
        <ol className="flex flex-col gap-3">
          {questions.map((qn, n) => (
            <li key={qn.id} className="rounded-xl border border-line p-4">
              <details>
                <summary className="cursor-pointer list-none">
                  <span className="font-semibold text-navy">{n + 1}. {qn.prompt}</span>{" "}
                  <span className="text-xs text-muted">{qn.kind === "multiple" ? "choose all that apply" : "single choice"} · <span className="text-royal underline">edit</span></span>
                  <span className="block pt-1 text-sm">
                    {qn.options.map((o) => <span key={o.id} className={`block ${qn.correct.includes(o.id) ? "font-semibold text-royal" : "text-muted"}`}>{qn.correct.includes(o.id) ? "✓ " : "· "}{o.text}</span>)}
                  </span>
                </summary>
                <div className="mt-3 flex flex-col gap-3 border-t border-line pt-3">
                  <QuestionForm assessmentId={a.id} qn={qn} />
                  <form action={deleteQuestion}>
                    <input type="hidden" name="assessmentId" value={a.id} />
                    <input type="hidden" name="id" value={qn.id} />
                    <button type="submit" className={btnGhost}>Remove question</button>
                  </form>
                </div>
              </details>
            </li>
          ))}
        </ol>
        <div className="rounded-xl border border-dashed border-steel p-4">
          <p className="pb-2 font-semibold text-navy">New question</p>
          <QuestionForm assessmentId={a.id} />
        </div>
      </Card>

      <Card title="Delete assessment">
        <form action={deleteAssessment} className="flex flex-wrap items-center gap-2 text-sm">
          <input type="hidden" name="id" value={a.id} />
          <span className="text-muted">Deletes the questions and all learners&rsquo; attempts. Type DELETE to confirm:</span>
          <input name="confirm" className="field min-h-9 w-32 py-1 text-sm" />
          <button type="submit" className={btnDanger}>Delete</button>
        </form>
      </Card>
    </>
  );
}
