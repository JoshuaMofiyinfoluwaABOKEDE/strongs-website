/**
 * The shape of a STRONGS School of Theology course file (src/content/theology/courses/<slug>.json).
 * One module = one week. Lesson text is Markdown. Scripture references use the KJV book names.
 *
 * Quiz banks are built from each module's own questions plus questions generated from its
 * key terms and key texts (see src/lib/theology/content.ts), so every module has 20+ questions.
 */

export type TheologyLesson = {
  title: string;
  /** Markdown. Short: a few paragraphs. */
  body: string;
  /** KJV references, e.g. "John 1:1-3". */
  refs: string[];
};

export type TheologyTerm = { term: string; def: string };
export type TheologyText = { ref: string; teaches: string };

/** A multiple-choice question. `answer` is the index of the correct option. */
export type TheologyMcq = { q: string; options: string[]; answer: number; why?: string };

/** Marked by keywords: each group lists words or phrases that count for that point (any one matches). */
export type TheologyShort = { q: string; keywords: string[][]; model: string };

/** Learner lists items; each item is a group of accepted spellings. `need` = how many earn full marks. */
export type TheologyList = { q: string; items: string[][]; need: number };

export type TheologyModule = {
  title: string;
  /** What the week is about, in one or two sentences. */
  intro: string;
  lessons: TheologyLesson[];
  terms: TheologyTerm[];
  texts: TheologyText[];
  /** Three to five summary points. */
  summary: string[];
  questions: TheologyMcq[];
};

export type TheologyAssignment = { title: string; prompt: string; words: string };

export type TheologyCourse = {
  slug: string;
  title: string;
  track: string;
  level: "Foundation" | "Intermediate" | "Advanced";
  summary: string;
  description: string;
  objectives: string[];
  outcomes: string[];
  modules: TheologyModule[];
  /** Short-answer and list questions used by the test and the exam. */
  written: { short: TheologyShort[]; lists: TheologyList[] };
  assignments: TheologyAssignment[];
  examMinutes: number;
  /** Who the course is for (shown on the course page). A sensible default is used if omitted. */
  audience?: string[];
  /** Optional reading suggestions (titles and authors only). */
  reading?: string[];
};
