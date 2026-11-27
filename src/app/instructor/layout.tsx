import type { Metadata } from "next";
import Link from "next/link";
import { NotConnected } from "@/components/learn/NotConnected";
import { hasDatabase, one } from "@/lib/db";
import { requireInstructor } from "@/lib/session";

export const metadata: Metadata = { title: "School of Theology grading", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  if (!hasDatabase) return <NotConnected />;
  const me = await requireInstructor();
  const n = await one<{ subs: number; papers: number }>(
    `SELECT (SELECT count(*)::int FROM th_submission WHERE status='submitted') AS subs,
            (SELECT count(*)::int FROM th_attempt WHERE kind IN ('test','exam') AND status='submitted' AND reviewed_at IS NULL) AS papers`,
  );
  const nav: [string, string, number?][] = [
    ["/instructor/", "Overview"],
    ["/instructor/submissions/", "Assignments to grade", n?.subs],
    ["/instructor/papers/", "Tests and exams", n?.papers],
    ["/instructor/gradebook/", "Gradebook"],
  ];
  return (
    <>
      <div className="container-site grid items-start gap-8 py-8 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="Instructor" className="flex gap-1 overflow-x-auto lg:sticky lg:top-28 lg:flex-col">
          <p className="hidden px-3 pb-2 text-xs font-bold uppercase tracking-[0.14em] text-royal lg:block">School of Theology</p>
          {nav.map(([href, label, c]) => (
            <Link key={href} href={href} className="flex items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-navy no-underline hover:bg-mist hover:text-royal">
              {label}{!!c && <span className="rounded-full bg-gold px-2 text-xs font-bold text-navy">{c}</span>}
            </Link>
          ))}
          {me.role === "admin" && <Link href="/admin/" className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-muted no-underline hover:bg-mist">← Courses admin</Link>}
        </nav>
        <div className="flex min-w-0 flex-col gap-6">{children}</div>
      </div>
    </>
  );
}
