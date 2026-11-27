import Link from "next/link";
import { CourseNav } from "@/components/learn/CourseNav";
import { loadLearner } from "@/lib/learner";

export default async function LearnLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { outline, progress } = await loadLearner(slug);
  return (
    <>
      <div className="bg-navy text-white">
        <div className="container-site flex flex-wrap items-center gap-x-8 gap-y-3 py-5">
          <div className="flex min-w-0 flex-1 flex-col">
            <Link href={`/learn/${slug}/`} className="text-[clamp(1.25rem,2.4vw,1.6rem)] font-bold leading-tight text-white no-underline hover:text-gold">{outline.course.title}</Link>
          </div>
          <div className="flex w-full max-w-xs items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-navy-2" role="progressbar" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress">
              <div className="h-full rounded-full bg-gold" style={{ width: `${progress.percent}%` }} />
            </div>
            <span className="text-sm font-semibold text-gold">{progress.percent}%</span>
          </div>
        </div>
      </div>
      <div className="container-site grid items-start gap-10 py-[clamp(2rem,4vw,3rem)] lg:grid-cols-[19rem_1fr]">
        <CourseNav slug={slug} outline={outline} progress={progress} />
        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}
