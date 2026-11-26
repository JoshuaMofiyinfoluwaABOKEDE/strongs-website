import type { Metadata } from "next";
import Link from "next/link";
import { theologyOrder } from "@/content/theology/catalog";
import { LearnBar } from "@/components/learn/LearnBar";
import { CourseTabs } from "@/components/theology/CourseTabs";
import { loadTheology } from "@/lib/theology/learner";

export const metadata: Metadata = { robots: { index: false } };

export default async function TheologyLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { c, g } = await loadTheology(slug);
  const n = theologyOrder.findIndex((o) => o.slug === slug) + 1;
  return (
    <div className="edx">
      <LearnBar />
      <div className="bg-navy text-white">
        <div className="container-site flex flex-wrap items-end gap-x-8 gap-y-3 pt-4 sm:pt-5">
          <div className="flex min-w-0 flex-1 flex-col pb-3">
            <Link href="/courses/theology/" className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-gold sm:text-xs sm:tracking-[0.16em] no-underline hover:text-gold-light">STRONGS School of Theology · TH {String(n).padStart(3, "0")}</Link>
            <span className="text-[clamp(1.0625rem,2.4vw,1.6rem)] font-bold leading-tight">{c.title}</span>
          </div>
          <div className="flex w-full max-w-xs items-center gap-3 pb-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-navy-2" role="progressbar" aria-valuenow={g.percentDone} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress">
              <div className="h-full rounded-full bg-gold" style={{ width: `${g.percentDone}%` }} />
            </div>
            <span className="text-sm font-semibold text-gold">{g.percentDone}%</span>
          </div>
        </div>
        <CourseTabs slug={slug} />
      </div>
      <div className="bg-mist">
        <div className="container-site py-[clamp(1rem,3.5vw,2.5rem)]">{children}</div>
      </div>
    </div>
  );
}
