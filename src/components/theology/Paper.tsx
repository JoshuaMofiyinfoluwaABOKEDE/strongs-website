import type { TheologyCourse } from "@/content/theology/types";
import { findQuestion, markValue, type Mark, type PaperItem } from "@/lib/theology/content";

const label = { mcq: "", short: "Short answer · 2 marks", list: "List · 2 marks" } as const;

/** The questions of a quiz, test or exam, as form fields named a_<question id>. */
export function PaperFields({ c, paper, saved = {} }: { c: TheologyCourse; paper: PaperItem[]; saved?: Record<string, string> }) {
  return (
    <ol className="flex flex-col gap-5">
      {paper.map((item, n) => {
        const qn = findQuestion(c, item.id);
        if (!qn) return null;
        return (
          <li key={item.id}>
            <fieldset className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-5">
              <legend className="px-1 font-semibold text-navy">{n + 1}. {qn.q}</legend>
              {qn.kind !== "mcq" && <p className="text-xs font-semibold uppercase tracking-wide text-royal">{label[qn.kind]}</p>}
              {qn.kind === "mcq" ? (
                (item.order ?? qn.options.map((_, i) => i)).map((orig, shown) => (
                  <label key={orig} className="flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2 hover:bg-mist">
                    <input type="radio" name={`a_${item.id}`} value={shown} defaultChecked={saved[item.id] === String(shown)} className="mt-1 h-4 w-4 accent-[var(--color-royal)]" />
                    <span>{qn.options[orig]}</span>
                  </label>
                ))
              ) : qn.kind === "short" ? (
                <textarea name={`a_${item.id}`} rows={4} defaultValue={saved[item.id] ?? ""} className="field py-2.5" aria-label="Your answer" />
              ) : (
                <>
                  <p className="text-sm text-muted">Write one item per line.</p>
                  <textarea name={`a_${item.id}`} rows={Math.max(4, qn.need + 1)} defaultValue={saved[item.id] ?? ""} className="field py-2.5" aria-label="Your list" />
                </>
              )}
            </fieldset>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * A marked paper. `reveal` shows the correct answers and explanations; otherwise only
 * right or wrong is shown, so that retakes stay a fair test.
 */
export function PaperReview({ c, paper, answers, marks, reveal }: { c: TheologyCourse; paper: PaperItem[]; answers: Record<string, string>; marks: Record<string, Mark>; reveal: boolean }) {
  return (
    <ol className="flex flex-col gap-4">
      {paper.map((item, n) => {
        const qn = findQuestion(c, item.id);
        const m = marks[item.id];
        if (!qn || !m) return null;
        const got = markValue(m);
        const tone = got >= m.max ? "text-royal" : got > 0 ? "text-[#7a5a12]" : "text-[#8a1c1c]";
        const given = answers[item.id] ?? "";
        return (
          <li key={item.id} className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-5">
            <p className="font-semibold text-navy">
              {n + 1}. {qn.q} <span className={`whitespace-nowrap text-sm ${tone}`}>{got}/{m.max}{m.override != null && " (marked by instructor)"}</span>
            </p>
            {qn.kind === "mcq" ? (
              <ul className="flex flex-col gap-1 text-[0.9375rem]">
                {(item.order ?? qn.options.map((_, i) => i)).map((orig, shown) => {
                  const chosen = given === String(shown);
                  const right = orig === qn.answer;
                  return (
                    <li key={orig} className={reveal && right ? "font-semibold text-royal" : chosen ? (right ? "font-semibold text-royal" : "text-[#8a1c1c]") : "text-muted"}>
                      {chosen ? "● " : "○ "}{qn.options[orig]}{reveal && right && " ✓"}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <>
                <p className="whitespace-pre-wrap rounded-xl bg-mist px-4 py-3 text-[0.9375rem] text-ink">{given || <em className="text-muted">No answer</em>}</p>
                {reveal && qn.kind === "short" && <p className="text-sm text-muted"><strong className="text-navy">A good answer:</strong> {qn.model}</p>}
                {reveal && qn.kind === "list" && <p className="text-sm text-muted"><strong className="text-navy">Accepted items:</strong> {qn.items.map((g) => g[0]).join("; ")}</p>}
              </>
            )}
            {reveal && qn.kind === "mcq" && qn.why && <p className="text-sm text-muted">{qn.why}</p>}
          </li>
        );
      })}
    </ol>
  );
}
