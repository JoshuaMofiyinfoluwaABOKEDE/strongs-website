import { notFound } from "next/navigation";
import { AdminTitle, Card, Notice, btnDanger, btnPrimary } from "@/components/admin/ui";
import { one, q } from "@/lib/db";
import type { LessonRow } from "@/lib/lms";
import { renderMarkdown } from "@/lib/markdown";
import { deleteLesson, saveLesson } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/session";

export default async function LessonEditor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { saved, error } = await searchParams;
  const l = await one<LessonRow & { course_id: number; course_title: string; slug: string }>(
    `SELECT l.*, m.course_id, c.title AS course_title, c.slug FROM lms_lesson l JOIN lms_module m ON m.id=l.module_id JOIN lms_course c ON c.id=m.course_id WHERE l.id=$1`,
    [Number(id)],
  );
  if (!l) notFound();
  const mods = await q<{ id: number; title: string }>(`SELECT id, title FROM lms_module WHERE course_id=$1 ORDER BY position, id`, [l.course_id]);
  const subs = await one<{ n: number }>(`SELECT count(*)::int AS n FROM lms_submission WHERE lesson_id=$1`, [l.id]);

  return (
    <>
      <AdminTitle title={l.title} back={{ href: `/admin/courses/${l.course_id}/#curriculum`, label: l.course_title }} />
      {saved && <Notice>Lesson saved.{l.published ? " It is live for enrolled learners." : " It is a draft: learners cannot see it yet."}</Notice>}
      {error === "confirm" && <Notice kind="error">Type DELETE to confirm.</Notice>}
      <form action={saveLesson} className="flex flex-col gap-6">
        <input type="hidden" name="id" value={l.id} />
        <Card title="Lesson">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="label sm:col-span-2">Title<input name="title" defaultValue={l.title} required className="field" /></label>
            <label className="label">Type
              <select name="kind" defaultValue={l.kind} className="field">
                <option value="reading">Reading (learner marks it complete)</option>
                <option value="assignment">Practical assignment (reviewed by an admin)</option>
              </select>
            </label>
            <label className="label">Module
              <select name="moduleId" defaultValue={l.module_id} className="field">{mods.map((m, i) => <option key={m.id} value={m.id}>{i + 1}. {m.title}</option>)}</select>
            </label>
            <label className="label">Order in module<input name="position" type="number" defaultValue={l.position} className="field" /></label>
            <label className="label">Study time (minutes)<input name="minutes" type="number" min={1} max={600} defaultValue={l.minutes} className="field" /></label>
            <label className="label sm:col-span-2">Key Scripture (optional, shown at the top)
              <textarea name="scripture" defaultValue={l.scripture} rows={2} placeholder="“Study to shew thyself approved unto God…” 2 Timothy 2:15 (KJV)" className="field py-2" />
              <span className="text-xs font-normal text-muted">Quote exactly from a named translation, with the reference.</span>
            </label>
            <label className="label sm:col-span-2">Video link (optional)<input name="video_url" type="url" defaultValue={l.video_url} placeholder="https://www.youtube.com/watch?v=…" className="field" /></label>
          </div>
        </Card>
        <Card title={l.kind === "assignment" ? "Assignment instructions" : "Lesson text"}>
          <p className="text-sm text-muted">
            Written in simple formatting: <code>## Heading</code>, <code>**bold**</code>, <code>*italic*</code>, <code>- list item</code>, <code>&gt; quotation</code>, <code>[link text](https://…)</code>. Leave a blank line between paragraphs.
          </p>
          <textarea name="body" defaultValue={l.body} rows={22} className="field py-3 font-mono text-sm leading-relaxed" />
          <label className="label">Further reading and resources (one per line: <code>Label | https://link</code>)
            <textarea name="resources" defaultValue={l.resources.map((r) => `${r.label} | ${r.url}`).join("\n")} rows={3} className="field py-2" />
          </label>
        </Card>
        <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-mist p-4">
          <label className="flex items-center gap-2 font-semibold text-navy"><input type="checkbox" name="published" defaultChecked={l.published} className="h-4 w-4" /> Published</label>
          <button type="submit" className={btnPrimary}>Save lesson</button>
          <span className="text-sm text-muted">Only publish lessons that have been checked for accuracy.</span>
        </div>
      </form>
      {l.body && (
        <Card title="Preview">
          <div className="lesson-text max-w-3xl" dangerouslySetInnerHTML={{ __html: renderMarkdown(l.body) }} />
        </Card>
      )}
      <Card title="Delete lesson">
        <form action={deleteLesson} className="flex flex-wrap items-center gap-2 text-sm">
          <input type="hidden" name="id" value={l.id} />
          <span className="text-muted">{subs?.n ? `${subs.n} learner submissions and all progress on this lesson will also be deleted. ` : ""}Type DELETE to confirm:</span>
          <input name="confirm" className="field min-h-9 w-32 py-1 text-sm" />
          <button type="submit" className={btnDanger}>Delete</button>
        </form>
      </Card>
    </>
  );
}
