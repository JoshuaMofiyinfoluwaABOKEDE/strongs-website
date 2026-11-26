import type { Metadata } from "next";
import Link from "next/link";
import { CatalogBrowser, type Filters } from "@/components/CatalogBrowser";
import { LearnBar } from "@/components/learn/LearnBar";
import { getCatalogItems, getSubjects } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "All courses",
  description: "Browse every STRONGS course by subject, programme and level: the Bible, theology, Christian living, church history, evangelism, ministry and more.",
};

const many = (v: string | string[] | undefined) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function CourseSearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const [items, subjects] = await Promise.all([getCatalogItems(), getSubjects()]);
  const initial: Filters = {
    q: one(sp.q),
    subjects: many(sp.subject),
    levels: many(sp.level),
    programs: many(sp.program),
    openOnly: one(sp.open) === "1",
    sort: one(sp.sort) || "relevance",
    view: one(sp.view) === "list" ? "list" : "grid",
  };
  const title = initial.subjects.length === 1 ? subjects.find((s) => s.id === initial.subjects[0])?.name ?? "All courses" : "All courses";
  return (
    <div className="edx">
      <LearnBar />
      <section className="bg-navy text-white">
        <div className="container-site flex flex-col gap-2 py-[clamp(1.5rem,4vw,2.75rem)]">
          <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-pale sm:text-sm"><Link href="/courses/" className="text-pale hover:text-white">Courses</Link> <span aria-hidden="true">›</span> {title}</nav>
          <h1 className="text-[clamp(1.5rem,3.6vw,2.6rem)] font-bold leading-tight">{title}</h1>
          <p className="text-[0.9375rem] text-pale sm:text-base">Search and filter {items.length} STRONGS courses.</p>
        </div>
      </section>
      <section className="bg-mist">
        <div className="container-site py-[clamp(1.25rem,3.5vw,2.5rem)]">
          <CatalogBrowser items={items.map(({ featured: _f, effort: _e, ...i }) => i)} subjects={subjects.map(({ id, name }) => ({ id, name }))} initial={initial} />
        </div>
      </section>
    </div>
  );
}
