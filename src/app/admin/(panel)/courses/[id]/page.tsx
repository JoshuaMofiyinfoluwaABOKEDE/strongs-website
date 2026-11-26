import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminTitle, Badge, Card, Notice, btnDanger, btnGhost, btnPrimary } from "@/components/admin/ui";
import { one, q } from "@/lib/db";
import { getOutline, standards } from "@/lib/lms";
import { requireAdmin } from "@/lib/session";
import {
  createAssessment,
  createLesson,
  deleteCourse,
  deleteModule,
  saveCourse,
  saveModule,
  saveReview,
  setEnrolment,
} from "@/app/admin/actions";

const messages: Record<string, string> = {
  details: "Course details saved.",
  review: "Standards review saved.",
  enrolment: "Enrolment setting saved.",
  module: "Modules updated.",
  "lesson-deleted": "Lesson deleted.",
  "assessment-deleted": "Assessment deleted.",
};
const errors: Record<string, string> = {
  open: "To open enrolment, tick every course standard and publish at least one lesson.",
  confirm: "Type DELETE to confirm.",
  enrolled: "This course has learners enrolled, so it cannot be deleted. Hide it from the catalogue instead.",
  title: "Give it a title.",
  "module-used": "Learners have progress in this module. Type DELETE in the box to remove it anyway.",
};

export default async function CourseEditor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { saved, error } = await searchParams;
  const o = await getOutline(Number(id), true);
  if (!o) notFound();
  const c = o.course;
  const cats = await q<{ id: string; name: string }>(`SELECT id, name FROM lms_category ORDER BY position`);
  const counts = await one<{ enrolled: number; completed: number }>(
    `SELECT count(*)::int AS enrolled, count(completed_at)::int AS completed FROM lms_enrolment WHERE course_id=$1`,
    [c.id],
  );
  const published = o.modules.reduce((n, m) => n + m.lessons.filter((l) => l.published).length, 0);
  const reviewed = standards.every((s) => c.review?.[s.key]);

  return (
    <>
      <AdminTitle title={c.title} back={{ href: "/admin/courses/", label: "All courses" }}>
        <div className="flex flex-wrap items-center gap-2">
          {c.enrolment_open ? <Badge tone="ok">Open for enrolment</Badge> : c.listed ? <Badge tone="gold">In preparation</Badge> : <Badge>Hidden</Badge>}
          <Link href={`/courses/${c.slug}/`} className={btnGhost} target="_blank">View public page</Link>
          <Link href={`/admin/enrolments/?course=${c.id}`} className={btnGhost}>{counts?.enrolled ?? 0} learners</Link>
        </div>
      </AdminTitle>
      {saved && messages[saved] && <Notice>{messages[saved]}</Notice>}
      {error && errors[error] && <Notice kind="error">{errors[error]}</Notice>}

      <nav className="flex flex-wrap gap-2 text-sm">
        {[["#details", "Details"], ["#curriculum", "Modules and lessons"], ["#standards", "Standards and enrolment"], ["#danger", "Delete"]].map(([h, l]) => (
          <a key={h} href={h} className="rounded-full border border-line px-3 py-1 no-underline">{l}</a>
        ))}
      </nav>

      <Card title="Course details" id="details">
        <form action={saveCourse} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={c.id} />
          <label className="label sm:col-span-2">Title<input name="title" defaultValue={c.title} required maxLength={200} className="field" /></label>
          <label className="label">Web address<input name="slug" defaultValue={c.slug} className="field" /><span className="text-xs font-normal text-muted">/courses/{c.slug}/</span></label>
          <label className="label">Subject
            <select name="category" defaultValue={c.category_id} className="field">{cats.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
          </label>
          <label className="label">Level
            <select name="level" defaultValue={c.level} className="field">{["Beginner", "Intermediate", "Advanced", "All levels"].map((l) => <option key={l}>{l}</option>)}</select>
          </label>
          <label className="label">Duration (weeks)<input name="weeks" type="number" min={1} max={52} defaultValue={c.weeks} className="field" /></label>
          <label className="label">Effort<input name="effort" defaultValue={c.effort} placeholder="2–3 hours a week" className="field" /></label>
          <label className="label">Format<input name="format" defaultValue={c.format} className="field" /></label>
          <label className="label sm:col-span-2">Summary (one or two sentences)<textarea name="summary" defaultValue={c.summary} rows={2} maxLength={600} className="field py-3" /></label>
          <label className="label sm:col-span-2">Description<textarea name="about" defaultValue={c.about} rows={5} className="field py-3" /></label>
          <label className="label">Course objectives (one per line)<textarea name="objectives" defaultValue={c.objectives.join("\n")} rows={6} className="field py-3" /><span className="text-xs font-normal text-muted">What the course sets out to do.</span></label>
          <label className="label">Learning outcomes (one per line)<textarea name="outcomes" defaultValue={c.outcomes.join("\n")} rows={6} className="field py-3" /><span className="text-xs font-normal text-muted">What learners will be able to do by the end.</span></label>
          <label className="label">Who it is for<textarea name="audience" defaultValue={c.audience} rows={3} className="field py-3" /></label>
          <label className="label">Before you start<textarea name="prerequisites" defaultValue={c.prerequisites} rows={3} className="field py-3" /></label>
          <label className="label">Order in the catalogue<input name="position" type="number" defaultValue={c.position} className="field" /></label>
          <div className="flex flex-col justify-end gap-2 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" name="listed" defaultChecked={c.listed} className="h-4 w-4" /> Show in the catalogue</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={c.featured} className="h-4 w-4" /> Feature under &ldquo;Popular courses&rdquo;</label>
          </div>
          <button type="submit" className={`${btnPrimary} justify-self-start`}>Save details</button>
        </form>
      </Card>

      <Card title="Modules and lessons" id="curriculum">
        <p className="text-sm text-muted">
          Learners meet the lessons in this order, then each module&rsquo;s quiz, then any final assessment. Only published lessons and assessments are shown to learners.
        </p>
        <ol className="flex flex-col gap-4">
          {o.modules.map((m, i) => (
            <li key={m.id} className="flex flex-col gap-3 rounded-xl border border-line p-4">
              <details>
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-royal">Module {i + 1}</span>
                  <span className="font-semibold text-navy">{m.title}</span>
                  <span className="text-xs text-royal underline">edit</span>
                </summary>
                <form action={saveModule} className="mt-3 grid gap-3 sm:grid-cols-[1fr_6rem]">
                  <input type="hidden" name="courseId" value={c.id} />
                  <input type="hidden" name="id" value={m.id} />
                  <label className="label">Title<input name="title" defaultValue={m.title} required className="field" /></label>
                  <label className="label">Order<input name="position" type="number" defaultValue={m.position} className="field" /></label>
                  <label className="label sm:col-span-2">Summary<textarea name="summary" defaultValue={m.summary} rows={2} className="field py-2" /></label>
                  <div className="flex flex-wrap gap-2 sm:col-span-2">
                    <button type="submit" className={btnPrimary}>Save module</button>
                  </div>
                </form>
                <form action={deleteModule} className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-sm">
                  <input type="hidden" name="courseId" value={c.id} />
                  <input type="hidden" name="id" value={m.id} />
                  <span className="text-muted">Delete this module and its lessons?</span>
                  <input name="confirm" placeholder="type DELETE if asked" className="field min-h-9 w-44 py-1 text-sm" />
                  <button type="submit" className={btnDanger}>Delete module</button>
                </form>
              </details>
              {m.lessons.length + m.assessments.length > 0 ? (
                <ul className="flex flex-col divide-y divide-line rounded-lg bg-mist/60">
                  {m.lessons.map((l) => (
                    <li key={l.id} className="flex flex-wrap items-center gap-2 px-3 py-2 text-sm">
                      <Link href={`/admin/lessons/${l.id}/`} className="font-semibold">{l.title}</Link>
                      <Badge>{l.kind === "assignment" ? "Assignment" : `Reading · ${l.minutes} min`}</Badge>
                      <span className="flex-1" />
                      {l.published ? <Badge tone="ok">Published</Badge> : <Badge tone="gold">Draft</Badge>}
                    </li>
                  ))}
                  {m.assessments.map((a) => (
                    <li key={`a${a.id}`} className="flex flex-wrap items-center gap-2 px-3 py-2 text-sm">
                      <Link href={`/admin/assessments/${a.id}/`} className="font-semibold">{a.title}</Link>
                      <Badge>Quiz · pass {a.pass_mark}%</Badge>
                      <span className="flex-1" />
                      {a.published ? <Badge tone="ok">Published</Badge> : <Badge tone="gold">Draft</Badge>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">No lessons yet.</p>
              )}
              <div className="flex flex-wrap gap-2">
                <form action={createLesson} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="courseId" value={c.id} />
                  <input type="hidden" name="moduleId" value={m.id} />
                  <input name="title" required placeholder="New lesson title" className="field min-h-9 w-56 py-1 text-sm" />
                  <select name="kind" className="field min-h-9 w-36 py-1 text-sm"><option value="reading">Reading</option><option value="assignment">Assignment</option></select>
                  <button type="submit" className={btnGhost}>Add lesson</button>
                </form>
                <form action={createAssessment}>
                  <input type="hidden" name="courseId" value={c.id} />
                  <input type="hidden" name="moduleId" value={m.id} />
                  <input type="hidden" name="title" value={`Module ${i + 1} quiz`} />
                  <button type="submit" className={btnGhost}>Add quiz</button>
                </form>
              </div>
            </li>
          ))}
        </ol>
        <form action={saveModule} className="flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-steel p-4">
          <input type="hidden" name="courseId" value={c.id} />
          <label className="label flex-1">New module<input name="title" required placeholder="Module title" className="field" /></label>
          <label className="label flex-1">Summary<input name="summary" className="field" /></label>
          <button type="submit" className={btnPrimary}>Add module</button>
        </form>
        <div className="flex flex-col gap-2 rounded-xl border border-line p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-royal">Final assessment</p>
          {o.finals.map((a) => (
            <p key={a.id} className="flex flex-wrap items-center gap-2 text-sm">
              <Link href={`/admin/assessments/${a.id}/`} className="font-semibold">{a.title}</Link>
              <Badge>Pass {a.pass_mark}%</Badge>
              {a.published ? <Badge tone="ok">Published</Badge> : <Badge tone="gold">Draft</Badge>}
            </p>
          ))}
          <form action={createAssessment}>
            <input type="hidden" name="courseId" value={c.id} />
            <input type="hidden" name="moduleId" value="0" />
            <input type="hidden" name="title" value="Final assessment" />
            <button type="submit" className={btnGhost}>Add a final assessment</button>
          </form>
        </div>
      </Card>

      <Card title="Standards and enrolment" id="standards">
        <p className="text-sm text-muted">
          Before a course opens, a reviewer confirms it meets each STRONGS course standard. If any box is unticked, enrolment closes. See{" "}
          <Link href="/admin/standards/">the full standards</Link>.
        </p>
        <form action={saveReview} className="flex flex-col gap-3">
          <input type="hidden" name="id" value={c.id} />
          {standards.map((s) => (
            <label key={s.key} className="flex items-start gap-3 rounded-lg px-2 py-1.5 hover:bg-mist">
              <input type="checkbox" name={`std_${s.key}`} defaultChecked={!!c.review?.[s.key]} className="mt-1 h-4 w-4" />
              <span className="flex flex-col"><span className="font-semibold text-navy">{s.label}</span><span className="text-sm text-muted">{s.help}</span></span>
            </label>
          ))}
          <label className="label max-w-sm">Reviewed by<input name="reviewer" defaultValue={c.reviewed_by ?? ""} className="field" /></label>
          {c.reviewed_at && <p className="text-sm text-muted">Fully reviewed on {new Date(c.reviewed_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}{c.reviewed_by ? ` by ${c.reviewed_by}` : ""}.</p>}
          <button type="submit" className={`${btnPrimary} self-start`}>Save review</button>
        </form>
        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
          <p className="flex-1 text-sm text-muted">
            {c.enrolment_open
              ? "Learners can enrol and study this course now."
              : reviewed && published > 0
                ? "Ready to open."
                : `Not ready: ${[!reviewed && "complete the standards review", published === 0 && "publish at least one lesson"].filter(Boolean).join(" and ")}.`}
          </p>
          <form action={setEnrolment}>
            <input type="hidden" name="id" value={c.id} />
            <input type="hidden" name="open" value={c.enrolment_open ? "false" : "true"} />
            <button type="submit" className={c.enrolment_open ? btnGhost : btnPrimary} disabled={!c.enrolment_open && !(reviewed && published > 0)}>
              {c.enrolment_open ? "Close enrolment" : "Open for enrolment"}
            </button>
          </form>
        </div>
      </Card>

      <Card title="Delete course" id="danger">
        <form action={deleteCourse} className="flex flex-wrap items-center gap-2 text-sm">
          <input type="hidden" name="id" value={c.id} />
          <span className="text-muted">Permanently delete this course, its modules, lessons and assessments. Type DELETE to confirm:</span>
          <input name="confirm" className="field min-h-9 w-32 py-1 text-sm" />
          <button type="submit" className={btnDanger}>Delete course</button>
        </form>
      </Card>
    </>
  );
}
