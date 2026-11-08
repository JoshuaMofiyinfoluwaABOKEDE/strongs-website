/**
 * Articles by Agboola Abigail, a STRONGS commentator, and excerpts from STRONGS books (book-articles.json).
 * articles.json is generated from her Word documents by scripts/make_articles.py.
 * The titles and themes were written for the website and are waiting for her approval;
 * the article text is hers, unedited.
 */
import data from "./articles.json";
import bookData from "./book-articles.json";

export type Article = {
  slug: string;
  title: string;
  theme: string;
  author: string;
  minutes: number;
  excerpt: string;
  body: string[];
  /** Set when the article is an excerpt from a STRONGS book. */
  book?: string;
};

/** Book excerpts come first, so the newest writing shows on the home page. */
export const articles: Article[] = [
  ...bookData.map((a) => ({ ...a, book: "the-transitioning-phase-of-mans-life" })),
  ...data,
];

export const themes = Array.from(new Set(articles.map((a) => a.theme))).sort();

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}
