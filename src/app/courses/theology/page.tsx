import type { Metadata } from "next";
import Link from "next/link";
import { theologyOrder, theologyRules } from "@/content/theology/catalog";
import { TheologyCard } from "@/components/theology/TheologyCard";
import { SectionHeading } from "@/components/ui";
import { allTheologyCourses, tracksWithCourses } from "@/lib/theology/content";

export const metadata: Metadata = {
  title: "School of Theology",
  description: "STRONGS School of Theology: self-paced theology courses in plain English, with weekly quizzes, a test, assignments, a final exam and a certificate.",
};

export const dynamic = "force-dynamic";

export default function TheologySchool() {
  const tracks = tracksWithCourses();
  const count = allTheologyCourses().length;
  const number = (slug: string) => theologyOrder.findIndex((o) => o.slug === slug) + 1;
  const w = theologyRules.weights;
  return (
    <div className="edx">
      <section aria-labelledby="th-title" className="bg-navy text-white">
        <div className="container-site grid items-center gap-8 py-[clamp(2.25rem,7vw,6rem)] lg:gap-12 lg:grid-cols-[1.25fr_1fr]">
          <div className="flex flex-col gap-4 sm:gap-6">
            <nav aria-label="Breadcrumb" className="text-sm text-pale"><Link href="/courses/" className="text-pale hover:text-white">Courses</Link> <span aria-hidden="true">›</span> Programmes <span aria-hidden="true">›</span> School of Theology</nav>
            <p className="eyebrow-dark">Programme · STRONGS School of Theology</p>
            <h1 id="th-title" className="text-[clamp(1.875rem,5.2vw,4.25rem)] font-bold leading-[1.08] tracking-[-0.02em]">
              Know what you believe. <span className="text-gold">Know why.</span>
            </h1>
            <p className="lead max-w-xl text-pale">
              {count} self-paced courses in plain English, from the Bible and its doctrines to church history, Christian living and ministry. Written for believers who are not theologians, and grounded in the King James Bible.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-2.5 sm:gap-4">
            {[
              [String(count), "courses"],
              ["4–6", "weeks each, one module a week"],
              [`${theologyRules.passMark}%`, "pass mark for the certificate"],
              ["Free", "to enrol"],
            ].map(([big, small]) => (
              <li key={small} className="flex flex-col gap-1 rounded-xl bg-navy-2 p-4 sm:gap-2 sm:rounded-2xl sm:p-6">
                <span className="text-[clamp(1.5rem,3vw,2.4rem)] font-extrabold leading-none">{big}</span>
                <span className="text-[0.8125rem] leading-snug text-pale sm:text-sm">{small}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <nav aria-label="Tracks" className="sticky top-[73px] z-20 border-b border-line bg-white/95 backdrop-blur">
        <div className="container-site flex gap-2 overflow-x-auto py-2.5 sm:py-3">
          {tracks.map((t) => (
            <a key={t.id} href={`#${t.id}`} className="whitespace-nowrap rounded-full border border-steel px-4 py-1.5 text-[0.8125rem] font-medium text-ink no-underline sm:text-sm hover:border-royal hover:text-royal">{t.name}</a>
          ))}
        </div>
      </nav>

      {tracks.map((t, i) => (
        <section key={t.id} id={t.id} aria-labelledby={`${t.id}-t`} className={`scroll-mt-32 ${i % 2 ? "bg-white" : "bg-mist"}`}>
          <div className="container-site flex flex-col gap-4 py-[clamp(2rem,5vw,3.5rem)] sm:gap-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h2 id={`${t.id}-t`} className="text-[clamp(1.25rem,2.6vw,2rem)] font-bold leading-tight text-navy">{t.name}</h2>
                <p className="text-[0.9375rem] text-muted sm:text-base">{t.blurb}</p>
              </div>
              <p className="text-sm font-semibold text-royal">{t.courses.length} courses</p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {t.courses.map((c) => <li key={c.slug}><TheologyCard c={c} n={number(c.slug)} /></li>)}
            </ul>
          </div>
        </section>
      ))}

      <section aria-labelledby="how-th" className="bg-navy text-white">
        <div className="container-site section-pad grid items-start gap-12 lg:grid-cols-2">
          <SectionHeading
            dark
            id="how-th"
            eyebrow="How it works"
            title="Study at your pace. Earn your certificate."
            intro="Each course runs over four to six weeks, one module a week. Every module has short lessons with King James Bible references, key terms, a summary and a quiz. Where Bible-believing Christians differ on a doctrine, the course sets out each view fairly, with its Scriptures."
          />
          <div className="flex flex-col gap-4">
            <ul className="grid grid-cols-2 gap-3">
              {[
                ["Final exam", w.exam, `Timed, one attempt`],
                ["Course test", w.test, `Best of ${theologyRules.test.attempts} attempts`],
                ["Assignments", w.assignments, "Graded by an instructor"],
                ["Weekly quizzes", w.quizzes, `Retake until ${theologyRules.quiz.pass}%+`],
              ].map(([t, pc, d]) => (
                <li key={t} className="flex flex-col gap-1 rounded-xl bg-navy-2 p-4 sm:rounded-2xl sm:p-5">
                  <span className="text-2xl font-extrabold text-gold sm:text-3xl">{pc}%</span>
                  <span className="font-semibold">{t}</span>
                  <span className="text-sm text-pale">{d}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-pale">Complete every part and reach {theologyRules.passMark}% overall to receive a STRONGS certificate you can download and verify.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
