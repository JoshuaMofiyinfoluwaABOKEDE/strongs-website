import Link from "next/link";
import { assessmentHref, lessonHref, type Outline, type Progress } from "@/lib/lms";

const mark = (done: boolean, pending = false) =>
  done ? <span className="text-royal" aria-label="done">✓</span> : pending ? <span className="text-gold" aria-label="waiting for review">◔</span> : <span className="text-steel" aria-hidden="true">○</span>;

/** The course outline beside every lesson, with ticks for what is done. */
export function CourseNav({ slug, outline, progress }: { slug: string; outline: Outline; progress: Progress }) {
  return (
    <details className="group rounded-2xl border border-line bg-white lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto" open>
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold text-navy lg:cursor-default">
        Course outline
        <span className="text-sm font-normal text-muted">{progress.complete} of {progress.total} done</span>
      </summary>
      <ol className="flex flex-col border-t border-line pb-3">
        {outline.modules.map((m, i) => (
          <li key={m.id} className="px-5 pt-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-royal">Module {i + 1}</p>
            <p className="font-semibold leading-snug text-navy">{m.title}</p>
            {m.lessons.length + m.assessments.length === 0 ? (
              <p className="pt-1 text-sm text-muted">Lessons in preparation</p>
            ) : (
              <ul className="flex flex-col gap-0.5 pt-1.5">
                {m.lessons.map((l) => (
                  <li key={l.id}>
                    <Link href={lessonHref(slug, l.id)} className="flex gap-2.5 rounded-lg px-2 py-1.5 text-sm text-ink no-underline hover:bg-mist hover:text-navy">
                      {mark(progress.doneLessons.has(l.id), progress.submissions.get(l.id)?.status === "pending")}
                      <span className="flex-1">{l.title}{l.kind === "assignment" && <span className="text-muted"> · assignment</span>}</span>
                    </Link>
                  </li>
                ))}
                {m.assessments.map((a) => (
                  <li key={`a${a.id}`}>
                    <Link href={assessmentHref(slug, a.id)} className="flex gap-2.5 rounded-lg px-2 py-1.5 text-sm text-ink no-underline hover:bg-mist hover:text-navy">
                      {mark(!!progress.best.get(a.id)?.passed)}
                      <span className="flex-1">{a.title}<span className="text-muted"> · quiz</span></span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
        {outline.finals.length > 0 && (
          <li className="px-5 pt-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-royal">Final assessment</p>
            <ul className="flex flex-col gap-0.5 pt-1.5">
              {outline.finals.map((a) => (
                <li key={a.id}>
                  <Link href={assessmentHref(slug, a.id)} className="flex gap-2.5 rounded-lg px-2 py-1.5 text-sm text-ink no-underline hover:bg-mist hover:text-navy">
                    {mark(!!progress.best.get(a.id)?.passed)}
                    <span className="flex-1">{a.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        )}
      </ol>
    </details>
  );
}
