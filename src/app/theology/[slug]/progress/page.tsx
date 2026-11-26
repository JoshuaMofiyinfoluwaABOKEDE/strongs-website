import Link from "next/link";
import { theologyRules } from "@/content/theology/catalog";
import { one } from "@/lib/db";
import { loadTheology } from "@/lib/theology/learner";

export const dynamic = "force-dynamic";

/** The Progress tab: a report card in the style of edX's progress page and UniAthena's report card. */
export default async function ProgressPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { user, c, row, g } = await loadTheology(slug);
  const w = theologyRules.weights;
  const base = `/theology/${slug}`;
  const cert = g.passed ? await one<{ code: string; revoked: boolean }>(`SELECT code, revoked FROM lms_certificate WHERE user_id = $1 AND course_id = $2`, [user.id, row.id]) : null;
  const missing = [
    !g.parts.lessons && `read every lesson (${g.lessonsDone.size} of ${g.lessonsTotal})`,
    !g.parts.quizzes && `pass every weekly quiz (${g.quizzesPassed} of ${c.modules.length})`,
    !g.parts.assignments && "have every assignment graded",
    !g.parts.test && "take the course test",
    !g.parts.exam && "sit the final exam",
  ].filter(Boolean) as string[];
  const rows = [
    { label: "Final exam", weight: w.exam, score: g.components.exam },
    { label: "Course test", weight: w.test, score: g.components.test },
    { label: "Assignments", weight: w.assignments, score: g.components.assignments },
    { label: "Weekly quizzes", weight: w.quizzes, score: g.components.quizzes },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-navy">Report card</h1>
        <div className={`rounded-xl p-4 ${g.passed ? "bg-navy text-white" : "bg-mist text-navy"}`}>
          {g.passed ? (
            <div className="flex flex-wrap items-center gap-4">
              <p className="flex-1 font-semibold">Congratulations: you passed with {g.total}%. Your certificate is ready.</p>
              {cert && !cert.revoked && <a href={`/certificates/${cert.code}/pdf/`} className="btn btn-gold min-h-10 text-sm">Download certificate</a>}
            </div>
          ) : missing.length ? (
            <p><strong>Not yet eligible for a certificate.</strong> To finish, {missing.join(", ")}, and reach {theologyRules.passMark}% overall.</p>
          ) : (
            <p><strong>All parts complete, total {g.total}%.</strong> You need {theologyRules.passMark}% to pass. Retake quizzes, or use any test attempts left, to raise your total.</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between"><span className="font-semibold text-navy">Overall grade</span><span className="text-2xl font-extrabold text-navy">{g.total}%</span></div>
          <div className="relative h-4 rounded-full bg-mist">
            <div className="h-full rounded-full bg-royal" style={{ width: `${g.total}%` }} />
            <span className="absolute -top-1.5 h-7 w-0.5 bg-gold" style={{ left: `${theologyRules.passMark}%` }} />
            <span className="absolute top-6 -translate-x-1/2 text-xs font-semibold text-[#7a5a12]" style={{ left: `${theologyRules.passMark}%` }}>Pass {theologyRules.passMark}%</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-navy">Grading breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm sm:text-[0.9375rem]">
            <thead className="text-xs uppercase tracking-wide text-muted"><tr><th className="py-2 pr-2">Assessment</th><th className="pr-2">Weight</th><th className="pr-2">Score</th><th>Weighted</th></tr></thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.label}><td className="py-3 font-semibold text-navy">{r.label}</td><td>{r.weight}%</td><td>{r.score}%</td><td>{Math.round((r.score * r.weight) / 10) / 10}%</td></tr>
              ))}
              <tr><td className="py-3 font-bold text-navy">Total</td><td>100%</td><td /><td className="font-bold text-navy">{g.total}%</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-navy">Weekly quizzes</h2>
          <ul className="flex flex-col divide-y divide-line text-[0.9375rem]">
            {c.modules.map((m, i) => {
              const b = g.quizBest[i];
              return (
                <li key={i} className="flex items-center gap-3 py-2.5">
                  <Link href={`${base}/week/${i + 1}/quiz/`} className="flex-1">Week {i + 1}: {m.title}</Link>
                  <span className={b == null ? "text-muted" : b >= theologyRules.quiz.pass ? "font-semibold text-royal" : "font-semibold text-[#8a1c1c]"}>{b == null ? "–" : `${b}%`}</span>
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-muted">Best score per week counts. Pass at {theologyRules.quiz.pass}%.</p>
        </section>
        <section className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-navy">Assignments, test and exam</h2>
          <ul className="flex flex-col divide-y divide-line text-[0.9375rem]">
            {c.assignments.map((a, i) => {
              const s = g.assignments[i];
              return (
                <li key={i} className="flex items-center gap-3 py-2.5">
                  <Link href={`${base}/assignment/${i + 1}/`} className="flex-1">Assignment {i + 1}: {a.title}</Link>
                  <span className="text-muted">{s?.status === "graded" ? <strong className="text-royal">{s.score}/100</strong> : s?.status === "returned" ? "Returned" : s ? "Waiting" : "–"}</span>
                </li>
              );
            })}
            {g.testAttempts.map((t, i) => (
              <li key={t.id} className="flex items-center gap-3 py-2.5"><Link href={`${base}/test/?a=${t.id}`} className="flex-1">Course test, attempt {i + 1}</Link><span className="text-muted">{t.status === "open" ? "In progress" : `${t.score}%`}</span></li>
            ))}
            {g.testAttempts.length === 0 && <li className="flex items-center gap-3 py-2.5"><Link href={`${base}/test/`} className="flex-1">Course test</Link><span className="text-muted">–</span></li>}
            <li className="flex items-center gap-3 py-2.5"><Link href={`${base}/exam/`} className="flex-1">Final exam</Link><span className="text-muted">{g.exam?.status === "submitted" ? <strong className="text-royal">{g.exam.score}%</strong> : g.exam ? "In progress" : "–"}</span></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
