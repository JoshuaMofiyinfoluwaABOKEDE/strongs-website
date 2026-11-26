import "server-only";
import { theologyOrder, theologyTracks } from "@/content/theology/catalog";
import { theologyCourses } from "@/content/theology/courses";
import type { TheologyCourse, TheologyList, TheologyShort } from "@/content/theology/types";

/** A question as stored in a bank. `answer` indexes `options` (for multiple choice). */
export type BankMcq = { id: string; kind: "mcq"; q: string; options: string[]; answer: number; why?: string };
export type BankShort = TheologyShort & { id: string; kind: "short" };
export type BankList = TheologyList & { id: string; kind: "list" };
export type BankQuestion = BankMcq | BankShort | BankList;

const bySlug = new Map<string, TheologyCourse>(theologyCourses.map((c) => [c.slug, c]));

/** All available courses, in teaching order. */
export function allTheologyCourses(): TheologyCourse[] {
  return theologyOrder.map((o) => bySlug.get(o.slug)).filter((c): c is TheologyCourse => !!c);
}

export function getTheologyCourse(slug: string): TheologyCourse | null {
  return bySlug.get(slug) ?? null;
}

export function tracksWithCourses() {
  const courses = allTheologyCourses();
  return theologyTracks
    .map((t) => ({ ...t, courses: courses.filter((c) => theologyOrder.find((o) => o.slug === c.slug)?.track === t.id) }))
    .filter((t) => t.courses.length > 0);
}

export const lessonKey = (week: number, lesson: number) => `w${week}l${lesson}`;
export const lessonKeys = (c: TheologyCourse) => c.modules.flatMap((m, w) => m.lessons.map((_, l) => lessonKey(w + 1, l + 1)));

/* ───────────── deterministic helpers ───────────── */

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Picks `n` distinct items from `pool` (excluding `not`), always the same ones for the same seed. */
function pickDistractors(pool: string[], not: string, n: number, seed: string) {
  const options = [...new Set(pool.filter((p) => p.trim().toLowerCase() !== not.trim().toLowerCase()))];
  const out: string[] = [];
  let h = hash(seed);
  while (out.length < n && options.length) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    out.push(options.splice(h % options.length, 1)[0]);
  }
  return out;
}

/* ───────────── question banks ───────────── */

const bankCache = new Map<string, BankMcq[][]>();

/**
 * The quiz bank for each week: the module's own questions, plus questions generated from its
 * key terms (term → meaning, meaning → term) and key texts (reference → teaching, teaching → reference).
 * Wrong options come from the rest of the course, so they are plausible.
 */
export function quizBanks(c: TheologyCourse): BankMcq[][] {
  const cached = bankCache.get(c.slug);
  if (cached) return cached;
  const allTerms = c.modules.flatMap((m) => m.terms);
  const allTexts = c.modules.flatMap((m) => m.texts);
  const banks = c.modules.map((m, w) => {
    const W = w + 1;
    const bank: BankMcq[] = m.questions.map((q, i) => ({ id: `w${W}q${i + 1}`, kind: "mcq", q: q.q, options: q.options, answer: q.answer, why: q.why }));
    m.terms.forEach((t, i) => {
      const defs = pickDistractors(allTerms.map((x) => x.def), t.def, 3, `${c.slug}w${W}td${i}`);
      if (defs.length === 3) bank.push({ id: `w${W}td${i + 1}`, kind: "mcq", q: `What does “${t.term}” mean?`, options: [t.def, ...defs], answer: 0, why: `${t.term}: ${t.def}` });
      const names = pickDistractors(allTerms.map((x) => x.term), t.term, 3, `${c.slug}w${W}dt${i}`);
      if (names.length === 3) bank.push({ id: `w${W}dt${i + 1}`, kind: "mcq", q: `Which term matches this meaning: “${t.def}”`, options: [t.term, ...names], answer: 0, why: `${t.term}: ${t.def}` });
    });
    m.texts.forEach((t, i) => {
      const teachings = pickDistractors(allTexts.map((x) => x.teaches), t.teaches, 3, `${c.slug}w${W}rt${i}`);
      if (teachings.length === 3) bank.push({ id: `w${W}rt${i + 1}`, kind: "mcq", q: `In this course, what is ${t.ref} cited to show?`, options: [t.teaches, ...teachings], answer: 0, why: `${t.ref}: ${t.teaches}` });
      const refs = pickDistractors(allTexts.map((x) => x.ref), t.ref, 3, `${c.slug}w${W}tr${i}`);
      if (refs.length === 3) bank.push({ id: `w${W}tr${i + 1}`, kind: "mcq", q: `Which passage is cited in this course for this truth: “${t.teaches}”`, options: [t.ref, ...refs], answer: 0, why: `${t.ref}: ${t.teaches}` });
    });
    return bank;
  });
  bankCache.set(c.slug, banks);
  return banks;
}

export function writtenPool(c: TheologyCourse) {
  return {
    short: c.written.short.map((s, i) => ({ ...s, id: `s${i + 1}`, kind: "short" as const })),
    lists: c.written.lists.map((l, i) => ({ ...l, id: `l${i + 1}`, kind: "list" as const })),
  };
}

/** Finds any question in the course by its id. */
export function findQuestion(c: TheologyCourse, id: string): BankQuestion | null {
  if (/^s\d+$/.test(id)) return writtenPool(c).short.find((s) => s.id === id) ?? null;
  if (/^l\d+$/.test(id)) return writtenPool(c).lists.find((s) => s.id === id) ?? null;
  const w = Number(id.match(/^w(\d+)/)?.[1]);
  return quizBanks(c)[w - 1]?.find((q) => q.id === id) ?? null;
}

/* ───────────── random papers ───────────── */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** One question on a learner's paper. `order` is how the options were shuffled for them. */
export type PaperItem = { id: string; kind: "mcq" | "short" | "list"; order?: number[] };

const toItem = (q: BankQuestion): PaperItem =>
  q.kind === "mcq" ? { id: q.id, kind: "mcq", order: shuffle(q.options.map((_, i) => i)) } : { id: q.id, kind: q.kind };

export function quizPaper(c: TheologyCourse, week: number, n: number): PaperItem[] {
  return shuffle(quizBanks(c)[week - 1] ?? []).slice(0, n).map(toItem);
}

export function writtenPaper(c: TheologyCourse, mcq: number, short: number, lists: number): PaperItem[] {
  const all = quizBanks(c).flat();
  // Spread the objective questions across the weeks before topping up at random.
  const perWeek = quizBanks(c).map((b) => shuffle(b));
  const picked: BankMcq[] = [];
  for (let round = 0; picked.length < mcq && round < 50; round++) {
    for (const b of perWeek) if (b[round] && picked.length < mcq) picked.push(b[round]);
  }
  if (picked.length < mcq) picked.push(...shuffle(all.filter((q) => !picked.includes(q))).slice(0, mcq - picked.length));
  const w = writtenPool(c);
  return [...shuffle(picked).map(toItem), ...shuffle(w.short).slice(0, short).map(toItem), ...shuffle(w.lists).slice(0, lists).map(toItem)];
}

/* ───────────── marking ───────────── */

export const normalise = (s: string) =>
  ` ${s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()} `;

/** True if any phrase in the group appears in the answer (whole words; simple word endings allowed). */
export function groupMatches(answer: string, group: string[]) {
  const a = normalise(answer);
  return group.some((phrase) => {
    const p = normalise(phrase).trim();
    if (!p) return false;
    if (a.includes(` ${p} `)) return true;
    // Allow common endings: faith/faithful, justify/justified, repent/repentance.
    if (!p.includes(" ") && p.length >= 5) {
      const stem = p.replace(/(ation|ment|ness|ing|ed|es|s|y|e)$/, "");
      return new RegExp(` ${stem}[a-z]{0,6} `).test(a);
    }
    return false;
  });
}

export const MAX_MARKS = { mcq: 1, short: 2, list: 2 } as const;

export type Mark = { auto: number; max: number; override?: number | null };

/** Marks one answer automatically. */
export function autoMark(q: BankQuestion, item: PaperItem, answer: string | undefined): Mark {
  if (q.kind === "mcq") {
    const shown = Number(answer);
    const original = item.order ? item.order[shown] : shown;
    return { auto: Number.isFinite(shown) && original === q.answer ? 1 : 0, max: 1 };
  }
  const text = answer ?? "";
  if (q.kind === "short") {
    const hit = q.keywords.filter((g) => groupMatches(text, g)).length;
    return { auto: Math.round((hit / Math.max(1, q.keywords.length)) * 2 * 10) / 10, max: 2 };
  }
  const found = q.items.filter((g) => groupMatches(text, g)).length;
  return { auto: Math.round((Math.min(found, q.need) / q.need) * 2 * 10) / 10, max: 2 };
}

export const markValue = (m: Mark) => (m.override != null ? m.override : m.auto);

export function percentOf(marks: Record<string, Mark>) {
  const vals = Object.values(marks);
  const max = vals.reduce((n, m) => n + m.max, 0);
  const got = vals.reduce((n, m) => n + Math.min(m.max, Math.max(0, markValue(m))), 0);
  return max ? Math.round((got / max) * 100) : 0;
}
