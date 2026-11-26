import Link from "next/link";
import { theologyRules } from "@/content/theology/catalog";
import type { TheologyCourse } from "@/content/theology/types";
import { lessonKey } from "@/lib/theology/content";
import { examOpen, quizOpen, testOpen, weekOpen, type Gradebook } from "@/lib/theology/progress";

const tick = (done: boolean, locked = false) =>
  done ? <span className="text-royal" aria-label="done">✓</span> : locked ? <span className="text-[0.75rem]" aria-label="locked">🔒</span> : <span className="text-steel" aria-hidden="true">○</span>;
const row = "flex gap-2.5 rounded-lg px-2 py-1.5 text-sm text-ink no-underline hover:bg-mist hover:text-navy";

/** The course outline beside every theology page. */
export function TheologyNav({ c, g, bare = false }: { c: TheologyCourse; g: Gradebook; bare?: boolean }) {
  const base = `/theology/${c.slug}`;
  const list = (
      <ol className={`flex flex-col pb-3 ${bare ? "" : "border-t border-line"}`}>
        <li className="px-5 pt-3"><Link href={`${base}/`} className={row}>{tick(false)}<span className="flex-1 font-semibold">Course home and grades</span></Link></li>
        {c.modules.map((m, i) => {
          const w = i + 1;
          const best = g.quizBest[i];
          const shut = !weekOpen(g, w);
          return (
            <li key={w} className="px-5 pt-4">
              <Link href={`${base}/week/${w}/`} className="block no-underline">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-royal">Week {w}</span>
                <span className="block font-semibold leading-snug text-navy">{m.title}</span>
              </Link>
              <ul className="flex flex-col gap-0.5 pt-1.5">
                {m.lessons.map((l, j) => (
                  <li key={j}><Link href={`${base}/week/${w}/lesson/${j + 1}/`} className={row}>{tick(g.lessonsDone.has(lessonKey(w, j + 1)), shut)}<span className="flex-1">{l.title}</span></Link></li>
                ))}
                <li><Link href={`${base}/week/${w}/#review`} className={row}>{tick(false, shut)}<span className="flex-1 text-muted">Key terms and summary</span></Link></li>
                <li>
                  <Link href={`${base}/week/${w}/quiz/`} className={row}>
                    {tick((best ?? 0) >= theologyRules.quiz.pass, !quizOpen(c, g, w))}
                    <span className="flex-1">Week {w} quiz{best != null && <span className="text-muted"> · best {best}%</span>}</span>
                  </Link>
                </li>
              </ul>
            </li>
          );
        })}
        <li className="px-5 pt-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-royal">Assessment</p>
          <ul className="flex flex-col gap-0.5 pt-1.5">
            {c.assignments.map((a, i) => (
              <li key={i}><Link href={`${base}/assignment/${i + 1}/`} className={row}>{tick(g.assignments[i]?.status === "graded")}<span className="flex-1">Assignment {i + 1}: {a.title}</span></Link></li>
            ))}
            <li><Link href={`${base}/test/`} className={row}>{tick(g.parts.test, !testOpen(g))}<span className="flex-1">Course test{g.testBest != null && <span className="text-muted"> · best {g.testBest}%</span>}</span></Link></li>
            <li><Link href={`${base}/exam/`} className={row}>{tick(g.parts.exam, !examOpen(g))}<span className="flex-1">Final exam</span></Link></li>
          </ul>
        </li>
      </ol>
  );
  if (bare) return list;
  return (
    <details className="group rounded-2xl border border-line bg-white lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto" open>
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold text-navy">
        Course outline <span className="text-sm font-normal text-muted">{g.percentDone}% done</span>
      </summary>
      {list}
    </details>
  );
}
