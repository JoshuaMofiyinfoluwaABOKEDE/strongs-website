/**
 * Articles by Agboola Abigail, a STRONGS commentator.
 * articles.json is generated from her Word documents by scripts/make_articles.py.
 * The titles and themes were written for the website and are waiting for her approval;
 * the article text is hers, unedited.
 */
import data from "./articles.json";

export type Article = {
  slug: string;
  title: string;
  theme: string;
  author: string;
  minutes: number;
  excerpt: string;
  body: string[];
};

export const articles: Article[] = data;

export const themes = Array.from(new Set(articles.map((a) => a.theme))).sort();

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}
