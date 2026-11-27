import type { Metadata } from "next";
import Link from "next/link";
import { NotConnected } from "@/components/learn/NotConnected";
import { hasDatabase, one } from "@/lib/db";
import { getMyCourses, percent } from "@/lib/lms";
import { requireUser } from "@/lib/session";
import { updateName } from "@/app/learn/actions";
import { signOut } from "@/app/account-actions";
import { getTheologyCourse } from "@/lib/theology/content";
import { theologySummary } from "@/lib/theology/progress";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My learning", robots: { index: false } };

const date = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  if (!hasDatabase) return <NotConnected />;
  const { saved, error } = await searchParams;
  const user = await requireUser("/dashboard/");
  const me = await one<{ name: string; email: string; createdAt: string }>(`SELECT name, email, "createdAt" FROM "user" WHERE id = $1`, [user.id]);
  const mine = await getMyCourses(user.id);
  const th = await theologySummary(user.id, mine.filter((c) => c.school === "theology"), getTheologyCourse);
  const pct = (c: (typeof mine)[number]) => th.get(c.course_id)?.percentDone ?? percent(c.complete, c.total);
  const href = (c: (typeof mine)[number]) => (c.school === "theology" ? `/theology/${c.slug}/` : `/learn/${c.slug}/`);
  const active = mine.filter((c) => !c.completed_at);
  const finished = mine.filter((c) => c.completed_at);
  const latest = active[0];

  return (
    <div className="edx">
      <section className="bg-navy text-white">
        <div className="container-site flex flex-col gap-5 py-[clamp(2.5rem,5vw,4rem)]">
          <p className="eyebrow-dark">My learning</p>
          <h1 className="text-[clamp(1.625rem,4.6vw,3.4rem)] font-bold leading-[1.08] tracking-[-0.02em]">Welcome, {(me?.name ?? user.name).split(" ")[0]}.</h1>
          {latest ? (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <p className="lead text-pale">Continue <strong className="text-white">{latest.title}</strong> · {pct(latest)}% complete</p>
              <Link href={href(latest)} className="btn btn-gold">Continue learning</Link>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <p className="lead text-pale">{mine.length ? "You have finished all your courses. Choose another." : "You have not enrolled in a course yet."}</p>
              <Link href="/courses/" className="btn btn-gold">Browse the courses</Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white">
        <div className="container-site section-pad grid items-start gap-12 lg:grid-cols-[1fr_22rem]">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-navy">My courses</h2>
              {active.length === 0 ? (
                <p className="text-muted">No courses in progress.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-line border-y border-line">
                  {active.map((c) => {
                    const pc = pct(c);
                    return (
                      <li key={c.course_id} className="flex flex-wrap items-center gap-x-6 gap-y-3 py-5">
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <Link href={href(c)} className="text-lg font-semibold text-navy no-underline hover:text-royal">{c.title}</Link>
                          {c.school === "theology" && <p className="text-xs font-bold uppercase tracking-[0.12em] text-royal">School of Theology</p>}
                          <div className="flex max-w-sm items-center gap-3">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-mist"><div className="h-full rounded-full bg-royal" style={{ width: `${pc}%` }} /></div>
                            <span className="text-sm font-semibold text-royal">{pc}%</span>
                          </div>
                          <p className="text-xs text-muted">Enrolled {date(c.enrolled_at)} · last studied {date(c.last_active_at)}</p>
                        </div>
                        <Link href={href(c)} className="btn btn-line">{pc ? "Continue" : "Start"}</Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-navy">Completed and certificates</h2>
              {finished.length === 0 ? (
                <p className="text-muted">Finish a course and its certificate will appear here, ready to download.</p>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2">
                  {finished.map((c) => (
                    <li key={c.course_id} className="flex flex-col gap-3 rounded-2xl bg-navy p-5 text-white">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">Completed {date(c.completed_at!)}</p>
                      <p className="text-lg font-semibold leading-snug">{c.title}</p>
                      {c.certificate ? (
                        <div className="flex flex-wrap gap-3 pt-1">
                          <a href={`/certificates/${c.certificate}/pdf/`} className="btn btn-gold min-h-10 px-4 text-sm">Download certificate</a>
                          <Link href={`/certificates/${c.certificate}/`} className="text-sm font-semibold text-pale hover:text-white">Share link</Link>
                        </div>
                      ) : c.school === "theology" && th.get(c.course_id) && !th.get(c.course_id)!.passed ? (
                        <p className="text-sm text-pale">Total {th.get(c.course_id)!.total}%: below the 70% pass mark. <Link href={href(c)} className="text-gold">See your grades</Link></p>
                      ) : (
                        <p className="text-sm text-pale">Certificate withheld. Please contact STRONGS.</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <aside className="flex flex-col gap-4 rounded-3xl border border-line p-6">
            <h2 className="text-lg font-bold text-navy">Name on your certificates</h2>
            <form action={updateName} className="flex flex-col gap-3">
              <input name="name" defaultValue={me?.name ?? user.name} required minLength={2} maxLength={80} className="field" aria-label="Full name" />
              <button type="submit" className="btn btn-navy cursor-pointer self-start border-0 font-[inherit]">Save</button>
              {saved && <p role="status" className="text-sm text-royal">Saved. New certificates will carry this name.</p>}
              {error === "name" && <p role="alert" className="text-sm text-[#8a1c1c]">Please enter your full name.</p>}
            </form>
            <p className="text-sm text-muted">Signed in as {me?.email ?? user.email}. Certificates already issued keep the name they were issued with; ask STRONGS if one needs correcting.</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 text-sm">
              {user.role === "admin" && <Link href="/admin/" className="font-semibold no-underline">Admin</Link>}
              {(user.role === "instructor" || user.role === "admin") && <Link href="/instructor/" className="font-semibold no-underline">Grading</Link>}
              <form action={signOut}>
                <button type="submit" className="cursor-pointer border-0 bg-transparent p-0 font-[inherit] font-semibold text-royal hover:underline">Sign out</button>
              </form>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
