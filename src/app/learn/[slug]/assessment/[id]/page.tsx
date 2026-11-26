import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { one, q } from "@/lib/db";
import { loadLearner } from "@/lib/learner";
import { assessmentHref, blockedBy, lessonHref, nextStep, sequence, type QuestionRow } from "@/lib/lms";
import { renderMarkdown } from "@/lib/markdown";
import { submitAssessment } from "@/app/learn/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false } };

export default async function AssessmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ attempt?: string; retake?: string }>;
}) {
  const { slug, id } = await params;
  const { attempt: attemptId, retake } = await searchParams;
  const { user, outline, progress } = await loadLearner(slug);
  const items = sequence(outline);
  const a = items.find((i) => i.type === "assessment" && i.assessment.id === Number(id));
  if (!a || a.type !== "assessment") notFound();
  const assessment = a.assessment;
  const block = blockedBy(outline, progress, items.indexOf(a));
  if (block) {
    return (
      <article className="flex flex-col items-start gap-4">
        <p className="eyebrow">Locked</p>
        <h1 className="text-[clamp(1.375rem,3vw,2rem)] font-bold leading-tight text-navy"><span aria-hidden="true">🔒 </span>Not open yet</h1>
        <p className="text-[0.9375rem] text-ink sm:text-base">Pass &ldquo;{block.title}&rdquo; first. Each quiz or test must be passed before the lessons after it open.</p>
        <Link href={assessmentHref(slug, block.id)} className="btn btn-navy">Go to {block.title} →</Link>
      </article>
    );
  }
  const questions = await q<QuestionRow>(`SELECT * FROM lms_question WHERE assessment_id = $1 ORDER BY position, id`, [assessment.id]);
  const best = progress.best.get(assessment.id);
  const attempt = attemptId
    ? await one<{ score: number; passed: boolean; answers: Record<string, string[]>; created_at: string }>(
        `SELECT score, passed, answers, created_at FROM lms_attempt WHERE id = $1 AND user_id = $2 AND assessment_id = $3`,
        [Number(attemptId), user.id, assessment.id],
      )
    : null;
  const next = nextStep(outline, progress);
  const nextHref = next ? (next.type === "lesson" ? lessonHref(slug, next.lesson.id) : assessmentHref(slug, next.assessment.id)) : `/learn/${slug}/`;
  const showForm = !attempt && (!best?.passed || retake);

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-3 border-b border-line pb-6">
        <p className="eyebrow">{assessment.kind === "final" ? "Final assessment" : "Quiz"}</p>
        <h1 className="text-[clamp(1.9rem,3.6vw,2.8rem)] font-bold leading-[1.1] tracking-[-0.015em] text-navy">{assessment.title}</h1>
        <p className="text-sm text-muted">
          {questions.length} {questions.length === 1 ? "question" : "questions"} · pass mark {assessment.pass_mark}% · you may retake it
          {best && <> · your best score: <strong className="text-navy">{best.score}%</strong>{best.passed && " ✓"}</>}
        </p>
      </header>

      {assessment.instructions && <div className="lesson-text max-w-3xl" dangerouslySetInnerHTML={{ __html: renderMarkdown(assessment.instructions) }} />}

      {attempt && (
        <div className={`flex flex-col gap-3 rounded-3xl p-[clamp(1.25rem,3vw,2rem)] ${attempt.passed ? "bg-navy text-white" : "border border-gold bg-[#fbf5e6]"}`}>
          <p className={attempt.passed ? "eyebrow-dark" : "eyebrow"}>{attempt.passed ? "Passed" : "Not yet"}</p>
          <p className={`text-[clamp(2.2rem,5vw,3.2rem)] font-extrabold leading-none ${attempt.passed ? "text-white" : "text-navy"}`}>{attempt.score}%</p>
          <p className={attempt.passed ? "text-pale" : "text-muted"}>
            {attempt.passed ? "Well done. Your result has been saved." : `You need ${assessment.pass_mark}% to pass. See which questions you missed below, revise the lessons, and try again.`}
          </p>
          <div className="flex flex-wrap gap-3">
            {attempt.passed ? (
              <Link href={nextHref} className="btn btn-gold">Continue →</Link>
            ) : (
              <Link href={`${assessmentHref(slug, assessment.id)}?retake=1`} className="btn btn-navy">Try again</Link>
            )}
          </div>
        </div>
      )}

      {attempt && (
        <ol className="flex flex-col gap-5">
          {questions.map((qn, n) => {
            const given = attempt.answers[qn.id] ?? [];
            const right = given.length === qn.correct.length && given.every((g) => qn.correct.includes(g));
            return (
              <li key={qn.id} className="flex flex-col gap-2 rounded-2xl border border-line p-5">
                <p className="font-semibold text-navy">{n + 1}. {qn.prompt} <span className={right ? "text-royal" : "text-[#8a1c1c]"}>{right ? "✓" : "✗"}</span></p>
                {!attempt.passed ? (
                  <p className="text-sm text-muted">{right ? "Correct." : "Not correct. The answers are shown once you pass, so that retakes stay a fair test."}</p>
                ) : (
                <ul className="flex flex-col gap-1 text-[0.9375rem]">
                  {qn.options.map((o) => (
                    <li key={o.id} className={qn.correct.includes(o.id) ? "font-semibold text-royal" : given.includes(o.id) ? "text-[#8a1c1c] line-through" : "text-muted"}>
                      {qn.correct.includes(o.id) ? "✓ " : given.includes(o.id) ? "✗ " : "· "}{o.text}
                    </li>
                  ))}
                </ul>
                )}
                {attempt.passed && qn.explanation && <p className="text-sm text-muted">{qn.explanation}</p>}
              </li>
            );
          })}
        </ol>
      )}

      {!attempt && best?.passed && !retake && (
        <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-mist p-5">
          <p className="text-navy">You passed this {assessment.kind === "final" ? "assessment" : "quiz"} with {best.score}%.</p>
          <Link href={nextHref} className="btn btn-navy">Continue →</Link>
          <Link href={`${assessmentHref(slug, assessment.id)}?retake=1`}>Take it again</Link>
        </div>
      )}

      {showForm &&
        (questions.length === 0 ? (
          <p className="rounded-2xl bg-mist p-5 text-muted">The questions for this assessment are being prepared.</p>
        ) : (
          <form action={submitAssessment} className="flex flex-col gap-5">
            <input type="hidden" name="assessmentId" value={assessment.id} />
            <ol className="flex flex-col gap-5">
              {questions.map((qn, n) => (
                <li key={qn.id}>
                  <fieldset className="flex flex-col gap-2.5 rounded-2xl border border-line p-5">
                    <legend className="px-1 font-semibold text-navy">{n + 1}. {qn.prompt}</legend>
                    {qn.kind === "multiple" && <p className="text-sm text-muted">Choose every answer that is correct.</p>}
                    {qn.options.map((o) => (
                      <label key={o.id} className="flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2 hover:bg-mist">
                        <input
                          type={qn.kind === "multiple" ? "checkbox" : "radio"}
                          name={`q${qn.id}`}
                          value={o.id}
                          required={qn.kind === "single"}
                          className="mt-1 h-4 w-4 accent-[var(--color-royal)]"
                        />
                        <span>{o.text}</span>
                      </label>
                    ))}
                  </fieldset>
                </li>
              ))}
            </ol>
            <button type="submit" className="btn btn-navy cursor-pointer self-start border-0 font-[inherit]">Submit my answers</button>
          </form>
        ))}
    </article>
  );
}
