import type { Metadata } from "next";
import Link from "next/link";
import { courseFacts } from "@/content/courses";
import { getCatalogItems, getSubjects, THEOLOGY_PROGRAM } from "@/lib/catalog";
import { CourseCard } from "@/components/CourseCard";
import { Carousel } from "@/components/Carousel";
import { SectionHeading } from "@/components/ui";
import { Book, Cap, Check, Clock, People, Search, User } from "@/components/icons";

export const metadata: Metadata = {
  title: "Courses",
  description: `Courses from STRONGS in the Bible, theology, Christian living, church history, evangelism, ministry, writing, music, media, health and life skills. Free to join, self-paced, with certificates.`,
};

// Course details are managed in the admin area; refresh the catalogue at most every few minutes.
export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const [items, subjects] = await Promise.all([getCatalogItems(), getSubjects()]);
  const inSubject = (id: string) => items.filter((c) => c.subject === id).sort((a, b) => Number(b.open) - Number(a.open));
  const shown = subjects.filter((s) => inSubject(s.id).length > 0);
  const featured = items.filter((c) => c.featured).sort((a, b) => Number(b.open) - Number(a.open));
  const theology = items.filter((c) => c.program === THEOLOGY_PROGRAM);
  return (
    <div className="edx">
      <section aria-labelledby="co-title" className="bg-navy text-white">
        <div className="container-site grid items-center gap-8 py-[clamp(2.25rem,6vw,5rem)] lg:grid-cols-[1.25fr_1fr] lg:gap-12">
          <div className="flex flex-col gap-4 sm:gap-6">
            <p className="eyebrow-dark">STRONGS Courses · Learning and innovation</p>
            <h1 id="co-title" className="text-[clamp(2rem,5.6vw,4.5rem)] font-black leading-[1.04] tracking-[-0.015em]">
              Sharpen your mind. <span className="text-gold">Build your future.</span>
            </h1>
            <form action="/courses/search/" role="search" className="flex max-w-xl items-center gap-2 rounded-full bg-white p-1.5 pl-5 text-ink shadow-lg">
              <label htmlFor="course-q" className="sr-only">Search courses</label>
              <span className="text-muted"><Search size={20} /></span>
              <input id="course-q" name="q" type="search" placeholder="What do you want to learn?" className="min-w-0 flex-1 bg-transparent py-2 text-[0.9375rem] outline-none placeholder:text-muted" />
              <button type="submit" className="btn btn-gold min-h-10 px-5 text-sm">Search</button>
            </form>
          </div>
          <ul className="grid grid-cols-2 gap-2.5 sm:gap-4">
            {[
              { Icon: Book, big: String(items.length), small: "courses" },
              { Icon: Cap, big: String(shown.length), small: "subjects" },
              { Icon: Clock, big: "Self-paced", small: "start any time" },
              { Icon: People, big: courseFacts.cost, small: "to join" },
            ].map(({ Icon, big, small }) => (
              <li key={small} className="flex flex-col gap-1 rounded-xl bg-navy-2 p-4 sm:gap-2 sm:rounded-2xl sm:p-6">
                <span className="text-gold"><Icon size={22} /></span>
                <span className="text-[clamp(1.25rem,3vw,2.2rem)] font-extrabold leading-none">{big}</span>
                <span className="text-[0.8125rem] text-pale sm:text-sm">{small}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <nav aria-label="Subjects" className="sticky top-[73px] z-20 border-b border-line bg-white/95 backdrop-blur">
        <div className="container-site flex gap-2 overflow-x-auto py-2.5 sm:py-3">
          {shown.map((c) => (
            <a key={c.id} href={`#${c.id}`} className="whitespace-nowrap rounded-full border border-steel px-3.5 py-1.5 text-[0.8125rem] font-medium text-ink no-underline hover:border-royal hover:text-royal sm:px-4 sm:text-sm">
              {c.name}
            </a>
          ))}
          <Link href="/courses/search/" className="whitespace-nowrap rounded-full bg-navy px-3.5 py-1.5 text-[0.8125rem] font-semibold text-white no-underline hover:bg-royal hover:text-white sm:px-4 sm:text-sm">All courses →</Link>
        </div>
      </nav>

      <section aria-labelledby="feat-title" className="bg-white">
        <div className="container-site flex flex-col gap-4 pt-[clamp(2rem,6vw,4rem)] sm:gap-6">
          <Row id="feat-title" title="Popular courses" blurb="Good places to start." href="/courses/search/" count={items.length} />
          <Carousel label="Popular courses">
            {featured.map((c) => <li key={c.slug} className="w-[15rem] sm:w-[17rem]"><CourseCard course={c} /></li>)}
          </Carousel>
        </div>
      </section>

      <section aria-labelledby="school-title" className="bg-white">
        <div className="container-site pt-[clamp(1.5rem,4vw,2.5rem)]">
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4 rounded-2xl bg-navy p-[clamp(1.25rem,4vw,2.5rem)] text-white sm:rounded-3xl">
            <div className="flex min-w-0 flex-[1_1_26rem] flex-col gap-2">
              <p className="eyebrow-dark">Programme</p>
              <h2 id="school-title" className="text-[clamp(1.25rem,3vw,2rem)] font-bold leading-tight">STRONGS School of Theology</h2>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-pale">
                {[`${theology.length} courses`, "Quizzes and exams", "Certificate"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5"><span className="text-gold"><Check size={16} /></span>{t}</li>
                ))}
              </ul>
            </div>
            <Link href="/courses/theology/" className="btn btn-gold">View the programme</Link>
          </div>
        </div>
      </section>

      {shown.map((cat, i) => {
        const list = inSubject(cat.id);
        return (
          <section key={cat.id} id={cat.id} aria-labelledby={`${cat.id}-t`} className={`scroll-mt-32 ${i % 2 ? "bg-mist" : "bg-white"}`}>
            <div className="container-site flex flex-col gap-4 py-[clamp(2rem,5vw,3.5rem)] sm:gap-5">
              <Row id={`${cat.id}-t`} title={cat.name} blurb={cat.blurb} href={`/courses/search/?subject=${cat.id}`} count={list.length} />
              <Carousel label={`${cat.name} courses`}>
                {list.map((c) => <li key={c.slug} className="w-[15rem] sm:w-[17rem]"><CourseCard course={c} /></li>)}
              </Carousel>
            </div>
          </section>
        );
      })}

      <section aria-labelledby="how-title" className="bg-navy text-white">
        <div className="container-site section-pad grid items-start gap-12 lg:grid-cols-2">
          <SectionHeading dark id="how-title" eyebrow="How it works" title="Short, practical and self-paced" />
          <ol className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              { Icon: User, t: "Join free" },
              { Icon: Book, t: "Study at your pace" },
              { Icon: Clock, t: "Pick up where you stopped" },
              { Icon: Cap, t: "Get your certificate" },
            ].map(({ Icon, t }, n) => (
              <li key={t} className="relative flex flex-col items-center gap-3 rounded-2xl bg-navy-2 px-3 py-6 text-center">
                <span className="absolute left-3 top-2.5 text-sm font-extrabold text-gold/70">{n + 1}</span>
                <span className="grid h-14 w-14 place-items-center rounded-full bg-gold text-navy"><Icon size={26} /></span>
                <strong className="font-semibold leading-snug">{t}</strong>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="teach-title" className="bg-white">
        <div className="container-site flex flex-wrap items-center justify-between gap-6 py-18">
          <div className="flex max-w-2xl flex-col gap-3">
            <h2 id="teach-title" className="text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight text-navy">Teach a course with us</h2>
            <p className="lead text-muted">Are you gifted in one of these areas, or another we have not listed? We would love to hear from you.</p>
          </div>
          <div className="flex flex-wrap gap-3.5">
            <a href="mailto:strongsimpact@gmail.com?subject=Teaching%20a%20STRONGS%20course" className="btn btn-navy">Offer to teach</a>
            <Link href="/communities/" className="btn btn-line">Join a community</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/** A carousel heading with an edX-style "View all" link to the list view. */
function Row({ id, title, blurb, href, count }: { id: string; title: string; blurb: string; href: string; count: number }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <h2 id={id} className="text-[clamp(1.25rem,2.6vw,2rem)] font-bold leading-tight text-navy">{title}</h2>
        <p className="text-[0.9375rem] text-muted sm:text-base">{blurb}</p>
      </div>
      <Link href={href} className="flex-none whitespace-nowrap text-sm font-semibold">View all {count} →</Link>
    </div>
  );
}
