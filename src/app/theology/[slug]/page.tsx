import Link from "next/link";
import { theologyRules } from "@/content/theology/catalog";
import { one } from "@/lib/db";
import { lessonKey } from "@/lib/theology/content";
import { loadTheology } from "@/lib/theology/learner";

export const dynamic = "force-dynamic";

/** The first unfinished step, in course order. */
function nextStep(c: Awaited<ReturnType<typeof loadTheology>>["c"], g: Awaited<ReturnType<typeof loadTheology>>["g"]) {
  const base = `/theology/${c.slug}`;
  for (const [i, m] of c.modules.entries()) {
    const w = i + 1;
    for (const [j, l] of m.lessons.entries()) if (!g.lessonsDone.has(lessonKey(w, j + 1))) return { href: `${base}/week/${w}/lesson/${j + 1}/`, label: `Week ${w}: ${l.title}` };
    if ((g.quizBest[i] ?? 0) < theologyRules.quiz.pass) return { href: `${base}/week/${w}/quiz/`, label: `Week ${w} quiz` };
  }
  for (const [i, a] of c.assignments.entries()) if (!g.assignments[i] || g.assignments[i]?.status === "returned") return { href: `${base}/assignment/${i + 1}/`, label: `Assignment ${i + 1}: ${a.title}` };
  if (!g.parts.test) return { href: `${base}/test/`, label: "Course test" };
  if (!g.parts.exam) return { href: `${base}/exam/`, label: "Final exam" };
  return null;
}

export default async function TheologyHome({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { user, c, row, g } = await loadTheology(slug);
  const w = theologyRules.weights;
  const step = nextStep(c, g);
  const resume = g.lastKey?.match(/^w(\d+)l(\d+)$/);
  const cert = g.passed ? await one<{ code: string; revoked: boolean }>(`SELECT code, revoked FROM lms_certificate WHERE user_id = $1 AND course_id = $2`, [user.id, row.id]) : null;
  const waiting = g.assignments.filter((a) => a?.status === "submitted").length;

  const rows: { label: string; weight: number; score: number; status: string }[] = [
    { label: "Final exam", weight: w.exam, score: g.components.exam, status: g.parts.exam ? "Taken" : "Not taken" },
    { label: "Course test (best of 3)", weight: w.test, score: g.components.test, status: g.testAttempts.length ? `${g.testAttempts.filter((t) => t.status === "submitted").length} of 3 used` : "Not taken" },
    { label: "Assignments", weight: w.assignments, score: g.components.assignments, status: `${g.assignments.filter((a) => a?.status === "graded").length} of ${c.assignments.length} graded${waiting ? ` · ${waiting} waiting` : ""}` },
    { label: "Weekly quizzes", weight: w.quizzes, score: g.components.quizzes, status: `${g.quizzesPassed} of ${c.modules.length} passed (80%+)` },
  ];

  return (
    <div className="flex flex-col gap-8">
      {g.passed ? (
        <div className="flex flex-col gap-4 rounded-3xl bg-navy p-[clamp(1.5rem,4vw,2.5rem)] text-white">
          <p className="eyebrow-dark">Course passed · {g.total}%</p>
          <h1 className="text-[clamp(1.8rem,3.4vw,2.6rem)] font-bold leading-tight">Well done, {user.name.split(" ")[0]}.</h1>
          {cert && !cert.revoked && (
            <div className="flex flex-wrap gap-3">
              <a href={`/certificates/${cert.code}/pdf/`} className="btn btn-gold">Download your certificate</a>
              <Link href={`/certificates/${cert.code}/`} className="btn btn-line-light">View and share</Link>
            </div>
          )}
        </div>
      ) : g.complete ? (
        <div className="flex flex-col gap-3 rounded-3xl border border-gold bg-[#fbf5e6] p-[clamp(1.5rem,4vw,2.5rem)]">
          <p className="eyebrow">Course finished · {g.total}%</p>
          <h1 className="text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-tight text-navy">Not yet at the {theologyRules.passMark}% pass mark</h1>
          <p className="text-muted">You can still raise your total by retaking weekly quizzes and using any test attempts you have left. Talk to your instructor if you need help.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-3xl bg-navy p-[clamp(1.5rem,4vw,2.5rem)] text-white">
          <p className="eyebrow-dark">{g.percentDone === 0 ? "Ready when you are" : "Welcome back"}</p>
          <h1 className="text-[clamp(1.8rem,3.4vw,2.6rem)] font-bold leading-tight">{g.percentDone === 0 ? "Begin Week 1" : "Pick up where you stopped"}</h1>
          {step ? (
            <>
              <p className="lead text-pale">Next: <strong className="text-white">{step.label}</strong></p>
              <div className="flex flex-wrap gap-3">
                <Link href={step.href} className="btn btn-gold">{g.percentDone === 0 ? "Start" : "Continue"}</Link>
                {resume && <Link href={`/theology/${slug}/week/${resume[1]}/lesson/${resume[2]}/`} className="btn btn-line-light">Back to your last lesson</Link>}
              </div>
            </>
          ) : (
            <p className="lead text-pale">Everything is handed in. Your certificate is issued as soon as your assignments are graded and your total is {theologyRules.passMark}% or more.</p>
          )}
        </div>
      )}

      <section aria-labelledby="grades" className="flex flex-col gap-4">
        <h2 id="grades" className="text-2xl font-bold text-navy">Your grades</h2>
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[34rem] text-left text-[0.9375rem]">
            <thead className="bg-mist text-xs uppercase tracking-wide text-muted">
              <tr><th className="px-4 py-3">Part</th><th className="px-3">Weight</th><th className="px-3">Score</th><th className="px-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.label}><td className="px-4 py-3 font-semibold text-navy">{r.label}</td><td className="px-3">{r.weight}%</td><td className="px-3">{r.score}%</td><td className="px-3 text-muted">{r.status}</td></tr>
              ))}
              <tr className="bg-mist/60"><td className="px-4 py-3 font-bold text-navy">Weighted total</td><td className="px-3">100%</td><td className="px-3 font-bold text-navy">{g.total}%</td><td className="px-3 text-muted">Pass mark {theologyRules.passMark}%</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted">
          To receive the certificate: read every lesson, pass every weekly quiz with {theologyRules.quiz.pass}% or more (unlimited retakes), take the course test (best of {theologyRules.test.attempts} attempts counts), have every assignment graded, sit the timed final exam (one attempt), and reach a weighted total of {theologyRules.passMark}%.
        </p>
      </section>

      <section aria-labelledby="weeks" className="flex flex-col gap-4">
        <h2 id="weeks" className="text-2xl font-bold text-navy">Weeks</h2>
        <ol className="grid gap-3 sm:grid-cols-2">
          {c.modules.map((m, i) => {
            const done = m.lessons.filter((_, j) => g.lessonsDone.has(lessonKey(i + 1, j + 1))).length;
            const best = g.quizBest[i];
            return (
              <li key={i}>
                <Link href={`/theology/${slug}/week/${i + 1}/`} className="flex h-full flex-col gap-1 rounded-2xl border border-line bg-white p-5 no-underline hover:border-royal">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-royal">Week {i + 1}</span>
                  <span className="font-semibold text-navy">{m.title}</span>
                  <span className="text-sm text-muted">{done}/{m.lessons.length} lessons · quiz {best == null ? "not taken" : `${best}%${best >= theologyRules.quiz.pass ? " ✓" : ""}`}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
