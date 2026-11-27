import type { Metadata } from "next";
import Link from "next/link";
import { courseCategories } from "@/content/courses";
import { CertificatePreview } from "@/components/CertificatePreview";
import { notFound } from "next/navigation";
import { theologyOrder, theologyRules, theologyTracks, theologySubject } from "@/content/theology/catalog";
import { Ref } from "@/components/theology/Ref";
import { TheologyCard } from "@/components/theology/TheologyCard";
import { hasDatabase, one } from "@/lib/db";
import { allTheologyCourses, getTheologyCourse } from "@/lib/theology/content";
import { audienceFor, courseHours, lessonCount } from "@/lib/theology/meta";
import { courseRow } from "@/lib/theology/progress";
import { getUser } from "@/lib/session";
import { enrolTheology } from "@/app/theology/actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getTheologyCourse(slug);
  return c ? { title: `${c.title} · School of Theology`, description: c.summary } : {};
}

export default async function TheologyCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getTheologyCourse(slug);
  if (!c) notFound();
  const n = theologyOrder.findIndex((o) => o.slug === slug) + 1;
  const code = `TH ${String(n).padStart(3, "0")}`;
  const track = theologyTracks.find((t) => t.id === theologyOrder[n - 1]?.track);
  const subject = theologySubject(slug);
  const subjectName = courseCategories.find((x) => x.id === subject)?.name ?? "Theology";
  const user = hasDatabase ? await getUser() : null;
  const row = hasDatabase ? await courseRow(slug) : null;
  const enrolled = user && row ? !!(await one(`SELECT 1 FROM lms_enrolment WHERE user_id=$1 AND course_id=$2`, [user.id, row.id])) : false;
  const related = allTheologyCourses().filter((x) => x.slug !== slug && theologyOrder.find((o) => o.slug === x.slug)?.track === track?.id).slice(0, 3);
  const w = theologyRules.weights;

  const enrolButton = enrolled ? (
    <Link href={`/theology/${slug}/`} className="btn btn-gold">Go to course</Link>
  ) : user ? (
    <form action={enrolTheology}>
      <input type="hidden" name="slug" value={slug} />
      <button type="submit" className="btn btn-gold cursor-pointer border-0 font-[inherit]">Enrol now, free</button>
    </form>
  ) : hasDatabase ? (
    <Link href={`/sign-up/?next=${encodeURIComponent(`/courses/theology/${slug}/`)}`} className="btn btn-gold">Enrol now, free</Link>
  ) : null;

  const details: [string, string][] = [
    ["Length", `${c.modules.length} weeks`],
    ["Effort", "3–4 hours per week"],
    ["Price", "Free, with free certificate"],
    ["Institution", "STRONGS School of Theology"],
    ["Subject", subjectName],
    ["Programme", "School of Theology"],
    ["Level", c.level],
    ["Language", "English"],
    ["Scripture", "King James Version"],
    ["Course code", code],
  ];

  const faqs: [string, string][] = [
    ["Is this course really free?", "Yes. Learning, assessment and the certificate are all free."],
    ["Is it self-paced?", `Yes. There are no fixed dates. Each week is designed for about 3–4 hours, but you may go faster or slower. Your progress is saved and "Resume" takes you back to where you stopped.`],
    ["How am I assessed?", `Final exam ${w.exam}%, course test ${w.test}%, assignments ${w.assignments}% and weekly quizzes ${w.quizzes}%. You need ${theologyRules.passMark}% overall and every part completed to earn the certificate.`],
    ["Can I retake quizzes and tests?", `Weekly quizzes: as many times as you like until you score ${theologyRules.quiz.pass}% or more; each attempt draws new questions. Course test: ${theologyRules.test.attempts} attempts, best score counts. Final exam: one timed attempt (${c.examMinutes} minutes).`],
    ["Who marks my assignments?", "A STRONGS instructor reads and grades each assignment and gives written feedback. Submissions are checked for copied wording, and you sign a declaration that the work is your own, written without AI tools."],
    ["Can others check my certificate?", "Yes. Every certificate has a number that anyone can verify on this website."],
    ["How does the course handle doctrines Christians disagree on?", "Where Bible-believing traditions differ, each view is set out fairly with its Scriptures, so you can weigh them for yourself."],
  ];

  return (
    <div className="edx">
      {/* Hero */}
      <section aria-labelledby="c-title" className="bg-navy text-white">
        <div className="container-site grid items-center gap-6 py-[clamp(1.75rem,5vw,4.5rem)] lg:gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div className="flex flex-col gap-3.5 sm:gap-5">
            <nav aria-label="Breadcrumb" className="text-[0.8125rem] leading-snug text-pale sm:text-sm">
              <Link href="/courses/" className="text-pale hover:text-white">Courses</Link> <span aria-hidden="true">›</span>{" "}
              <Link href={`/courses/search/?subject=${subject}`} className="text-pale hover:text-white">{subjectName}</Link>
            </nav>
            <p className="eyebrow-dark">STRONGS School of Theology · {code}</p>
            <h1 id="c-title" className="text-[clamp(1.625rem,4.6vw,3.6rem)] font-bold leading-[1.08] tracking-[-0.02em]">{c.title}</h1>
            <p className="lead max-w-2xl text-pale">{c.summary}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">{enrolButton}<span className="text-sm text-pale">Start any time · learn at your own pace</span></div>
          </div>
          <ul className="grid grid-cols-2 gap-2 sm:gap-3">
            {[
              ["⏱", courseHours(c), "of learning"],
              ["⟳", "Self-paced", "start any time"],
              ["✓", "Free learning", "no fees"],
              ["★", "Certificate", "free, verifiable"],
            ].map(([icon, big, small]) => (
              <li key={big} className="flex flex-col gap-0.5 rounded-xl bg-navy-2 px-3.5 py-3 sm:gap-1 sm:rounded-2xl sm:p-5">
                <span aria-hidden="true" className="text-base text-gold sm:text-xl">{icon}</span>
                <span className="text-[0.9375rem] font-bold leading-tight sm:text-base">{big}</span>
                <span className="text-[0.8125rem] text-pale sm:text-sm">{small}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Body */}
      <section className="bg-white">
        <div className="container-site section-pad grid items-start gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
          <div className="flex flex-col gap-9 sm:gap-12">
            <div className="flex flex-col gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-navy">About this course</h2>
              <p className="lead whitespace-pre-line text-muted">{c.description}</p>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl bg-mist p-[clamp(1.25rem,3vw,2.25rem)] sm:rounded-3xl">
              <h2 className="text-xl sm:text-2xl font-bold text-navy">What you&rsquo;ll learn</h2>
              <ul className="grid gap-3 sm:grid-cols-2">{c.outcomes.map((o) => <li key={o} className="tick text-[0.9375rem] sm:text-base">{o}</li>)}</ul>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-navy">Key highlights</h2>
              <ul className="flex flex-col gap-2.5">
                {c.objectives.map((o) => <li key={o} className="tick text-[0.9375rem] sm:text-base">{o}</li>)}
                <li className="tick text-[0.9375rem] sm:text-base">{lessonCount(c)} byte-sized lessons with King James Bible references, key terms and weekly summaries</li>
                <li className="tick text-[0.9375rem] sm:text-base">A weekly quiz drawn from a bank of 20+ questions, a course test, written assignments and a final exam</li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-navy">Syllabus</h2>
              <ol className="flex flex-col border-t border-line">
                {c.modules.map((m, i) => (
                  <li key={i}>
                    <details className="group border-b border-line" open={i === 0}>
                      <summary className="flex cursor-pointer list-none items-center gap-3 py-3.5 sm:gap-4 sm:py-4">
                        <span className="flex h-8 w-12 flex-none items-center justify-center rounded-md bg-navy text-[0.6875rem] sm:h-9 sm:w-14 sm:rounded-lg sm:text-xs font-bold uppercase text-gold">Wk {i + 1}</span>
                        <span className="flex min-w-0 flex-1 flex-col"><span className="text-[0.9375rem] font-semibold leading-snug text-navy sm:text-base">{m.title}</span><span className="text-[0.8125rem] text-muted sm:text-sm">{m.lessons.length} lessons · key terms · summary · quiz</span></span>
                        <span className="text-xl text-royal group-open:hidden">+</span><span className="hidden text-xl text-royal group-open:inline">−</span>
                      </summary>
                      <div className="flex flex-col gap-2 pb-5 text-[0.9375rem] sm:pl-[4.5rem] sm:text-base">
                        <p className="text-muted">{m.intro}</p>
                        <ul className="flex list-disc flex-col gap-1 pl-5 text-[0.9375rem]">{m.lessons.map((l) => <li key={l.title}>{l.title}</li>)}</ul>
                        <p className="text-sm text-muted">Key texts: {m.texts.map((t, j) => <span key={t.ref}><Ref r={t.ref} />{j < m.texts.length - 1 && "; "}</span>)}</p>
                      </div>
                    </details>
                  </li>
                ))}
                <li className="flex items-center gap-3 border-b border-line py-3.5 sm:gap-4 sm:py-4">
                  <span className="flex h-8 w-12 flex-none items-center justify-center rounded-md bg-gold text-[0.6875rem] sm:h-9 sm:w-14 sm:rounded-lg sm:text-xs font-bold uppercase text-navy">Final</span>
                  <span className="flex flex-col"><span className="text-[0.9375rem] font-semibold text-navy sm:text-base">Assessment</span><span className="text-[0.8125rem] text-muted sm:text-sm">{c.assignments.length} assignments · course test · final exam</span></span>
                </li>
              </ol>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-navy">Who this course is for</h2>
              <ul className="grid gap-3 sm:grid-cols-2">{audienceFor(c).map((a) => <li key={a} className="rounded-xl border border-line px-4 py-3 text-sm text-ink sm:text-[0.9375rem]">{a}</li>)}</ul>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-navy">How you are assessed</h2>
              <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ["Final exam", w.exam, `Timed (${c.examMinutes} min), one attempt`],
                  ["Course test", w.test, `Best of ${theologyRules.test.attempts}`],
                  ["Assignments", w.assignments, `${c.assignments.length}, instructor-graded`],
                  ["Weekly quizzes", w.quizzes, `Pass at ${theologyRules.quiz.pass}%+`],
                ].map(([t, pc, d]) => (
                  <li key={t} className="flex flex-col gap-0.5 rounded-xl bg-mist p-3.5 sm:gap-1 sm:rounded-2xl sm:p-4">
                    <span className="text-xl font-extrabold text-royal sm:text-2xl">{pc}%</span>
                    <span className="text-[0.9375rem] font-semibold text-navy sm:text-base">{t}</span>
                    <span className="text-xs text-muted">{d}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted">Complete every part and reach {theologyRules.passMark}% overall to earn your certificate.</p>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-navy">Frequently asked questions</h2>
              <div className="flex flex-col border-t border-line">
                {faqs.map(([q, a]) => (
                  <details key={q} className="group border-b border-line">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3.5 text-[0.9375rem] font-semibold text-navy sm:py-4 sm:text-base">
                      {q}<span className="text-xl text-royal group-open:hidden">+</span><span className="hidden text-xl text-royal group-open:inline">−</span>
                    </summary>
                    <p className="pb-4 text-[0.9375rem] text-muted sm:text-base">{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: course details, enrol, sample certificate */}
          <aside className="flex flex-col gap-5 lg:sticky lg:top-28" aria-label="Course details">
            <div className="flex flex-col gap-4 rounded-2xl border border-line p-5 sm:rounded-3xl sm:p-6">
              <h2 className="text-lg font-bold text-navy">Course details</h2>
              <dl className="flex flex-col divide-y divide-line text-sm sm:text-[0.9375rem]">
                {details.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="text-muted">{k}</dt><dd className="text-right font-semibold text-navy">{v}</dd></div>
                ))}
              </dl>
              {enrolButton && <div className="[&_.btn]:w-full [&_form]:w-full">{enrolButton}</div>}
            </div>
            <div className="flex flex-col gap-3 rounded-2xl bg-mist p-5 sm:rounded-3xl sm:p-6">
              <h2 className="text-lg font-bold text-navy">Sample certificate</h2>
              <CertificatePreview name="Your Name" course={c.title} school="theology" />
              <p className="text-xs text-muted">Download it as a PDF, and share a link anyone can use to verify it.</p>
            </div>
            {c.reading && c.reading.length > 0 && (
              <div className="flex flex-col gap-2 rounded-2xl border border-line p-5 sm:rounded-3xl sm:p-6">
                <h2 className="text-lg font-bold text-navy">For further reading</h2>
                <ul className="flex list-disc flex-col gap-1 pl-5 text-[0.9375rem] text-muted">{c.reading.map((r) => <li key={r}>{r}</li>)}</ul>
              </div>
            )}
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-mist">
          <div className="container-site section-pad flex flex-col gap-6">
            <h2 className="text-[clamp(1.375rem,3.6vw,2.875rem)] font-bold leading-tight tracking-[-0.02em] text-navy">More in {track?.name}</h2>
            <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">{related.map((x) => <li key={x.slug}><TheologyCard c={x} n={theologyOrder.findIndex((o) => o.slug === x.slug) + 1} /></li>)}</ul>
            <Link href="/courses/theology/" className="self-start font-semibold">All School of Theology courses →</Link>
          </div>
        </section>
      )}
    </div>
  );
}
