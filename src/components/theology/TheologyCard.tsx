import Link from "next/link";
import type { TheologyCourse } from "@/content/theology/types";

/** A course in the School of Theology catalogue. */
export function TheologyCard({ c, n }: { c: TheologyCourse; n?: number }) {
  return (
    <Link href={`/courses/theology/${c.slug}/`} className="flex h-full flex-col gap-2 rounded-2xl border border-line bg-white p-5 text-ink no-underline hover:border-royal hover:text-ink">
      <span className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.12em] text-royal">
        <span>{n ? `TH ${String(n).padStart(3, "0")}` : c.level}</span>
        <span className="text-muted">{c.modules.length} weeks</span>
      </span>
      <span className="text-lg font-semibold leading-snug text-navy">{c.title}</span>
      <span className="line-clamp-3 text-[0.9375rem] text-muted">{c.summary}</span>
      <span className="mt-auto pt-1 text-xs font-semibold text-royal">{c.level}</span>
    </Link>
  );
}
