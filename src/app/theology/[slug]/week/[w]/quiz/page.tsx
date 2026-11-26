import Link from "next/link";
import { notFound } from "next/navigation";
import { theologyRules } from "@/content/theology/catalog";
import { PaperFields, PaperReview } from "@/components/theology/Paper";
import { one } from "@/lib/db";
import type { Mark, PaperItem } from "@/lib/theology/content";
import { loadTheology } from "@/lib/theology/learner";
import { startQuiz, submitQuiz } from "@/app/theology/actions";

export const dynamic = "force-dynamic";

export default async function QuizPage({ params, searchParams }: { params: Promise<{ slug: string; w: string }>; searchParams: Promise<{ a?: string }> }) {
  const { slug, w } = await params;
  const { a } = await searchParams;
  const week = Number(w);
  const { user, c, row, g } = await loadTheology(slug);
  const m = c.modules[week - 1];
  if (!m) notFound();
  const attempt = a
    ? await one<{ id: number; questions: PaperItem[]; answers: Record<string, string>; marks: Record<string, Mark>; score: number | null; status: string }>(
        `SELECT id, questions, answers, marks, score, status FROM th_attempt WHERE id=$1 AND user_id=$2 AND course_id=$3 AND kind='quiz' AND week=$4`,
        [Number(a), user.id, row.id, week],
      )
    : null;
  const best = g.quizBest[week - 1];
  const passedEver = (best ?? 0) >= theologyRules.quiz.pass;

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 border-b border-line pb-5">
        <p className="eyebrow">Week {week} quiz</p>
        <h1 className="text-[clamp(1.8rem,3.4vw,2.5rem)] font-bold leading-tight text-navy">{m.title}</h1>
        <p className="text-sm text-muted">
          {theologyRules.quiz.questions} questions drawn at random from a bank of 20+ · pass mark {theologyRules.quiz.pass}% · unlimited retakes
          {best != null && <> · your best: <strong className="text-navy">{best}%</strong>{passedEver && " ✓"}</>}
        </p>
      </header>

      {!attempt && (
        <form action={startQuiz} className="flex flex-wrap items-center gap-4 rounded-2xl bg-mist p-5">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="week" value={week} />
          <button type="submit" className="btn btn-navy cursor-pointer border-0 font-[inherit]">{best == null ? "Start the quiz" : "Take a new quiz"}</button>
          <span className="text-sm text-muted">Each attempt draws a fresh set of questions.</span>
        </form>
      )}

      {attempt?.status === "open" && (
        <form action={submitQuiz} className="flex flex-col gap-5">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="attempt" value={attempt.id} />
          <PaperFields c={c} paper={attempt.questions} saved={attempt.answers} />
          <button type="submit" className="btn btn-navy cursor-pointer self-start border-0 font-[inherit]">Submit my answers</button>
        </form>
      )}

      {attempt?.status === "submitted" && (
        <>
          <div className={`flex flex-col gap-3 rounded-3xl p-[clamp(1.25rem,3vw,2rem)] ${(attempt.score ?? 0) >= theologyRules.quiz.pass ? "bg-navy text-white" : "border border-gold bg-[#fbf5e6]"}`}>
            <p className={(attempt.score ?? 0) >= theologyRules.quiz.pass ? "eyebrow-dark" : "eyebrow"}>{(attempt.score ?? 0) >= theologyRules.quiz.pass ? "Passed" : "Not yet"}</p>
            <p className={`text-[clamp(2.2rem,5vw,3.2rem)] font-extrabold leading-none ${(attempt.score ?? 0) >= theologyRules.quiz.pass ? "text-white" : "text-navy"}`}>{attempt.score}%</p>
            <div className="flex flex-wrap gap-3">
              {(attempt.score ?? 0) >= theologyRules.quiz.pass ? (
                <Link href={week < c.modules.length ? `/theology/${slug}/week/${week + 1}/` : `/theology/${slug}/`} className="btn btn-gold">{week < c.modules.length ? `On to Week ${week + 1}` : "Course home"} →</Link>
              ) : (
                <form action={startQuiz}>
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="week" value={week} />
                  <button type="submit" className="btn btn-navy cursor-pointer border-0 font-[inherit]">Try a new set of questions</button>
                </form>
              )}
              <Link href={`/theology/${slug}/week/${week}/#review`} className={(attempt.score ?? 0) >= theologyRules.quiz.pass ? "btn btn-line-light" : "btn btn-line"}>Review the week</Link>
            </div>
          </div>
          {!passedEver && <p className="text-sm text-muted">The correct answers are shown once you pass, so that retakes stay a fair test.</p>}
          <PaperReview c={c} paper={attempt.questions} answers={attempt.answers} marks={attempt.marks} reveal={passedEver} />
        </>
      )}
    </article>
  );
}
