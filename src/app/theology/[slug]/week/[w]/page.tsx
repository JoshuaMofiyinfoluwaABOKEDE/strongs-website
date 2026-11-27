import Link from "next/link";
import { notFound } from "next/navigation";
import { theologyRules } from "@/content/theology/catalog";
import { Ref } from "@/components/theology/Ref";
import { lessonKey } from "@/lib/theology/content";
import { loadTheology } from "@/lib/theology/learner";
import { Locked, UnitShell } from "@/components/theology/Units";
import { lockReason } from "@/lib/theology/progress";

export const dynamic = "force-dynamic";

export default async function WeekPage({ params }: { params: Promise<{ slug: string; w: string }> }) {
  const { slug, w } = await params;
  const week = Number(w);
  const { c, g } = await loadTheology(slug);
  const m = c.modules[week - 1];
  if (!m) notFound();
  const lock = lockReason(c, g, { kind: "review", week });
  if (lock) return <UnitShell c={c} g={g} current={`w${week}r`}><Locked c={c} g={g} reason={lock} /></UnitShell>;
  const best = g.quizBest[week - 1];
  const read = m.lessons.filter((_, j) => g.lessonsDone.has(lessonKey(week, j + 1))).length;

  return (
    <UnitShell c={c} g={g} current={`w${week}r`}>
    <article className="flex flex-col gap-6 sm:gap-8">
      <header className="flex flex-col gap-3 border-b border-line pb-4 sm:pb-6">
        <p className="eyebrow">Week {week} of {c.modules.length}</p>
        <h1 className="text-[clamp(1.35rem,2.952vw,2.296rem)] font-bold leading-[1.1] tracking-[-0.015em] text-navy">{m.title}</h1>
        <p className="lead text-muted">{m.intro}</p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-navy">Lessons</h2>
        <ol className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-white">
          {m.lessons.map((l, j) => (
            <li key={j}>
              <Link href={`/theology/${slug}/week/${week}/lesson/${j + 1}/`} className="flex items-center gap-4 px-4 py-3.5 sm:px-5 sm:py-4 text-ink no-underline hover:bg-mist">
                <span className={`grid h-8 w-8 flex-none place-items-center rounded-full text-sm font-bold ${g.lessonsDone.has(lessonKey(week, j + 1)) ? "bg-royal text-white" : "bg-mist text-navy"}`}>
                  {g.lessonsDone.has(lessonKey(week, j + 1)) ? "✓" : j + 1}
                </span>
                <span className="flex-1 font-semibold text-navy">{l.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section id="review" className="flex scroll-mt-28 flex-col gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-2xl bg-mist p-4 sm:p-5">
            <h2 className="text-lg sm:text-xl font-bold text-navy">Key terms</h2>
            <dl className="flex flex-col gap-2.5">
              {m.terms.map((t) => (
                <div key={t.term}><dt className="font-semibold text-navy">{t.term}</dt><dd className="text-[0.9375rem] text-muted">{t.def}</dd></div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:p-5">
            <h2 className="text-lg sm:text-xl font-bold text-navy">Key texts (KJV)</h2>
            <ul className="flex flex-col gap-2.5">
              {m.texts.map((t) => (
                <li key={t.ref} className="text-[0.9375rem]"><Ref r={t.ref} /> <span className="text-muted">· {t.teaches}</span></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border-l-[3px] border-gold bg-white p-4 sm:p-5">
          <h2 className="text-lg sm:text-xl font-bold text-navy">Summary</h2>
          <ul className="flex flex-col gap-2">{m.summary.map((s) => <li key={s} className="tick text-[0.9375rem] sm:text-base">{s}</li>)}</ul>
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-4 rounded-2xl bg-navy p-5 sm:p-6 text-white">
        <div className="flex flex-1 flex-col gap-1">
          <h2 className="text-lg sm:text-xl font-bold">Week {week} quiz</h2>
          <p className="text-sm text-pale">
            {theologyRules.quiz.questions} questions drawn at random. Score {theologyRules.quiz.pass}% or more to pass; retake as often as you like.
            {best != null && ` Your best: ${best}%.`}
            {read < m.lessons.length && " Read the lessons first."}
          </p>
        </div>
        <Link href={`/theology/${slug}/week/${week}/quiz/`} className="btn btn-gold">{best == null ? "Take the quiz" : best >= theologyRules.quiz.pass ? "Review or retake" : "Try again"}</Link>
      </section>
    </article>
    </UnitShell>
  );
}
