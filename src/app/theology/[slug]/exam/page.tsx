import { theologyRules } from "@/content/theology/catalog";
import { ExamForm } from "@/components/theology/ExamForm";
import { PaperFields } from "@/components/theology/Paper";
import { one } from "@/lib/db";
import type { Mark, PaperItem } from "@/lib/theology/content";
import { loadTheology } from "@/lib/theology/learner";
import { AssessShell } from "@/components/theology/Units";
import { startExam, submitExam } from "@/app/theology/actions";

export const dynamic = "force-dynamic";

export default async function ExamPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ error?: string }> }) {
  const { slug } = await params;
  const { error } = await searchParams;
  const { user, c, row, g } = await loadTheology(slug);
  const e = theologyRules.exam;
  const exam = await one<{ id: number; questions: PaperItem[]; answers: Record<string, string>; marks: Record<string, Mark>; score: number | null; status: string; deadline_at: string; submitted_at: string | null }>(
    `SELECT id, questions, answers, marks, score, status, deadline_at, submitted_at FROM th_attempt WHERE user_id=$1 AND course_id=$2 AND kind='exam'`,
    [user.id, row.id],
  );
  const ready = g.parts.lessons && g.parts.quizzes;

  return (
    <AssessShell c={c} g={g} title={"Final exam"}>
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 border-b border-line pb-5">
        <p className="eyebrow">Final exam · {theologyRules.weights.exam}% of your grade</p>
        <h1 className="text-[clamp(1.8rem,3.4vw,2.5rem)] font-bold leading-tight text-navy">{c.title}: final exam</h1>
        <p className="text-sm text-muted">
          {e.mcq} objective questions, {e.short} short answers and {e.lists} list question, drawn at random from the whole course. Timed: {c.examMinutes} minutes. One attempt only.
        </p>
      </header>

      {exam?.status === "open" ? (
        <ExamForm slug={slug} attemptId={exam.id} deadline={exam.deadline_at} action={submitExam}>
          <PaperFields c={c} paper={exam.questions} saved={exam.answers} />
        </ExamForm>
      ) : exam ? (
        <div className="flex flex-col gap-3 rounded-3xl bg-navy p-[clamp(1.25rem,3vw,2rem)] text-white">
          <p className="eyebrow-dark">Exam submitted</p>
          <p className="text-[clamp(2.2rem,5vw,3.2rem)] font-extrabold leading-none">{exam.score}%</p>
          <p className="text-pale">Your instructor may review the short answers and adjust the mark. The exam cannot be retaken.</p>
        </div>
      ) : !ready ? (
        <p className="rounded-2xl bg-mist p-5 text-navy">The exam opens once you have read every lesson and passed every weekly quiz. So far you have read {g.lessonsDone.size} of {g.lessonsTotal} lessons and passed {g.quizzesPassed} of {c.modules.length} quizzes.</p>
      ) : (
        <form action={startExam} className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-6">
          <h2 className="text-xl font-bold text-navy">Before you begin</h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[0.9375rem]">
            <li>You have <strong>{c.examMinutes} minutes</strong> from the moment you start. The clock keeps running if you leave the page.</li>
            <li>Your answers are saved every few seconds. When time runs out, the exam is submitted automatically.</li>
            <li>You may take the exam <strong>once</strong>. Make sure you have a steady connection and quiet time.</li>
            <li>Work on your own, without notes, other people or AI tools.</li>
          </ul>
          <input type="hidden" name="slug" value={slug} />
          <label className="flex items-start gap-3 font-semibold text-navy">
            <input type="checkbox" name="ready" required className="mt-1 h-4 w-4" /> I understand, and I am ready to start the exam now.
          </label>
          {error === "confirm" && <p role="alert" className="text-sm text-[#8a1c1c]">Tick the box to confirm.</p>}
          <button type="submit" className="btn btn-navy cursor-pointer self-start border-0 font-[inherit]">Start the exam</button>
        </form>
      )}
      {error === "locked" && <p role="alert" className="text-sm text-[#8a1c1c]">Finish the lessons and pass every weekly quiz first.</p>}
    </article>
    </AssessShell>
  );
}
