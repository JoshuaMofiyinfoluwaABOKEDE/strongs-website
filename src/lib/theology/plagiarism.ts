import "server-only";
import { unzipSync, strFromU8 } from "fflate";
import { normalise } from "@/lib/theology/content";

/** Pulls plain text out of an uploaded file so it can be checked. Word (.docx), PDF and .txt. */
export async function extractText(bytes: Uint8Array, type: string, name: string): Promise<string> {
  try {
    if (/\.docx$/i.test(name) || type.includes("wordprocessingml")) {
      const files = unzipSync(bytes, { filter: (f) => f.name === "word/document.xml" });
      const xml = strFromU8(files["word/document.xml"] ?? new Uint8Array());
      return xml
        .replace(/<w:tab\/>/g, " ")
        .replace(/<\/w:p>/g, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
        .trim();
    }
    if (/\.pdf$/i.test(name) || type === "application/pdf") {
      const { extractText: pdfText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(bytes);
      const { text } = await pdfText(pdf, { mergePages: true });
      return String(text).trim();
    }
    if (/\.txt$/i.test(name) || type.startsWith("text/")) return new TextDecoder().decode(bytes).trim();
  } catch {
    return "";
  }
  return "";
}

/** Overlapping runs of five words. Shared runs are a strong sign of copied wording. */
function shingles(text: string, n = 5) {
  const w = normalise(text).trim().split(" ").filter(Boolean);
  const set = new Set<string>();
  for (let i = 0; i + n <= w.length; i++) set.add(w.slice(i, i + n).join(" "));
  return set;
}

export type SimilarityReport = {
  checkedAt: string;
  words: number;
  /** Share of the submission's wording (%) that also appears in at least one source. */
  overall: number;
  matches: { source: string; percent: number }[];
  note?: string;
};

/**
 * Compares a submission with other learners' submissions for the same assignment and with the
 * course's own lesson text. It cannot search the internet or tell whether AI wrote the text;
 * the learner's signed declaration covers that, and the instructor makes the judgement.
 */
export function similarity(text: string, sources: { label: string; text: string }[]): SimilarityReport {
  const mine = shingles(text);
  const words = normalise(text).trim().split(" ").filter(Boolean).length;
  const hit = new Set<string>();
  const matches = sources
    .map((s) => {
      const theirs = shingles(s.text);
      let n = 0;
      for (const sh of mine) if (theirs.has(sh)) { n++; hit.add(sh); }
      return { source: s.label, percent: mine.size ? Math.round((n / mine.size) * 100) : 0 };
    })
    .filter((m) => m.percent > 0)
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 5);
  return {
    checkedAt: new Date().toISOString(),
    words,
    overall: mine.size ? Math.round((hit.size / mine.size) * 100) : 0,
    matches,
    note: words < 40 ? "Very little text could be read, so the check is not reliable." : undefined,
  };
}
