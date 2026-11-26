import type { Metadata } from "next";
import Link from "next/link";
import { courseFacts, courses as builtIn } from "@/content/courses";
import { getCatalogue, getCategories } from "@/lib/lms";
import { LearnBar } from "@/components/learn/LearnBar";
import { CourseCard } from "@/components/CourseCard";
import { Carousel } from "@/components/Carousel";
import { SectionHeading } from "@/components/ui";
import { CourseSearch } from "@/components/CourseSearch";
import { Book, Cap, Clock, People } from "@/components/icons";

export const metadata: Metadata = {
  title: "Courses",
  description: `Short courses from STRONGS in the Bible, evangelism, writing, singing, media, leadership, health and life skills. ${builtIn.length} courses, free to join, self-paced.`,
};

// Course details are managed in the admin area; refresh the catalogue at most every few minutes.
export const revalidate = 300;

export default async function CoursesPage() {
  const courses = await getCatalogue();
  const courseCategories = await getCategories();
  const coursesIn = (cat: string) => courses.filter((c) => c.category === cat);
  const featured = courses.filter((c) => c.featured);
  return (
    <>
      <LearnBar />
      <section aria-labelledby="co-title" className="bg-navy text-white">
        <div className="container-site grid items-center gap-12 py-[clamp(3.5rem,7vw,6rem)] lg:grid-cols-[1.25fr_1fr]">
          <div className="flex flex-col gap-6">
            <p className="eyebrow-dark">STRONGS Courses · Learning and innovation</p>
            <h1 id="co-title" className="text-[clamp(2.5rem,5.2vw,4.25rem)] font-bold leading-[1.08] tracking-[-0.02em]">
              Sharpen your mind. <span className="text-gold">Build your future.</span>
            </h1>
            <p className="lead max-w-xl text-pale">
              {courses.length} short courses for spiritual intellectuals: writing, music, media and design, leadership, health, digital skills, enterprise and sound biblical thinking. Practical, well-taught and self-paced: study online whenever it suits you, and earn a certificate.
            </p>
            <CourseSearch />
          </div>
          <ul className="grid grid-cols-2 gap-4">
            {[
              { Icon: Book, big: String(courses.length), small: "short courses" },
              { Icon: Cap, big: String(courseCategories.length), small: "subject areas" },
              { Icon: Clock, big: "2–6", small: "weeks each" },
              { Icon: People, big: courseFacts.cost, small: "to join" },
            ].map(({ Icon, big, small }) => (
              <li key={small} className="flex flex-col gap-2 rounded-2xl bg-navy-2 p-6">
                <span className="text-gold"><Icon size={26} /></span>
                <span className="text-[clamp(1.8rem,3vw,2.4rem)] font-extrabold leading-none">{big}</span>
                <span className="text-sm text-pale">{small}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <nav aria-label="Subjects" className="sticky top-[73px] z-20 border-b border-line bg-white/95 backdrop-blur">
        <div className="container-site flex gap-2 overflow-x-auto py-3">
          {courseCategories.map((c) => (
            <a key={c.id} href={`#${c.id}`} className="whitespace-nowrap rounded-full border border-steel px-4 py-1.5 text-sm font-medium text-ink no-underline hover:border-royal hover:text-royal">
              {c.name}
            </a>
          ))}
        </div>
      </nav>

      <section aria-labelledby="feat-title" className="bg-white">
        <div className="container-site flex flex-col gap-6 pt-[clamp(3rem,6vw,4.5rem)]">
          <SectionHeading id="feat-title" eyebrow="Start here" title="Popular courses" />
          <Carousel label="Popular courses">
            {featured.map((c) => (
              <li key={c.slug} className="w-[17rem]"><CourseCard course={c} /></li>
            ))}
          </Carousel>
        </div>
      </section>

      <section aria-labelledby="school-title" className="bg-white">
        <div className="container-site pt-[clamp(2.5rem,5vw,3.5rem)]">
          <div className="flex flex-wrap items-center gap-x-10 gap-y-5 rounded-3xl bg-navy p-[clamp(1.5rem,4vw,2.75rem)] text-white">
            <div className="flex min-w-0 flex-[1_1_28rem] flex-col gap-3">
              <p className="eyebrow-dark">STRONGS School of Theology</p>
              <h2 id="school-title" className="text-[clamp(1.7rem,3vw,2.4rem)] font-bold leading-tight">Fifty theology courses, in plain English</h2>
              <p className="text-pale">The Bible, its doctrines, church history, Christian living and ministry. Self-paced, with weekly quizzes, a test, assignments, a final exam and a certificate.</p>
            </div>
            <Link href="/courses/theology/" className="btn btn-gold">Explore the School of Theology</Link>
          </div>
        </div>
      </section>

      {courseCategories.map((cat, i) => {
        const list = coursesIn(cat.id);
        return (
          <section key={cat.id} id={cat.id} aria-labelledby={`${cat.id}-t`} className={i % 2 ? "bg-white" : "bg-mist"} data-course-section>
            <div className="container-site flex flex-col gap-5 py-[clamp(2.5rem,5vw,3.5rem)]">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <h2 id={`${cat.id}-t`} className="text-[clamp(1.5rem,2.6vw,2rem)] font-bold leading-tight text-navy">{cat.name}</h2>
                  <p className="text-muted">{cat.blurb}</p>
                </div>
                <p className="text-sm font-semibold text-royal">{list.length} {list.length === 1 ? "course" : "courses"}</p>
              </div>
              <Carousel label={`${cat.name} courses`}>
                {list.map((c) => (
                  <li key={c.slug} className="w-[17rem]" data-course-title={`${c.title} ${c.summary} ${cat.name}`.toLowerCase()}>
                    <CourseCard course={c} />
                  </li>
                ))}
              </Carousel>
            </div>
          </section>
        );
      })}

      <section aria-labelledby="how-title" className="bg-navy text-white">
        <div className="container-site section-pad grid items-start gap-12 lg:grid-cols-2">
          <SectionHeading dark id="how-title" eyebrow="How it works" title="Short, practical and self-paced" intro="Every course is short enough to finish and practical enough to use. Study online at your own pace, test what you have learnt, and put it to work in the field." />
          <ol className="flex flex-col gap-4">
            {[
              ["Create a free account", "Choose a course and enrol. If its lessons are still being prepared, register your interest."],
              ["Study at your pace", "Read each lesson, do the practical assignments and take the quizzes, on your phone or computer."],
              ["Pick up where you stopped", "My learning keeps your progress and takes you straight back to your next lesson."],
              ["Finish well", `${courseFacts.certificate}: download it as soon as you complete the course.`],
            ].map(([t, d], n) => (
              <li key={t} className="flex gap-4 rounded-2xl bg-navy-2 p-5">
                <span className="text-lg font-extrabold text-gold">{n + 1}</span>
                <span className="flex flex-col gap-1"><strong className="font-semibold">{t}</strong><span className="text-[0.9375rem] text-pale">{d}</span></span>
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
    </>
  );
}
