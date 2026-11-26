"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CourseCard } from "@/components/CourseCard";
import { Clock, Search } from "@/components/icons";
import type { CourseCategory } from "@/content/courses";

export type BrowserItem = {
  slug: string;
  href: string;
  title: string;
  summary: string;
  subject: CourseCategory;
  level: string;
  weeks: number;
  program: string | null;
  code: string | null;
  open: boolean;
  search: string;
};
type Subject = { id: string; name: string };
export type Filters = { q: string; subjects: string[]; levels: string[]; programs: string[]; openOnly: boolean; sort: string; view: "grid" | "list" };

const STRONGS_SHORT = "Short courses";

/** The edX-style course list: search, filters down the side (a panel on phones), grid or list results. */
export function CatalogBrowser({ items, subjects, initial }: { items: BrowserItem[]; subjects: Subject[]; initial: Filters }) {
  const [f, setF] = useState<Filters>(initial);
  const [panel, setPanel] = useState(false);
  const levels = useMemo(() => [...new Set(items.map((i) => i.level))], [items]);
  const programs = useMemo(() => [...new Set(items.map((i) => i.program ?? STRONGS_SHORT))], [items]);
  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? id;

  const results = useMemo(() => {
    const words = f.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const list = items.filter(
      (i) =>
        words.every((w) => i.search.includes(w)) &&
        (!f.subjects.length || f.subjects.includes(i.subject)) &&
        (!f.levels.length || f.levels.includes(i.level)) &&
        (!f.programs.length || f.programs.includes(i.program ?? STRONGS_SHORT)) &&
        (!f.openOnly || i.open),
    );
    if (f.sort === "az") list.sort((a, b) => a.title.localeCompare(b.title));
    else if (f.sort === "short") list.sort((a, b) => a.weeks - b.weeks);
    else list.sort((a, b) => Number(b.open) - Number(a.open));
    return list;
  }, [items, f]);

  // Keep the address in step, so a filtered list can be bookmarked or shared.
  useEffect(() => {
    const p = new URLSearchParams();
    if (f.q) p.set("q", f.q);
    f.subjects.forEach((s) => p.append("subject", s));
    f.levels.forEach((s) => p.append("level", s));
    f.programs.forEach((s) => p.append("program", s));
    if (f.openOnly) p.set("open", "1");
    if (f.sort !== "relevance") p.set("sort", f.sort);
    if (f.view !== "grid") p.set("view", f.view);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [f]);

  const toggle = (key: "subjects" | "levels" | "programs", v: string) =>
    setF((x) => ({ ...x, [key]: x[key].includes(v) ? x[key].filter((y) => y !== v) : [...x[key], v] }));
  const count = (pred: (i: BrowserItem) => boolean) => items.filter(pred).length;
  const active = [...f.subjects.map((s) => ["subjects", s, subjectName(s)] as const), ...f.levels.map((s) => ["levels", s, s] as const), ...f.programs.map((s) => ["programs", s, s] as const)];
  const clear = () => setF((x) => ({ ...x, q: "", subjects: [], levels: [], programs: [], openOnly: false }));

  const filters = (
    <div className="flex flex-col gap-6">
      <Group title="Subject">
        {subjects.filter((s) => count((i) => i.subject === s.id) > 0).map((s) => (
          <Check key={s.id} label={s.name} n={count((i) => i.subject === s.id)} checked={f.subjects.includes(s.id)} onChange={() => toggle("subjects", s.id)} />
        ))}
      </Group>
      <Group title="Programme">
        {programs.map((p) => <Check key={p} label={p === STRONGS_SHORT ? "STRONGS short courses" : `STRONGS ${p}`} n={count((i) => (i.program ?? STRONGS_SHORT) === p)} checked={f.programs.includes(p)} onChange={() => toggle("programs", p)} />)}
      </Group>
      <Group title="Level">
        {levels.map((l) => <Check key={l} label={l} n={count((i) => i.level === l)} checked={f.levels.includes(l)} onChange={() => toggle("levels", l)} />)}
      </Group>
      <Group title="Availability">
        <Check label="Open for enrolment now" n={count((i) => i.open)} checked={f.openOnly} onChange={() => setF((x) => ({ ...x, openOnly: !x.openOnly }))} />
      </Group>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 rounded-full border border-steel bg-white p-1.5 pl-5">
        <label htmlFor="cat-q" className="sr-only">Search courses</label>
        <span className="text-muted"><Search size={20} /></span>
        <input id="cat-q" type="search" value={f.q} onChange={(e) => setF((x) => ({ ...x, q: e.target.value }))} placeholder="Search courses" className="min-w-0 flex-1 bg-transparent py-2 text-[0.9375rem] outline-none placeholder:text-muted" />
      </form>

      <div className="grid items-start gap-8 lg:grid-cols-[16rem_1fr]">
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-28 flex flex-col gap-4">
            <div className="flex items-center justify-between"><h2 className="font-bold text-navy">Filter by</h2>{(active.length > 0 || f.openOnly || f.q) && <button type="button" onClick={clear} className="cursor-pointer text-sm font-semibold text-royal">Clear all</button>}</div>
            {filters}
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p role="status" className="text-[0.9375rem] text-ink"><strong className="text-navy">{results.length}</strong> {results.length === 1 ? "course" : "courses"}{f.q && <> for &ldquo;{f.q}&rdquo;</>}</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPanel(true)} className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border border-steel bg-white px-3.5 text-sm font-semibold text-navy lg:hidden">
                Filters{active.length + Number(f.openOnly) > 0 && <span className="rounded-full bg-navy px-1.5 text-xs text-white">{active.length + Number(f.openOnly)}</span>}
              </button>
              <label className="sr-only" htmlFor="cat-sort">Sort</label>
              <select id="cat-sort" value={f.sort} onChange={(e) => setF((x) => ({ ...x, sort: e.target.value }))} className="min-h-9 cursor-pointer rounded-full border border-steel bg-white px-3 text-sm text-navy">
                <option value="relevance">Open first</option>
                <option value="az">A to Z</option>
                <option value="short">Shortest first</option>
              </select>
              <div role="group" aria-label="View" className="hidden rounded-full border border-steel bg-white p-0.5 sm:flex">
                {(["grid", "list"] as const).map((v) => (
                  <button key={v} type="button" aria-pressed={f.view === v} onClick={() => setF((x) => ({ ...x, view: v }))} className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold capitalize ${f.view === v ? "bg-navy text-white" : "text-navy"}`}>{v}</button>
                ))}
              </div>
            </div>
          </div>

          {active.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Active filters">
              {active.map(([key, v, label]) => (
                <li key={key + v}><button type="button" onClick={() => toggle(key, v)} className="cursor-pointer rounded-full bg-mist px-3 py-1 text-[0.8125rem] font-medium text-navy hover:bg-line">{label} ✕</button></li>
              ))}
            </ul>
          )}

          {results.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-white p-6">
              <p className="font-semibold text-navy">No courses match.</p>
              <p className="text-[0.9375rem] text-muted">Try another word, or clear some filters.</p>
              <button type="button" onClick={clear} className="btn btn-navy cursor-pointer border-0">Clear all</button>
            </div>
          ) : f.view === "list" ? (
            <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-white">
              {results.map((c) => (
                <li key={c.slug}>
                  <Link href={c.href} className="flex flex-col gap-1 p-4 text-ink no-underline hover:bg-mist sm:p-5">
                    <span className="flex flex-wrap items-center gap-x-2 text-xs font-semibold uppercase tracking-[0.1em] text-royal">{c.code && <span>{c.code}</span>}<span>{subjectName(c.subject)}</span>{c.program && <span className="text-muted">· {c.program}</span>}</span>
                    <span className="text-base font-bold text-navy sm:text-lg">{c.title}</span>
                    <span className="line-clamp-2 text-sm text-muted">{c.summary}</span>
                    <span className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs font-semibold text-muted"><span className="flex items-center gap-1"><Clock size={14} />{c.weeks} weeks</span><span>{c.level}</span><span className={c.open ? "text-royal" : ""}>{c.open ? "Open for enrolment" : "Coming soon"}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
              {results.map((c) => <li key={c.slug}><CourseCard course={c} /></li>)}
            </ul>
          )}
        </div>
      </div>

      {panel && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button type="button" aria-label="Close filters" className="flex-1 cursor-pointer bg-navy/50" onClick={() => setPanel(false)} />
          <div className="flex w-[min(22rem,88vw)] flex-col bg-white">
            <div className="flex items-center justify-between border-b border-line px-5 py-4"><h2 className="font-bold text-navy">Filter by</h2><button type="button" onClick={() => setPanel(false)} className="cursor-pointer text-2xl leading-none text-navy" aria-label="Close">×</button></div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{filters}</div>
            <div className="flex gap-3 border-t border-line px-5 py-4">
              <button type="button" onClick={clear} className="btn btn-line flex-1 cursor-pointer">Clear</button>
              <button type="button" onClick={() => setPanel(false)} className="btn btn-navy flex-1 cursor-pointer border-0">Show {results.length}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="pb-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">{title}</legend>
      {children}
    </fieldset>
  );
}

function Check({ label, n, checked, onChange }: { label: string; n: number; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[0.9375rem] text-ink">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-[var(--color-navy)]" />
      <span className="flex-1">{label}</span>
      <span className="text-xs text-muted">{n}</span>
    </label>
  );
}
