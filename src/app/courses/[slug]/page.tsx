import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryName, courseFacts, courses, coursesIn, getCourse } from "@/content/courses";
import { site } from "@/content/site";
import { CourseCard, CourseCover } from "@/components/CourseCard";
import { Carousel } from "@/components/Carousel";
import { SectionHeading } from "@/components/ui";
import { Calendar, Chat, Clock, Globe, Monitor, People, Signal } from "@/components/icons";

export function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getCourse(slug);
  return c ? { title: `${c.title} · Course`, description: c.summary } : {};
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCourse(slug);
  if (!c) notFound();

  const related = coursesIn(c.category).filter((x) => x.slug !== c.slug);
  const others = courses.filter((x) => x.category !== c.category && x.featured);
  const enrolText = `Hello STRONGS, I would like to enrol in the course "${c.title}".`;
  const whatsapp = `https://wa.me/${site.phoneHref.replace(/\D/g, "")}?text=${encodeURIComponent(enrolText)}`;
  const facts = [
    { Icon: Clock, label: "Length", value: `${c.weeks} weeks` },
    { Icon: Calendar, label: "Effort", value: c.effort },
    { Icon: Signal, label: "Level", value: c.level },
    { Icon: Monitor, label: "Format", value: c.format },
    { Icon: Globe, label: "Language", value: courseFacts.language },
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
              <Link href={`/courses/#${c.category}`} className="text-pale hover:text-white">{categoryName(c.category)}</Link>
            </nav>
            <h1 id="c-title" className="text-[clamp(2.2rem,4.6vw,3.6rem)] font-bold leading-[1.08] tracking-[-0.02em]">{c.title}</h1>
            <p className="lead max-w-2xl text-pale">{c.summary}</p>
            <div className="flex flex-wrap items-center gap-3.5">
              <a href={whatsapp} target="_blank" rel="noopener" className="btn btn-gold">Register your interest</a>
              <a href={`mailto:${site.email}?subject=${encodeURIComponent(`Course: ${c.title}`)}&body=${encodeURIComponent(enrolText)}`} className="btn btn-line-light">Email us</a>
            </div>
            <p className="text-sm text-pale">{courseFacts.status}. Register now and we'll tell you when the next class begins.</p>
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

            <div className="flex flex-col gap-4 rounded-3xl bg-mist p-[clamp(1.5rem,3vw,2.25rem)]">
              <h2 className="text-2xl font-bold text-navy">What you'll learn</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {c.outcomes.map((o) => <li key={o} className="tick">{o}</li>)}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-navy">Syllabus</h2>
              <ol className="flex flex-col border-t border-line">
                {c.modules.map((m, i) => (
                  <li key={m.title}>
                    <details className="group border-b border-line" open={i === 0}>
                      <summary className="flex cursor-pointer list-none items-center gap-4 py-4">
                        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-navy text-sm font-bold text-gold">{i + 1}</span>
                        <span className="flex-1 font-semibold text-navy">{m.title}</span>
                        <span className="text-xl text-royal group-open:hidden">+</span>
                        <span className="hidden text-xl text-royal group-open:inline">−</span>
                      </summary>
                      <p className="pb-4 pl-[3.25rem] text-muted">{m.text}</p>
                    </details>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <aside className="flex flex-col gap-5 lg:sticky lg:top-28" aria-label="Course details">
            <div className="flex flex-col gap-3 rounded-3xl border border-line p-6">
              <h2 className="text-lg font-bold text-navy">Who this course is for</h2>
              <p className="text-[0.9375rem] text-muted">{c.audience}</p>
              <h2 className="pt-2 text-lg font-bold text-navy">Before you start</h2>
              <p className="text-[0.9375rem] text-muted">{c.prerequisites}</p>
              <h2 className="pt-2 text-lg font-bold text-navy">Instructors</h2>
              <p className="text-[0.9375rem] text-muted">{courseFacts.instructors}</p>
              <h2 className="pt-2 text-lg font-bold text-navy">Certificate</h2>
              <p className="text-[0.9375rem] text-muted">{courseFacts.certificate}.</p>
            </div>
            <div className="flex flex-col gap-3 rounded-3xl bg-navy p-6 text-white">
              <p className="flex items-center gap-2.5 font-semibold"><span className="text-gold"><Chat size={22} /></span>Questions about this course?</p>
              <p className="text-sm text-pale">Call or WhatsApp {site.phone}, or email {site.email}.</p>
              <a href={whatsapp} target="_blank" rel="noopener" className="btn btn-gold">Register your interest</a>
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
            <Link href="/courses/" className="self-start font-semibold">All {courses.length} courses →</Link>
          </div>
        </section>
      )}
    </>
  );
}
