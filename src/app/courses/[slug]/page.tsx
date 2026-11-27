import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryName as staticCategoryName, courseFacts } from "@/content/courses";
import { site } from "@/content/site";
import { CourseCard, CourseCover } from "@/components/CourseCard";
import { Carousel } from "@/components/Carousel";
import { SectionHeading } from "@/components/ui";
import { Book, Calendar, Chat, Clock, Monitor, People, Signal } from "@/components/icons";
import { hasDatabase } from "@/lib/db";
import { getCatalogue, getCategories, getOutline, getProgress, type CatalogueCourse, type Outline, type Progress } from "@/lib/lms";
import { getUser } from "@/lib/session";
import { enrol } from "@/app/learn/actions";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  const catalogue = await getCatalogue();
  const c = catalogue.find((x) => x.slug === slug);
  return { c, catalogue };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { c } = await load(slug);
  return c ? { title: `${c.title} · Course`, description: c.summary } : {};
}

const hours = (m: number) => (m >= 60 ? `${Math.round((m / 60) * 10) / 10} hours` : `${m} minutes`);

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { c, catalogue } = await load(slug);
  if (!c) notFound();

  const categories = await getCategories();
  const categoryName = (id: string) => categories.find((x) => x.id === id)?.name ?? staticCategoryName(id as never);
  const outline = hasDatabase ? await getOutline(slug) : null;
  const user = hasDatabase ? await getUser() : null;
  const progress = user && outline ? await getProgress(user.id, outline) : null;

  const related = catalogue.filter((x) => x.category === c.category && x.slug !== c.slug);
  const others = catalogue.filter((x) => x.category !== c.category && x.featured);
  const enrolText = `Hello STRONGS, I would like to take the course "${c.title}".`;
  const whatsapp = `https://wa.me/${site.phoneHref.replace(/\D/g, "")}?text=${encodeURIComponent(enrolText)}`;
  const assessments = outline ? outline.modules.reduce((n, m) => n + m.assessments.length, 0) + outline.finals.length : 0;
  const facts = [
    { Icon: Clock, label: "Duration", value: `${c.weeks} weeks` },
    { Icon: Calendar, label: "Effort", value: c.effort },
    { Icon: Signal, label: "Level", value: c.level },
    { Icon: Monitor, label: "Format", value: c.format },
    { Icon: Book, label: "Lessons", value: c.lessonCount ? `${c.lessonCount} · about ${hours(c.minutes)}` : "In preparation" },
    { Icon: People, label: "Cost", value: courseFacts.cost },
  ];

  return (
    <>
      <section aria-labelledby="c-title" className="bg-navy text-white">
        <div className="container-site grid items-center gap-10 py-[clamp(2.5rem,5vw,4.5rem)] lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-5">
            <nav aria-label="Breadcrumb" className="text-sm text-pale">
              <Link href="/courses/" className="text-pale hover:text-white">Courses</Link>
              <span aria-hidden="true"> › </span>
              <Link href={`/courses/search/?subject=${c.category}`} className="text-pale hover:text-white">{categoryName(c.category)}</Link>
            </nav>
            <h1 id="c-title" className="text-[clamp(2.2rem,4.6vw,3.6rem)] font-bold leading-[1.08] tracking-[-0.02em]">{c.title}</h1>
            <p className="lead max-w-2xl text-pale">{c.summary}</p>
            <CallToAction c={c} outline={outline} progress={progress} signedIn={!!user} isAdmin={user?.role === "admin"} whatsapp={whatsapp} />
          </div>
          <CourseCover category={c.category} big className="hidden h-72 rounded-3xl lg:block" />
        </div>
      </section>

      <section aria-label="At a glance" className="border-b border-line bg-white">
        <ul className="container-site grid grid-cols-2 gap-x-6 gap-y-5 py-7 md:grid-cols-3 lg:grid-cols-6">
          {facts.map(({ Icon, label, value }) => (
            <li key={label} className="flex items-start gap-3">
              <span className="mt-0.5 text-royal"><Icon size={22} /></span>
              <span className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</span>
                <span className="font-semibold leading-snug text-navy">{value}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="about-t" className="bg-white">
        <div className="container-site section-pad grid items-start gap-14 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-4">
              <SectionHeading id="about-t" title="About this course" />
              <p className="lead text-muted">{c.about}</p>
            </div>

            {c.objectives.length > 0 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-navy">Course objectives</h2>
                <ol className="flex list-decimal flex-col gap-2.5 pl-6 marker:font-bold marker:text-royal">
                  {c.objectives.map((o) => <li key={o} className="pl-1 text-ink">{o}</li>)}
                </ol>
              </div>
            )}

            {c.outcomes.length > 0 && (
              <div className="flex flex-col gap-4 rounded-3xl bg-mist p-[clamp(1.5rem,3vw,2.25rem)]">
                <h2 className="text-2xl font-bold text-navy">Learning outcomes</h2>
                <p className="text-muted">By the end of the course you will be able to:</p>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {c.outcomes.map((o) => <li key={o} className="tick">{o}</li>)}
                </ul>
              </div>
            )}

            <Syllabus c={c} outline={outline} progress={progress} />
          </div>

          <aside className="flex flex-col gap-5 lg:sticky lg:top-28" aria-label="Course details">
            <div className="flex flex-col gap-3 rounded-3xl border border-line p-6">
              <h2 className="text-lg font-bold text-navy">Who this course is for</h2>
              <p className="text-[0.9375rem] text-muted">{c.audience}</p>
              <h2 className="pt-2 text-lg font-bold text-navy">Before you start</h2>
              <p className="text-[0.9375rem] text-muted">{c.prerequisites}</p>
              <h2 className="pt-2 text-lg font-bold text-navy">How it works</h2>
              <p className="text-[0.9375rem] text-muted">
                Self-paced and online. Study whenever it suits you, on your phone or computer, and pick up where you stopped.
                {assessments > 0 && ` The course has ${assessments} ${assessments === 1 ? "assessment" : "assessments"}.`}
              </p>
              <h2 className="pt-2 text-lg font-bold text-navy">Certificate</h2>
              <p className="text-[0.9375rem] text-muted">
                Finish every lesson, pass every assessment and have your practical assignments approved, and you receive a STRONGS certificate of completion to download.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-3xl bg-navy p-6 text-white">
              <p className="flex items-center gap-2.5 font-semibold"><span className="text-gold"><Chat size={22} /></span>Questions about this course?</p>
              <p className="text-sm text-pale">Call or WhatsApp {site.phone}, or email {site.email}.</p>
              <a href={whatsapp} target="_blank" rel="noopener" className="btn btn-gold">Ask on WhatsApp</a>
            </div>
          </aside>
        </div>
      </section>

      {(related.length > 0 || others.length > 0) && (
        <section aria-labelledby="more-t" className="bg-mist">
          <div className="container-site section-pad flex flex-col gap-6">
            <SectionHeading id="more-t" title={related.length ? `More in ${categoryName(c.category)}` : "You might also like"} />
            <Carousel label="More courses">
              {[...related, ...others].slice(0, 8).map((x) => (
                <li key={x.slug} className="w-[17rem]"><CourseCard course={x} /></li>
              ))}
            </Carousel>
            <Link href="/courses/" className="self-start font-semibold">All {catalogue.length} courses →</Link>
          </div>
        </section>
      )}
    </>
  );
}

function CallToAction({
  c,
  outline,
  progress,
  signedIn,
  isAdmin,
  whatsapp,
}: {
  c: CatalogueCourse;
  outline: Outline | null;
  progress: Progress | null;
  signedIn: boolean;
  isAdmin: boolean;
  whatsapp: string;
}) {
  if (progress?.enrolled) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex max-w-md items-center gap-3">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-navy-2"><div className="h-full rounded-full bg-gold" style={{ width: `${progress.percent}%` }} /></div>
          <span className="text-sm font-semibold text-gold">{progress.percent}% complete</span>
        </div>
        <Link href={`/learn/${c.slug}/`} className="btn btn-gold self-start">{progress.finished ? "Review the course" : progress.complete ? "Continue learning" : "Start learning"}</Link>
      </div>
    );
  }
  if (outline && (c.enrolmentOpen || isAdmin)) {
    return (
      <div className="flex flex-col gap-3">
        {signedIn ? (
          <form action={enrol}>
            <input type="hidden" name="slug" value={c.slug} />
            <button type="submit" className="btn btn-gold cursor-pointer border-0 font-[inherit]">Enrol free and start</button>
          </form>
        ) : (
          <Link href={`/sign-up/?next=${encodeURIComponent(`/courses/${c.slug}/`)}`} className="btn btn-gold self-start">Enrol free</Link>
        )}
        <p className="text-sm text-pale">
          {isAdmin && !c.enrolmentOpen ? "Admin preview: this course is not open to learners yet." : "Self-paced and online. Start today and study at your own pace."}
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <a href={whatsapp} target="_blank" rel="noopener" className="btn btn-gold self-start">Register your interest</a>
      <p className="text-sm text-pale">The lessons for this course are being prepared. Register your interest and we will tell you when it opens.</p>
    </div>
  );
}

function Syllabus({ c, outline, progress }: { c: CatalogueCourse; outline: Outline | null; progress: Progress | null }) {
  if (!outline) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-navy">Modules</h2>
        <ol className="flex flex-col border-t border-line">
          {c.modules.map((m, i) => (
            <li key={m.title} className="flex gap-4 border-b border-line py-4">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-navy text-sm font-bold text-gold">{i + 1}</span>
              <span className="flex flex-col"><span className="font-semibold text-navy">{m.title}</span><span className="text-muted">{m.text}</span></span>
            </li>
          ))}
        </ol>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-navy">Modules and lessons</h2>
      <ol className="flex flex-col border-t border-line">
        {outline.modules.map((m, i) => (
          <li key={m.id}>
            <details className="group border-b border-line" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center gap-4 py-4">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-navy text-sm font-bold text-gold">{i + 1}</span>
                <span className="flex flex-1 flex-col">
                  <span className="font-semibold text-navy">{m.title}</span>
                  <span className="text-sm text-muted">
                    {m.lessons.length ? `${m.lessons.length} ${m.lessons.length === 1 ? "lesson" : "lessons"}` : "Lessons in preparation"}
                    {m.assessments.length > 0 && ` · ${m.assessments.length} ${m.assessments.length === 1 ? "quiz" : "quizzes"}`}
                  </span>
                </span>
                <span className="text-xl text-royal group-open:hidden">+</span>
                <span className="hidden text-xl text-royal group-open:inline">−</span>
              </summary>
              <div className="flex flex-col gap-3 pb-5 pl-[3.25rem]">
                {m.summary && <p className="text-muted">{m.summary}</p>}
                {(m.lessons.length > 0 || m.assessments.length > 0) && (
                  <ul className="flex flex-col gap-2">
                    {m.lessons.map((l) => (
                      <li key={l.id} className="flex items-baseline gap-3 text-[0.9375rem]">
                        <span className={`text-sm ${progress?.doneLessons.has(l.id) ? "text-royal" : "text-steel"}`} aria-hidden="true">{progress?.doneLessons.has(l.id) ? "✓" : "○"}</span>
                        <span className="flex-1 text-ink">{l.title}</span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted">{l.kind === "assignment" ? "Assignment" : `${l.minutes} min`}</span>
                      </li>
                    ))}
                    {m.assessments.map((a) => (
                      <li key={`a${a.id}`} className="flex items-baseline gap-3 text-[0.9375rem]">
                        <span className={`text-sm ${progress?.best.get(a.id)?.passed ? "text-royal" : "text-steel"}`} aria-hidden="true">{progress?.best.get(a.id)?.passed ? "✓" : "○"}</span>
                        <span className="flex-1 text-ink">{a.title}</span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Quiz</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </details>
          </li>
        ))}
        {outline.finals.map((a) => (
          <li key={`f${a.id}`} className="flex items-center gap-4 border-b border-line py-4">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-gold text-sm font-bold text-navy">✦</span>
            <span className="flex flex-1 flex-col"><span className="font-semibold text-navy">{a.title}</span><span className="text-sm text-muted">Final assessment · pass mark {a.pass_mark}%</span></span>
          </li>
        ))}
      </ol>
    </div>
  );
}
