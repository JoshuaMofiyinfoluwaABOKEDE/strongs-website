"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Article } from "@/content/articles";
import { Search } from "@/components/icons";

/** Searchable, filterable list of articles. Without JavaScript every article is still listed. */
export function ArticleList({ articles, themes }: { articles: Article[]; themes: string[] }) {
  const [theme, setTheme] = useState("All");
  const [q, setQ] = useState("");

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return articles.filter(
      (a) =>
        (theme === "All" || a.theme === theme) &&
        (!needle || a.title.toLowerCase().includes(needle) || a.body.some((p) => p.toLowerCase().includes(needle))),
    );
  }, [articles, theme, q]);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-4">
        <label className="flex min-h-14 max-w-2xl items-center gap-3 rounded-full border-[1.5px] border-steel bg-white px-5 text-muted focus-within:border-royal">
          <Search size={20} />
          <span className="sr-only">Search articles</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by word or topic"
            className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none"
          />
        </label>
        <div role="group" aria-label="Filter by theme" className="flex flex-wrap gap-2">
          {["All", ...themes].map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={theme === t}
              onClick={() => setTheme(t)}
              className={`min-h-11 cursor-pointer rounded-full border-[1.5px] px-4 text-sm font-medium ${
                theme === t ? "border-navy bg-navy text-white" : "border-steel bg-white text-ink hover:border-royal"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <p role="status" className="text-sm text-muted">
          {shown.length} {shown.length === 1 ? "article" : "articles"}
        </p>
      </div>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((a) => (
          <li key={a.slug} className="flex flex-col gap-2.5 rounded-3xl border border-line p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-royal">{a.theme}</p>
            <h3 className="text-xl font-semibold leading-snug">
              <Link href={`/resources/${a.slug}/`} className="text-navy no-underline hover:text-royal">{a.title}</Link>
            </h3>
            <p className="text-[0.9375rem] text-muted">{a.excerpt}</p>
            <p className="mt-auto pt-2 text-sm text-muted">{a.author} · {a.minutes} min read</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
