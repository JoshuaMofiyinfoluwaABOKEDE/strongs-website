import Link from "next/link";
import { theologyRules } from "@/content/theology/catalog";
import type { TheologyCourse } from "@/content/theology/types";
import { lessonKey } from "@/lib/theology/content";
import { lockReason, type Gradebook } from "@/lib/theology/progress";
import { TheologyNav } from "@/components/theology/TheologyNav";

export type Unit = { key: string; week: number; kind: "lesson" | "review" | "quiz"; title: string; href: string; done: boolean; lock: string | null };

/** Every unit of the course in order: each week's lessons, then its key terms and summary, then its quiz. */
export function courseUnits(c: TheologyCourse, g: Gradebook): Unit[] {
  const base = `/theology/${c.slug}`;
  return c.modules.flatMap((m, i) => {
    const w = i + 1;
    return [
      ...m.lessons.map((l, j) => ({ key: `w${w}l${j + 1}`, week: w, kind: "lesson" as const, title: l.title, href: `${base}/week/${w}/lesson/${j + 1}/`, done: g.lessonsDone.has(lessonKey(w, j + 1)), lock: lockReason(c, g, { kind: "lesson", week: w }) })),
      { key: `w${w}r`, week: w, kind: "review" as const, title: "Key terms and summary", href: `${base}/week/${w}/`, done: m.lessons.every((_, j) => g.lessonsDone.has(lessonKey(w, j + 1))), lock: lockReason(c, g, { kind: "review", week: w }) },
      { key: `w${w}q`, week: w, kind: "quiz" as const, title: `Week ${w} quiz`, href: `${base}/week/${w}/quiz/`, done: (g.quizBest[i] ?? 0) >= theologyRules.quiz.pass, lock: lockReason(c, g, { kind: "quiz", week: w }) },
    ];
  });
}

const icon = { lesson: "▤", review: "☰", quiz: "✎" } as const;
const label = { lesson: "Lesson", review: "Review", quiz: "Quiz" } as const;

/**
 * The frame around every unit (edX-style): course outline on the left, and above the content
 * a breadcrumb, a bar with one button per unit in the week, and Previous / Next buttons.
 */
export function UnitShell({ c, g, current, children }: { c: TheologyCourse; g: Gradebook; current: string; children: React.ReactNode }) {
  const units = courseUnits(c, g);
  const i = units.findIndex((u) => u.key === current);
  const u = units[i];
  const week = units.filter((x) => x.week === u.week);
  const prev = units[i - 1];
  const next = units[i + 1];
  const nav = (
    <div className="flex items-center justify-between gap-3">
      {prev ? <Link href={prev.href} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-navy no-underline hover:border-royal">← Previous</Link> : <span />}
      {next ? (
        <Link href={next.href} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-navy px-4 text-sm font-semibold text-white no-underline hover:bg-royal hover:text-white">Next →</Link>
      ) : (
        <Link href={`/theology/${c.slug}/progress/`} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-navy px-4 text-sm font-semibold text-white no-underline hover:bg-royal hover:text-white">Assessments →</Link>
      )}
    </div>
  );
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[18rem_1fr]">
      <div className="hidden lg:block"><TheologyNav c={c} g={g} /></div>
      <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
        <nav aria-label="Breadcrumb" className="text-[0.8125rem] leading-snug text-muted sm:text-sm">
          <Link href={`/theology/${c.slug}/`}>Course</Link> <span aria-hidden="true">›</span> Week {u.week}: {c.modules[u.week - 1].title} <span aria-hidden="true">›</span> <span className="text-navy">{u.title}</span>
        </nav>
        <ol aria-label={`Week ${u.week} units`} className="flex gap-1.5 overflow-x-auto rounded-xl border border-line bg-white p-1.5">
          {week.map((x) => (
            <li key={x.key} className="flex-1">
              <Link
                href={x.href}
                title={`${label[x.kind]}: ${x.title}`}
                aria-current={x.key === current ? "step" : undefined}
                className={`relative flex min-h-10 min-w-10 items-center justify-center rounded-lg text-base sm:min-h-11 sm:min-w-11 sm:text-lg no-underline ${
                  x.key === current ? "bg-navy text-gold" : x.lock ? "text-steel opacity-60 hover:bg-mist" : x.done ? "bg-mist text-royal hover:bg-line" : "text-steel hover:bg-mist"
                }`}
              >
                <span aria-hidden="true">{x.lock ? "🔒" : icon[x.kind]}</span>
                <span className="sr-only">{label[x.kind]}: {x.title}{x.lock ? " (locked)" : ""}</span>
                {x.done && <span aria-hidden="true" className="absolute right-1 top-0.5 text-[0.625rem] text-royal">✓</span>}
              </Link>
            </li>
          ))}
        </ol>
        <details className="group rounded-xl border border-line bg-white lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-navy">
            <span>Course outline · Week {u.week} of {c.modules.length}</span>
            <span aria-hidden="true" className="text-royal group-open:rotate-180">⌄</span>
          </summary>
          <div className="max-h-[60vh] overflow-y-auto border-t border-line"><TheologyNav c={c} g={g} bare /></div>
        </details>
        {nav}
        <div className="-mx-[clamp(1.25rem,4vw,3rem)] border-y border-line bg-white px-[clamp(1.25rem,4vw,3rem)] py-6 sm:mx-0 sm:rounded-2xl sm:border sm:p-[clamp(1.25rem,3vw,2.25rem)]">{children}</div>
        {nav}
      </div>
    </div>
  );
}

/** The frame for assignments, the test and the exam: outline on the left, content in a card. */
export function AssessShell({ c, g, title, children }: { c: TheologyCourse; g: Gradebook; title: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[18rem_1fr]">
      <div className="hidden lg:block"><TheologyNav c={c} g={g} /></div>
      <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
        <nav aria-label="Breadcrumb" className="text-[0.8125rem] leading-snug text-muted sm:text-sm">
          <Link href={`/theology/${c.slug}/`}>Course</Link> <span aria-hidden="true">›</span> Assessment <span aria-hidden="true">›</span> <span className="text-navy">{title}</span>
        </nav>
        <details className="group rounded-xl border border-line bg-white lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-navy">
            <span>Course outline</span>
            <span aria-hidden="true" className="text-royal group-open:rotate-180">⌄</span>
          </summary>
          <div className="max-h-[60vh] overflow-y-auto border-t border-line"><TheologyNav c={c} g={g} bare /></div>
        </details>
        <div className="-mx-[clamp(1.25rem,4vw,3rem)] border-y border-line bg-white px-[clamp(1.25rem,4vw,3rem)] py-6 sm:mx-0 sm:rounded-2xl sm:border sm:p-[clamp(1.25rem,3vw,2.25rem)]">{children}</div>
      </div>
    </div>
  );
}

/** Shown in place of a unit that is not yet open: why, and a button to the step that opens it. */
export function Locked({ c, g, reason }: { c: TheologyCourse; g: Gradebook; reason: string }) {
  const next = courseUnits(c, g).find((u) => !u.done && !u.lock);
  return (
    <div className="flex flex-col items-start gap-4">
      <p className="eyebrow">Locked</p>
      <h1 className="text-[clamp(1.375rem,3vw,2rem)] font-bold leading-tight text-navy"><span aria-hidden="true">🔒 </span>Not open yet</h1>
      <p className="text-[0.9375rem] text-ink sm:text-base">{reason}</p>
      <p className="text-sm text-muted">STRONGS courses go step by step: read each week&rsquo;s lessons, pass its quiz with {theologyRules.quiz.pass}% or more, and the next week opens. The course test opens after the last quiz, and the final exam after the test.</p>
      {next ? <Link href={next.href} className="btn btn-navy">Continue: {next.title} →</Link> : <Link href={`/theology/${c.slug}/`} className="btn btn-navy">Back to the course</Link>}
    </div>
  );
}
