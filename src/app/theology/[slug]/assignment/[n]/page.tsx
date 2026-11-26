import { notFound } from "next/navigation";
import { theologyRules } from "@/content/theology/catalog";
import { one } from "@/lib/db";
import { loadTheology } from "@/lib/theology/learner";
import { submitTheologyAssignment } from "@/app/theology/actions";

export const dynamic = "force-dynamic";

const errors: Record<string, string> = {
  declaration: "Tick the declaration to confirm the work is your own.",
  empty: "Write your answer or attach a file.",
  size: "The file is too large. The limit is 4 MB.",
  type: "Attach a PDF, Word (.docx) or text (.txt) file.",
};

export default async function AssignmentPage({ params, searchParams }: { params: Promise<{ slug: string; n: string }>; searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { slug, n } = await params;
  const { sent, error } = await searchParams;
  const no = Number(n);
  const { user, c, row } = await loadTheology(slug);
  const a = c.assignments[no - 1];
  if (!a) notFound();
  const sub = await one<{ id: number; text: string; file_name: string | null; status: string; score: number | null; feedback: string; submitted_at: string; graded_at: string | null }>(
    `SELECT id, text, file_name, status, score, feedback, submitted_at, graded_at FROM th_submission WHERE user_id=$1 AND course_id=$2 AND assignment_no=$3`,
    [user.id, row.id, no],
  );
  const locked = sub?.status === "graded";

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 border-b border-line pb-5">
        <p className="eyebrow">Assignment {no} of {c.assignments.length} · assignments are {theologyRules.weights.assignments}% of your grade</p>
        <h1 className="text-[clamp(1.8rem,3.4vw,2.5rem)] font-bold leading-tight text-navy">{a.title}</h1>
        <p className="text-sm text-muted">Length: {a.words} words · graded by an instructor out of 100</p>
      </header>
      <div className="lesson-text max-w-3xl whitespace-pre-line">{a.prompt}</div>

      {sent && <p role="status" className="rounded-xl bg-[#e7f1ea] px-4 py-3 text-sm text-[#1d5b33]">Received. Your instructor will grade it and leave feedback here.</p>}
      {error && errors[error] && <p role="alert" className="rounded-xl bg-[#fdecec] px-4 py-3 text-sm text-[#8a1c1c]">{errors[error]}</p>}

      {sub && (
        <div className={`flex flex-col gap-2 rounded-2xl p-5 ${sub.status === "graded" ? "bg-navy text-white" : sub.status === "returned" ? "border border-gold bg-[#fbf5e6]" : "bg-mist"}`}>
          <p className="font-semibold">
            {sub.status === "graded" ? `Graded: ${sub.score}/100` : sub.status === "returned" ? "Returned for revision" : "Submitted, waiting to be graded"}
          </p>
          {sub.feedback && <p className={`whitespace-pre-wrap text-[0.9375rem] ${sub.status === "graded" ? "text-pale" : "text-ink"}`}>{sub.feedback}</p>}
          <p className={`text-xs ${sub.status === "graded" ? "text-pale" : "text-muted"}`}>
            Handed in {new Date(sub.submitted_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
            {sub.file_name && <> · file: <a href={`/theology/file/${sub.id}/`} className={sub.status === "graded" ? "text-gold" : ""}>{sub.file_name}</a></>}
          </p>
        </div>
      )}

      {!locked && (
        <form action={submitTheologyAssignment} className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-[clamp(1.25rem,3vw,2rem)]">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="assignment" value={no} />
          <label className="label">
            Your answer
            <textarea name="text" rows={14} defaultValue={sub?.text ?? ""} className="field py-3" />
          </label>
          <label className="label">
            Or attach a file (PDF, Word .docx or .txt, up to 4 MB)
            <input name="file" type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" className="text-sm font-normal" />
            {sub?.file_name && <span className="text-xs font-normal text-muted">Already attached: {sub.file_name}. Choose a new file only to replace it.</span>}
          </label>
          <label className="flex items-start gap-3 rounded-xl bg-mist p-4 font-semibold text-navy">
            <input type="checkbox" name="declaration" value={theologyRules.declaration} required className="mt-1 h-4 w-4" />
            <span>
              {theologyRules.declaration}
              <span className="block text-sm font-normal text-muted">Every submission is compared with other learners&rsquo; work and with the course material, and your instructor sees the result.</span>
            </span>
          </label>
          <button type="submit" className="btn btn-navy cursor-pointer self-start border-0 font-[inherit]">{sub ? "Hand in again" : "Hand in"}</button>
        </form>
      )}
    </article>
  );
}
