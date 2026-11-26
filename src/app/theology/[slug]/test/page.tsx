import { theologyRules } from "@/content/theology/catalog";
import { PaperFields, PaperReview } from "@/components/theology/Paper";
import { one } from "@/lib/db";
import type { Mark, PaperItem } from "@/lib/theology/content";
import { loadTheology } from "@/lib/theology/learner";
import { startTest, submitTest } from "@/app/theology/actions";

export const dynamic = "force-dynamic";

export default async function TestPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ a?: string }> }) {
  const { slug } = await params;
  const { a } = await searchParams;
  const { user, c, row, g } = await loadTheology(slug);
  const t = theologyRules.test;
  const id = a ? Number(a) : g.testOpen;
  const attempt = id
    ? await one<{ id: number; questions: PaperItem[]; answers: Record<string, string>; marks: Record<string, Mark>; score: number | null; status: string }>(
        `SELECT id, questions, answers, marks, score, status FROM th_attempt WHERE id=$1 AND user_id=$2 AND course_id=$3 AND kind='test'`,
        [id, user.id, row.id],
      )
    : null;
  const used = g.testAttempts.length;
  const left = t.attempts - used;
  const reveal = left === 0 && !g.testOpen;

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 border-b border-line pb-5">
        <p className="eyebrow">Course test · {theologyRules.weights.test}% of your grade</p>
        <h1 className="text-[clamp(1.8rem,3.4vw,2.5rem)] font-bold leading-tight text-navy">{c.title}: course test</h1>
        <p className="text-sm text-muted">
          {t.mcq} objective questions, {t.short} short answers and {t.lists} list question{t.lists > 1 && "s"}, drawn at random from the whole course. Not timed. {t.attempts} attempts; your highest score counts.
          {g.testBest != null && <> Best so far: <strong className="text-navy">{g.testBest}%</strong>.</>}
        </p>
        <p className="text-sm text-muted">Short answers and lists are marked by key words, and your instructor may adjust the mark.</p>
      </header>

      {g.testAttempts.length > 0 && (
        <ul className="flex flex-wrap gap-2 text-sm">
          {g.testAttempts.map((x, i) => (
            <li key={x.id}><a href={`?a=${x.id}`} className={`rounded-full border px-3 py-1 no-underline ${x.id === attempt?.id ? "border-royal text-royal" : "border-line text-navy"}`}>Attempt {i + 1}: {x.status === "open" ? "in progress" : `${x.score}%`}</a></li>
          ))}
        </ul>
      )}

      {attempt?.status === "open" ? (
        <form action={submitTest} className="flex flex-col gap-5">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="attempt" value={attempt.id} />
          <PaperFields c={c} paper={attempt.questions} saved={attempt.answers} />
          <button type="submit" className="btn btn-navy cursor-pointer self-start border-0 font-[inherit]">Submit the test</button>
          <p className="text-sm text-muted">Submitting uses this attempt. You have {left} attempt{left === 1 ? "" : "s"} including this one.</p>
        </form>
      ) : (
        <>
          {left > 0 ? (
            <form action={startTest} className="flex flex-wrap items-center gap-4 rounded-2xl bg-mist p-5">
              <input type="hidden" name="slug" value={slug} />
              <button type="submit" className="btn btn-navy cursor-pointer border-0 font-[inherit]">{used ? "Start another attempt" : "Start the test"}</button>
              <span className="text-sm text-muted">{left} of {t.attempts} attempts left.</span>
            </form>
          ) : (
            <p className="rounded-2xl bg-mist p-5 text-navy">You have used all {t.attempts} attempts. Your best score, {g.testBest}%, counts towards your grade.</p>
          )}
          {attempt && (
            <>
              <p className="text-lg font-bold text-navy">Attempt score: {attempt.score}%</p>
              {!reveal && <p className="text-sm text-muted">Model answers are shown after your last attempt.</p>}
              <PaperReview c={c} paper={attempt.questions} answers={attempt.answers} marks={attempt.marks} reveal={reveal} />
            </>
          )}
        </>
      )}
    </article>
  );
}
