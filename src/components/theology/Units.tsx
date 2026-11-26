import Link from "next/link";
import { theologyRules } from "@/content/theology/catalog";
import type { TheologyCourse } from "@/content/theology/types";
import { lessonKey } from "@/lib/theology/content";
import type { Gradebook } from "@/lib/theology/progress";
import { TheologyNav } from "@/components/theology/TheologyNav";

export type Unit = { key: string; week: number; kind: "lesson" | "review" | "quiz"; title: string; href: string; done: boolean };

/** Every unit of the course in order: each week's lessons, then its key terms and summary, then its quiz. */
export function courseUnits(c: TheologyCourse, g: Gradebook): Unit[] {
  const base = `/theology/${c.slug}`;
  return c.modules.flatMap((m, i) => {
    const w = i + 1;
    return [
      ...m.lessons.map((l, j) => ({ key: `w${w}l${j + 1}`, week: w, kind: "lesson" as const, title: l.title, href: `${base}/week/${w}/lesson/${j + 1}/`, done: g.lessonsDone.has(lessonKey(w, j + 1)) })),
      { key: `w${w}r`, week: w, kind: "review" as const, title: "Key terms and summary", href: `${base}/week/${w}/`, done: m.lessons.every((_, j) => g.lessonsDone.has(lessonKey(w, j + 1))) },
      { key: `w${w}q`, week: w, kind: "quiz" as const, title: `Week ${w} quiz`, href: `${base}/week/${w}/quiz/`, done: (g.quizBest[i] ?? 0) >= theologyRules.quiz.pass },
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
                  x.key === current ? "bg-navy text-gold" : x.done ? "bg-mist text-royal hover:bg-line" : "text-steel hover:bg-mist"
                }`}
              >
                <span aria-hidden="true">{icon[x.kind]}</span>
                <span className="sr-only">{label[x.kind]}: {x.title}</span>
                {x.done && <span aria-hidden="true" className="absolute right-1 top-0.5 text-[0.625rem] text-royal">✓</span>}
              </Link>
            </li>
          ))}
        </ol>
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
        <div className="-mx-[clamp(1.25rem,4vw,3rem)] border-y border-line bg-white px-[clamp(1.25rem,4vw,3rem)] py-6 sm:mx-0 sm:rounded-2xl sm:border sm:p-[clamp(1.25rem,3vw,2.25rem)]">{children}</div>
      </div>
    </div>
  );
}
