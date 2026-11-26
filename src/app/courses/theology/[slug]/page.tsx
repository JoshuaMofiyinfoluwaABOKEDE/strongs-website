import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { theologyOrder, theologyRules, theologyTracks } from "@/content/theology/catalog";
import { LearnBar } from "@/components/learn/LearnBar";
import { Ref } from "@/components/theology/Ref";
import { TheologyCard } from "@/components/theology/TheologyCard";
import { SectionHeading } from "@/components/ui";
import { Book, Calendar, Clock, People, Signal } from "@/components/icons";
import { hasDatabase, one } from "@/lib/db";
import { allTheologyCourses, getTheologyCourse } from "@/lib/theology/content";
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
  const track = theologyTracks.find((t) => t.id === theologyOrder[n - 1]?.track);
  const user = hasDatabase ? await getUser() : null;
  const row = hasDatabase ? await courseRow(slug) : null;
  const enrolled = user && row ? !!(await one(`SELECT 1 FROM lms_enrolment WHERE user_id=$1 AND course_id=$2`, [user.id, row.id])) : false;
  const lessons = c.modules.reduce((s, m) => s + m.lessons.length, 0);
  const related = allTheologyCourses().filter((x) => x.slug !== slug && theologyOrder.find((o) => o.slug === x.slug)?.track === track?.id).slice(0, 6);
  const w = theologyRules.weights;

  const facts = [
    { Icon: Clock, label: "Duration", value: `${c.modules.length} weeks` },
    { Icon: Calendar, label: "Effort", value: "3–4 hours a week" },
    { Icon: Signal, label: "Level", value: c.level },
    { Icon: Book, label: "Lessons", value: `${lessons} short lessons` },
    { Icon: People, label: "Cost", value: "Free" },
  ];

  return (
    <>
      <LearnBar />
      <section aria-labelledby="c-title" className="bg-navy text-white">
        <div className="container-site flex flex-col gap-5 py-[clamp(2.5rem,5vw,4.5rem)]">
          <nav aria-label="Breadcrumb" className="text-sm text-pale">
            <Link href="/courses/" className="text-pale hover:text-white">Courses</Link> <span aria-hidden="true">›</span>{" "}
            <Link href="/courses/theology/" className="text-pale hover:text-white">School of Theology</Link> <span aria-hidden="true">›</span>{" "}
            <Link href={`/courses/theology/#${track?.id}`} className="text-pale hover:text-white">{track?.name}</Link>
          </nav>
          <p className="eyebrow-dark">TH {String(n).padStart(3, "0")}</p>
          <h1 id="c-title" className="max-w-4xl text-[clamp(2.2rem,4.6vw,3.6rem)] font-bold leading-[1.08] tracking-[-0.02em]">{c.title}</h1>
          <p className="lead max-w-3xl text-pale">{c.summary}</p>
          <div className="flex flex-wrap items-center gap-3.5">
            {enrolled ? (
              <Link href={`/theology/${slug}/`} className="btn btn-gold">Go to the course</Link>
            ) : user ? (
              <form action={enrolTheology}>
                <input type="hidden" name="slug" value={slug} />
                <button type="submit" className="btn btn-gold cursor-pointer border-0 font-[inherit]">Enrol free and start</button>
              </form>
            ) : hasDatabase ? (
              <Link href={`/sign-up/?next=${encodeURIComponent(`/courses/theology/${slug}/`)}`} className="btn btn-gold">Enrol free</Link>
            ) : null}
            <span className="text-sm text-pale">Self-paced and online. Start today.</span>
          </div>
        </div>
      </section>

      <section aria-label="At a glance" className="border-b border-line bg-white">
        <ul className="container-site grid grid-cols-2 gap-x-6 gap-y-5 py-7 md:grid-cols-5">
          {facts.map(({ Icon, label, value }) => (
            <li key={label} className="flex items-start gap-3">
              <span className="mt-0.5 text-royal"><Icon size={22} /></span>
              <span className="flex flex-col"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</span><span className="font-semibold leading-snug text-navy">{value}</span></span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white">
        <div className="container-site section-pad grid items-start gap-14 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-4">
              <SectionHeading title="About this course" />
              <p className="lead whitespace-pre-line text-muted">{c.description}</p>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-navy">Course objectives</h2>
              <ol className="flex list-decimal flex-col gap-2.5 pl-6 marker:font-bold marker:text-royal">{c.objectives.map((o) => <li key={o} className="pl-1">{o}</li>)}</ol>
            </div>
            <div className="flex flex-col gap-4 rounded-3xl bg-mist p-[clamp(1.5rem,3vw,2.25rem)]">
              <h2 className="text-2xl font-bold text-navy">Learning outcomes</h2>
              <p className="text-muted">By the end of the course you will be able to:</p>
              <ul className="grid gap-3 sm:grid-cols-2">{c.outcomes.map((o) => <li key={o} className="tick">{o}</li>)}</ul>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-navy">Week by week</h2>
              <ol className="flex flex-col border-t border-line">
                {c.modules.map((m, i) => (
                  <li key={i}>
                    <details className="group border-b border-line" open={i === 0}>
                      <summary className="flex cursor-pointer list-none items-center gap-4 py-4">
                        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-navy text-sm font-bold text-gold">{i + 1}</span>
                        <span className="flex flex-1 flex-col"><span className="font-semibold text-navy">{m.title}</span><span className="text-sm text-muted">{m.lessons.length} lessons · key terms · summary · quiz</span></span>
                        <span className="text-xl text-royal group-open:hidden">+</span><span className="hidden text-xl text-royal group-open:inline">−</span>
                      </summary>
                      <div className="flex flex-col gap-2 pb-5 pl-[3.25rem]">
                        <p className="text-muted">{m.intro}</p>
                        <ul className="flex list-disc flex-col gap-1 pl-5 text-[0.9375rem]">{m.lessons.map((l) => <li key={l.title}>{l.title}</li>)}</ul>
                        <p className="text-sm text-muted">Key texts: {m.texts.map((t, j) => <span key={t.ref}><Ref r={t.ref} />{j < m.texts.length - 1 && "; "}</span>)}</p>
                      </div>
                    </details>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <aside className="flex flex-col gap-5 lg:sticky lg:top-28" aria-label="Assessment">
            <div className="flex flex-col gap-3 rounded-3xl border border-line p-6">
              <h2 className="text-lg font-bold text-navy">How you are assessed</h2>
              <ul className="flex flex-col gap-2 text-[0.9375rem]">
                <li><strong className="text-navy">Final exam {w.exam}%</strong> <span className="text-muted">· timed ({c.examMinutes} min), one attempt</span></li>
                <li><strong className="text-navy">Course test {w.test}%</strong> <span className="text-muted">· objective, short-answer and list questions; best of {theologyRules.test.attempts}</span></li>
                <li><strong className="text-navy">Assignments {w.assignments}%</strong> <span className="text-muted">· {c.assignments.length} written assignments, graded with feedback</span></li>
                <li><strong className="text-navy">Weekly quizzes {w.quizzes}%</strong> <span className="text-muted">· retake until you score {theologyRules.quiz.pass}%+</span></li>
              </ul>
              <p className="text-sm text-muted">Certificate: complete every part and reach {theologyRules.passMark}% overall.</p>
              <h2 className="pt-2 text-lg font-bold text-navy">Assignments</h2>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-[0.9375rem] text-muted">{c.assignments.map((a) => <li key={a.title}>{a.title}</li>)}</ul>
              {c.reading && c.reading.length > 0 && (
                <>
                  <h2 className="pt-2 text-lg font-bold text-navy">For further reading</h2>
                  <ul className="flex list-disc flex-col gap-1 pl-5 text-[0.9375rem] text-muted">{c.reading.map((r) => <li key={r}>{r}</li>)}</ul>
                </>
              )}
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-mist">
          <div className="container-site section-pad flex flex-col gap-6">
            <SectionHeading title={`More in ${track?.name}`} />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{related.map((x) => <li key={x.slug}><TheologyCard c={x} n={theologyOrder.findIndex((o) => o.slug === x.slug) + 1} /></li>)}</ul>
            <Link href="/courses/theology/" className="self-start font-semibold">All School of Theology courses →</Link>
          </div>
        </section>
      )}
    </>
  );
}
