import Link from "next/link";
import type { TheologyCourse } from "@/content/theology/types";
import { courseHours } from "@/lib/theology/meta";

/** A course card in the School of Theology catalogue (UniAthena-style: badge, duration, start button). */
export function TheologyCard({ c, n }: { c: TheologyCourse; n?: number }) {
  return (
    <Link href={`/courses/theology/${c.slug}/`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white text-ink no-underline shadow-[0_1px_2px_rgba(11,31,58,0.06)] hover:border-royal hover:text-ink hover:shadow-[0_8px_24px_rgba(11,31,58,0.12)]">
      <span className="flex items-center justify-between gap-3 bg-navy px-5 py-3">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-gold">{n ? `TH ${String(n).padStart(3, "0")}` : "Theology"}</span>
        <span className="rounded-full bg-gold px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wide text-navy">Free certificate</span>
      </span>
      <span className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-lg font-semibold leading-snug text-navy">{c.title}</span>
        <span className="line-clamp-3 text-[0.9375rem] text-muted">{c.summary}</span>
        <span className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-2 text-xs font-semibold text-muted">
          <span>⏱ Self-paced · {c.modules.length} weeks ({courseHours(c)})</span>
          <span>▲ {c.level}</span>
        </span>
      </span>
      <span className="border-t border-line px-5 py-3 text-sm font-bold text-royal group-hover:bg-mist">Start now →</span>
    </Link>
  );
}
