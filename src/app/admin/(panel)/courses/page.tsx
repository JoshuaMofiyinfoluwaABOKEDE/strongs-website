import Link from "next/link";
import { AdminTitle, Badge, Card, Notice, btnPrimary } from "@/components/admin/ui";
import { q } from "@/lib/db";
import { standards } from "@/lib/lms";
import { createCourse } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/session";

export default async function AdminCourses({ searchParams }: { searchParams: Promise<{ deleted?: string; error?: string; cat?: string }> }) {
  await requireAdmin();
  const { deleted, error, cat } = await searchParams;
  const cats = await q<{ id: string; name: string }>(`SELECT id, name FROM lms_category ORDER BY position`);
  const rows = await q<{
    id: number; title: string; slug: string; category_id: string; listed: boolean; enrolment_open: boolean; review: Record<string, boolean>;
    modules: number; lessons: number; published: number; assessments: number; enrolments: number; completed: number;
  }>(`
    SELECT c.id, c.title, c.slug, c.category_id, c.listed, c.enrolment_open, c.review,
      (SELECT count(*)::int FROM lms_module m WHERE m.course_id=c.id) AS modules,
      (SELECT count(*)::int FROM lms_lesson l JOIN lms_module m ON m.id=l.module_id WHERE m.course_id=c.id) AS lessons,
      (SELECT count(*)::int FROM lms_lesson l JOIN lms_module m ON m.id=l.module_id WHERE m.course_id=c.id AND l.published) AS published,
      (SELECT count(*)::int FROM lms_assessment a WHERE a.course_id=c.id AND a.published) AS assessments,
      (SELECT count(*)::int FROM lms_enrolment e WHERE e.course_id=c.id) AS enrolments,
      (SELECT count(*)::int FROM lms_enrolment e WHERE e.course_id=c.id AND e.completed_at IS NOT NULL) AS completed
    FROM lms_course c ${cat ? "WHERE c.category_id = $1" : ""} ORDER BY c.position, c.title`, cat ? [cat] : []);
  const catName = (id: string) => cats.find((c) => c.id === id)?.name ?? id;
  return (
    <>
      <AdminTitle title="Courses and lessons" intro={`${rows.length} courses. Open a course to edit its details, modules, lessons and assessments.`} />
      {deleted && <Notice>The course was deleted.</Notice>}
      {error && <Notice kind="error">Give the new course a title and a subject.</Notice>}
      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/admin/courses/" className={`rounded-full border px-3 py-1 no-underline ${!cat ? "border-royal text-royal" : "border-line text-navy"}`}>All</Link>
        {cats.map((c) => (
          <Link key={c.id} href={`/admin/courses/?cat=${c.id}`} className={`rounded-full border px-3 py-1 no-underline ${cat === c.id ? "border-royal text-royal" : "border-line text-navy"}`}>{c.name}</Link>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[46rem] text-left text-sm">
          <thead className="bg-mist text-xs uppercase tracking-wide text-muted">
            <tr><th className="px-4 py-3">Course</th><th className="px-3">Lessons</th><th className="px-3">Quizzes</th><th className="px-3">Standards</th><th className="px-3">Learners</th><th className="px-3">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => {
              const reviewed = standards.filter((s) => r.review?.[s.key]).length;
              return (
                <tr key={r.id} className="align-top">
                  <td className="px-4 py-3">
                    <Link href={`/admin/courses/${r.id}/`} className="font-semibold">{r.title}</Link>
                    <p className="text-xs text-muted">{catName(r.category_id)} · {r.modules} modules</p>
                  </td>
                  <td className="px-3 py-3">{r.published} <span className="text-muted">/ {r.lessons}</span></td>
                  <td className="px-3 py-3">{r.assessments}</td>
                  <td className="px-3 py-3">{reviewed === standards.length ? <Badge tone="ok">Reviewed</Badge> : <span className="text-muted">{reviewed} / {standards.length}</span>}</td>
                  <td className="px-3 py-3">{r.enrolments}{r.completed > 0 && <span className="text-muted"> · {r.completed} done</span>}</td>
                  <td className="px-3 py-3">
                    {r.enrolment_open ? <Badge tone="ok">Open</Badge> : r.listed ? <Badge tone="gold">In preparation</Badge> : <Badge>Hidden</Badge>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Card title="Add a course">
        <form action={createCourse} className="flex flex-wrap items-end gap-3">
          <label className="label flex-1">Title<input name="title" required maxLength={200} className="field" /></label>
          <label className="label">Subject
            <select name="category" required className="field">{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          </label>
          <button type="submit" className={btnPrimary}>Create</button>
        </form>
        <p className="text-sm text-muted">New courses start hidden from the public catalogue until you tick &ldquo;Show in the catalogue&rdquo;.</p>
      </Card>
    </>
  );
}
