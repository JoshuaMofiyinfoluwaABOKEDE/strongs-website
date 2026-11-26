import Link from "next/link";
import { examOpen, testOpen } from "@/lib/theology/progress";
import { theologyRules } from "@/content/theology/catalog";
import { courseUnits } from "@/components/theology/Units";
import { one } from "@/lib/db";
import { loadTheology } from "@/lib/theology/learner";

export const dynamic = "force-dynamic";

const icon = { lesson: "▤", review: "☰", quiz: "✎" } as const;

/** The Course tab (edX-style outline): welcome, Resume, and every week and unit with its status. */
export default async function TheologyHome({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { user, c, row, g } = await loadTheology(slug);
  const units = courseUnits(c, g);
  const last = g.lastKey ? units.find((u) => u.key === g.lastKey) : null;
  const next = units.find((u) => !u.done);
  const resume = last && !last.done ? last : next;
  const base = `/theology/${slug}`;
  const cert = g.passed ? await one<{ code: string; revoked: boolean }>(`SELECT code, revoked FROM lms_certificate WHERE user_id = $1 AND course_id = $2`, [user.id, row.id]) : null;
  const assess = [
    ...c.assignments.map((a, i) => ({ title: `Assignment ${i + 1}: ${a.title}`, href: `${base}/assignment/${i + 1}/`, status: g.assignments[i]?.status === "graded" ? `Graded ${g.assignments[i]!.score}/100` : g.assignments[i]?.status === "returned" ? "Returned for revision" : g.assignments[i] ? "Waiting to be graded" : "Not handed in", done: g.assignments[i]?.status === "graded" })),
    { title: "Course test", href: `${base}/test/`, status: g.testBest != null ? `Best ${g.testBest}% · ${g.testAttempts.filter((t) => t.status === "submitted").length} of ${theologyRules.test.attempts} attempts used` : testOpen(g) ? "Ready to take" : "Opens after every weekly quiz", done: g.parts.test },
    { title: "Final exam", href: `${base}/exam/`, status: g.exam?.status === "submitted" ? `${g.exam.score}%` : examOpen(g) ? "Ready to take" : "Opens after the course test", done: g.parts.exam },
  ];

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_20rem]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-stretch gap-4 rounded-2xl border border-line bg-white p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-lg sm:text-xl font-bold text-navy">{g.percentDone === 0 ? `Welcome to ${c.title}` : `Welcome back, ${user.name.split(" ")[0]}`}</h1>
            <p className="text-sm text-muted">{resume ? <>Next up: <strong className="text-navy">Week {resume.week} · {resume.title}</strong></> : "All units complete. Finish the assessments below."}</p>
          </div>
          {resume ? (
            <Link href={resume.href} className="btn btn-navy flex-none">{g.percentDone === 0 ? "Start course" : "Resume course"}</Link>
          ) : (
            <Link href={`${base}/progress/`} className="btn btn-navy flex-none">View progress</Link>
          )}
        </div>

        <section aria-labelledby="outline" className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="outline" className="text-lg sm:text-xl font-bold text-navy">Course outline</h2>
            <span className="text-sm text-muted">{units.filter((u) => u.done).length} of {units.length} units complete</span>
          </div>
          <ol className="flex flex-col gap-3">
            {c.modules.map((m, i) => {
              const w = i + 1;
              const wu = units.filter((u) => u.week === w);
              const done = wu.every((u) => u.done);
              return (
                <li key={w}>
                  <details className="group rounded-2xl border border-line bg-white" open={!done && wu.some((u) => u.key === resume?.key)}>
                    <summary className="flex cursor-pointer list-none items-center gap-3 px-4 sm:gap-4 py-3.5 sm:px-5 sm:py-4">
                      <span className={`grid h-7 w-7 flex-none place-items-center rounded-full text-xs font-bold sm:h-8 sm:w-8 sm:text-sm ${done ? "bg-royal text-white" : "bg-mist text-navy"}`}>{done ? "✓" : wu[0]?.lock ? "🔒" : w}</span>
                      <span className="flex min-w-0 flex-1 flex-col"><span className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-royal sm:text-xs">Week {w}</span><span className="text-[0.9375rem] font-semibold leading-snug text-navy sm:text-base">{m.title}</span></span>
                      <span className="text-sm text-muted">{wu.filter((u) => u.done).length}/{wu.length}</span>
                      <span className="text-xl text-royal group-open:rotate-180">⌄</span>
                    </summary>
                    <ul className="flex flex-col border-t border-line">
                      {wu.map((u) => (
                        <li key={u.key}>
                          <Link href={u.href} className="flex items-center gap-3 px-4 py-3 sm:px-5 text-[0.9375rem] text-ink no-underline hover:bg-mist">
                            <span aria-hidden="true" className="w-5 text-center text-steel">{icon[u.kind]}</span>
                            <span className={`flex-1 ${u.lock ? "text-muted" : ""}`}>{u.title}{u.kind === "quiz" && g.quizBest[i] != null && <span className="text-muted"> · best {g.quizBest[i]}%</span>}</span>
                            {u.done ? <span className="text-royal" aria-label="complete">✓</span> : u.lock ? <span className="text-xs" aria-label="locked">🔒</span> : <span className="text-steel" aria-hidden="true">○</span>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              );
            })}
            <li className="rounded-2xl border border-line bg-white">
              <p className="flex items-center gap-4 px-4 py-3.5 sm:px-5 sm:py-4">
                <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-gold text-sm font-bold text-navy">★</span>
                <span className="flex flex-col"><span className="text-xs font-bold uppercase tracking-[0.12em] text-royal">Assessment</span><span className="font-semibold text-navy">Assignments, course test and final exam</span></span>
              </p>
              <ul className="flex flex-col border-t border-line">
                {assess.map((a) => (
                  <li key={a.title}>
                    <Link href={a.href} className="flex items-center gap-3 px-4 py-3 sm:px-5 text-[0.9375rem] text-ink no-underline hover:bg-mist">
                      <span className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:gap-3"><span className="flex-1">{a.title}</span><span className="text-[0.8125rem] text-muted sm:text-sm">{a.status}</span></span>
                      {a.done ? <span className="text-royal" aria-label="complete">✓</span> : <span className="text-steel" aria-hidden="true">○</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ol>
        </section>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-28" aria-label="Your progress">
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:p-5">
          <h2 className="font-bold text-navy">Your grade so far</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-navy">{g.total}%</p>
          <div className="relative h-3 rounded-full bg-mist">
            <div className="h-full rounded-full bg-royal" style={{ width: `${g.total}%` }} />
            <span className="absolute -top-1 h-5 w-0.5 bg-gold" style={{ left: `${theologyRules.passMark}%` }} title={`Pass mark ${theologyRules.passMark}%`} />
          </div>
          <p className="text-xs text-muted">Gold line: pass mark {theologyRules.passMark}%</p>
          <Link href={`${base}/progress/`} className="text-sm font-semibold">Full report card →</Link>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-4 sm:p-5">
          <h2 className="font-bold text-navy">Certificate</h2>
          {cert && !cert.revoked ? (
            <>
              <p className="text-sm text-muted">You have earned your certificate.</p>
              <a href={`/certificates/${cert.code}/pdf/`} className="btn btn-gold min-h-10 text-sm">Download certificate</a>
            </>
          ) : (
            <p className="text-sm text-muted">Complete every part and reach {theologyRules.passMark}% overall to earn your free certificate.</p>
          )}
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-line bg-white p-4 sm:p-5 text-sm">
          <h2 className="pb-1 font-bold text-navy">Course tools</h2>
          <Link href={`/courses/theology/${slug}/`}>About this course</Link>
          <Link href="/dashboard/">My learning</Link>
          <Link href="/courses/theology/">All theology courses</Link>
        </div>
      </aside>
    </div>
  );
}
