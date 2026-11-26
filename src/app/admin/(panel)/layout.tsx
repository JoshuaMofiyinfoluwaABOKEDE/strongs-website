import type { Metadata } from "next";
import Link from "next/link";
import { LearnBar } from "@/components/learn/LearnBar";
import { NotConnected } from "@/components/learn/NotConnected";
import { hasDatabase, one } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Courses admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!hasDatabase) return <NotConnected />;
  await requireAdmin();
  const pending = await one<{ n: number }>(`SELECT count(*)::int AS n FROM lms_submission WHERE status = 'pending'`);
  const nav: [string, string, number?][] = [
    ["/admin/", "Overview"],
    ["/admin/courses/", "Courses and lessons"],
    ["/admin/students/", "Students"],
    ["/admin/enrolments/", "Enrolments"],
    ["/admin/submissions/", "Assignments to review", pending?.n],
    ["/admin/certificates/", "Certificates"],
    ["/admin/standards/", "Course standards"],
  ];
  return (
    <>
      <LearnBar />
      <div className="container-site grid items-start gap-8 py-8 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto lg:sticky lg:top-28 lg:flex-col">
          <p className="hidden px-3 pb-2 text-xs font-bold uppercase tracking-[0.14em] text-royal lg:block">Courses admin</p>
          {nav.map(([href, label, n]) => (
            <Link key={href} href={href} className="flex items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-navy no-underline hover:bg-mist hover:text-royal">
              {label}
              {!!n && <span className="rounded-full bg-gold px-2 text-xs font-bold text-navy">{n}</span>}
            </Link>
          ))}
        </nav>
        <div className="flex min-w-0 flex-col gap-6">{children}</div>
      </div>
    </>
  );
}
