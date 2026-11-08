/**
 * Articles and poems by STRONGS writers:
 * - articles.json: Agboola Abigail, generated from her documents by scripts/make_articles.py
 * - olaewe-articles.json: Godwin Ayorinde Olaewe (lightly corrected for spelling and punctuation)
 * - book-articles.json: excerpts from STRONGS books (see books.ts)
 * Titles and themes were written for the website, for the writers to approve.
 */
import abigail from "./articles.json";
import olaewe from "./olaewe-articles.json";
import bookData from "./book-articles.json";

export type Article = {
  slug: string;
  title: string;
  theme: string;
  author: string;
  minutes: number;
  excerpt: string;
  body: string[];
  /** "poem" keeps the line breaks of each stanza. */
  form?: "prose" | "poem";
  /** Set when the article is an excerpt from a STRONGS book. */
  book?: string;
};

const fromBook: Article[] = bookData.map((a) => ({ ...a, book: "the-transitioning-phase-of-mans-life" }));
const sources: Article[][] = [fromBook, olaewe as Article[], abigail as Article[]];

/** All writing, interleaved by writer so every voice appears near the top. */
export const articles: Article[] = (() => {
  const out: Article[] = [];
  const longest = Math.max(...sources.map((s) => s.length));
  for (let i = 0; i < longest; i++) for (const s of sources) if (s[i]) out.push(s[i]);
  return out;
})();

export const prose = articles.filter((a) => a.form !== "poem");
export const poems = articles.filter((a) => a.form === "poem");
export const writers = Array.from(new Set(articles.map((a) => a.author)));

export const themes = Array.from(new Set(prose.map((a) => a.theme))).sort();

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}
