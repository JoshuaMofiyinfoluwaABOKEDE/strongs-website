import { notFound } from "next/navigation";
import { AdminTitle, Card, Notice, btnPrimary, date } from "@/components/admin/ui";
import { one } from "@/lib/db";
import { requireInstructor } from "@/lib/session";
import { findQuestion, getTheologyCourse, type Mark, type PaperItem } from "@/lib/theology/content";
import { overrideMarks } from "@/app/instructor/actions";

export default async function Paper({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireInstructor();
  const { id } = await params;
  const { saved } = await searchParams;
  const a = await one<{ id: number; name: string; slug: string; title: string; kind: string; status: string; score: number | null; questions: PaperItem[]; answers: Record<string, string>; marks: Record<string, Mark>; started_at: string; submitted_at: string | null; deadline_at: string | null; reviewed_by: string | null; reviewed_at: string | null }>(
    `SELECT a.*, u.name, c.slug, c.title FROM th_attempt a JOIN "user" u ON u.id=a.user_id JOIN lms_course c ON c.id=a.course_id WHERE a.id=$1 AND a.kind IN ('test','exam')`,
    [Number(id)],
  );
  const c = a ? getTheologyCourse(a.slug) : null;
  if (!a || !c) notFound();
  const mins = a.submitted_at ? Math.round((new Date(a.submitted_at).getTime() - new Date(a.started_at).getTime()) / 60000) : null;
  return (
    <>
      <AdminTitle
        title={`${a.name}: ${a.kind === "exam" ? "final exam" : "test"}`}
        intro={`${a.title} · ${a.status === "open" ? "in progress" : `${a.score}% · submitted ${date(a.submitted_at)}${mins != null ? ` after ${mins} min` : ""}`}`}
        back={{ href: "/instructor/papers/", label: "Tests and exams" }}
      />
      {saved && <Notice>Marks saved and the learner&rsquo;s grade updated.</Notice>}
      {a.status === "open" ? (
        <p className="text-muted">This paper is still in progress{a.deadline_at ? ` (time runs out ${new Date(a.deadline_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })})` : ""}.</p>
      ) : (
        <form action={overrideMarks} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={a.id} />
          {a.questions.map((item, n) => {
            const qn = findQuestion(c, item.id);
            const m = a.marks[item.id];
            if (!qn || !m) return null;
            const given = a.answers[item.id] ?? "";
            return (
              <Card key={item.id}>
                <p className="font-semibold text-navy">{n + 1}. {qn.q}</p>
                {qn.kind === "mcq" ? (
                  <p className="text-sm text-muted">
                    Chose: <strong className="text-ink">{given !== "" && item.order ? qn.options[item.order[Number(given)]] : "no answer"}</strong> · correct: {qn.options[qn.answer]}
                  </p>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap rounded-xl bg-mist px-4 py-3 text-[0.9375rem]">{given || <em className="text-muted">No answer</em>}</p>
                    <p className="text-sm text-muted">
                      {qn.kind === "short" ? <>Model answer: {qn.model} <br />Key words: {qn.keywords.map((g) => g.join(" / ")).join(" · ")}</> : <>Accepted items (need {qn.need}): {qn.items.map((g) => g.join(" / ")).join(" · ")}</>}
                    </p>
                  </>
                )}
                <label className="flex items-center gap-2 text-sm">
                  Mark <input name={`m_${item.id}`} type="number" step="0.5" min={0} max={m.max} defaultValue={m.override ?? m.auto} className="field min-h-9 w-24 py-1" /> / {m.max}
                  <span className="text-muted">(automatic: {m.auto})</span>
                </label>
              </Card>
            );
          })}
          <button type="submit" className={`${btnPrimary} self-start`}>Save marks</button>
          {a.reviewed_by && <p className="text-xs text-muted">Reviewed by {a.reviewed_by} on {date(a.reviewed_at)}.</p>}
        </form>
      )}
    </>
  );
}
