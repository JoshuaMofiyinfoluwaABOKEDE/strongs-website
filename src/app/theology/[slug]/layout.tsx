import type { Metadata } from "next";
import Link from "next/link";
import { LearnBar } from "@/components/learn/LearnBar";
import { TheologyNav } from "@/components/theology/TheologyNav";
import { loadTheology } from "@/lib/theology/learner";

export const metadata: Metadata = { robots: { index: false } };

export default async function TheologyLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { c, g } = await loadTheology(slug);
  return (
    <>
      <LearnBar />
      <div className="bg-navy text-white">
        <div className="container-site flex flex-wrap items-center gap-x-8 gap-y-3 py-5">
          <div className="flex min-w-0 flex-1 flex-col">
            <Link href="/courses/theology/" className="text-xs font-bold uppercase tracking-[0.16em] text-gold no-underline hover:text-gold-light">STRONGS School of Theology</Link>
            <Link href={`/theology/${slug}/`} className="text-[clamp(1.25rem,2.4vw,1.6rem)] font-bold leading-tight text-white no-underline hover:text-gold">{c.title}</Link>
          </div>
          <div className="flex w-full max-w-xs items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-navy-2" role="progressbar" aria-valuenow={g.percentDone} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress">
              <div className="h-full rounded-full bg-gold" style={{ width: `${g.percentDone}%` }} />
            </div>
            <span className="text-sm font-semibold text-gold">{g.percentDone}%</span>
          </div>
        </div>
      </div>
      <div className="container-site grid items-start gap-10 py-[clamp(2rem,4vw,3rem)] lg:grid-cols-[19rem_1fr]">
        <TheologyNav c={c} g={g} />
        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}
