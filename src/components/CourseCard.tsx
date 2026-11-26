import Link from "next/link";
import type { Course, CourseCategory } from "@/content/courses";
import { categoryName } from "@/content/courses";
import { Book, Briefcase, Calendar, Flame, Heart, Chat, Clock, People, Pen, Play, Plus, Music } from "@/components/icons";

const coverStyle: Record<CourseCategory, { bg: string; Icon: (p: { size?: number }) => React.JSX.Element }> = {
  bible: { bg: "from-navy via-navy-2 to-royal", Icon: Book },
  theology: { bg: "from-navy-2 via-navy to-royal", Icon: Flame },
  living: { bg: "from-royal via-navy-2 to-navy", Icon: Heart },
  history: { bg: "from-navy via-royal to-navy", Icon: Calendar },
  evangelism: { bg: "from-royal via-navy-2 to-navy", Icon: Chat },
  writing: { bg: "from-navy-2 via-royal to-navy", Icon: Pen },
  music: { bg: "from-royal to-navy", Icon: Music },
  media: { bg: "from-navy via-royal to-navy-2", Icon: Play },
  leadership: { bg: "from-navy-2 to-royal", Icon: People },
  health: { bg: "from-royal via-navy to-navy-2", Icon: Plus },
  skills: { bg: "from-navy to-royal", Icon: Briefcase },
};

/** The cover art for a course: brand colours, a pattern and the subject icon. */
export function CourseCover({ category, className = "", big = false }: { category: CourseCategory; className?: string; big?: boolean }) {
  const { bg, Icon } = coverStyle[category];
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${bg} ${className}`} aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full opacity-[0.13]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 200 120">
        <circle cx="170" cy="20" r="60" fill="none" stroke="#fff" strokeWidth="1" />
        <circle cx="170" cy="20" r="40" fill="none" stroke="#fff" strokeWidth="1" />
        <circle cx="170" cy="20" r="20" fill="none" stroke="#fff" strokeWidth="1" />
        <path d="M0 100 L200 60" stroke="#fff" strokeWidth="0.8" />
        <path d="M0 112 L200 72" stroke="#fff" strokeWidth="0.8" />
      </svg>
      <div className="absolute bottom-0 left-0 h-1.5 w-1/3 bg-gold" />
      <span className={`absolute right-5 top-1/2 -translate-y-1/2 text-white/90 ${big ? "" : ""}`}>
        <Icon size={big ? 96 : 56} />
      </span>
    </div>
  );
}

type CardCourse = {
  slug: string;
  title: string;
  weeks: number;
  category?: CourseCategory;
  subject?: CourseCategory;
  href?: string;
  program?: string | null;
  code?: string | null;
  open?: boolean;
};

/** An edX-style course card: cover, logo, title, who offers it, and the course type and length. */
export function CourseCard({ course }: { course: CardCourse }) {
  const subject = (course.subject ?? course.category ?? "bible") as CourseCategory;
  return (
    <Link
      href={course.href ?? `/courses/${course.slug}/`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white text-ink no-underline shadow-sm transition hover:-translate-y-0.5 hover:text-ink hover:shadow-[0_8px_24px_rgba(11,31,58,0.14)]"
    >
      <div className="relative">
        <CourseCover category={subject} className="h-28 sm:h-32" />
        {course.code && <span className="absolute left-3 top-3 rounded-md bg-navy/80 px-2 py-0.5 text-[0.6875rem] font-bold tracking-[0.12em] text-gold">{course.code}</span>}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/strongs-logo.webp" alt="" className="absolute -bottom-5 left-4 h-11 w-11 rounded-lg border-2 border-white bg-white p-0.5 shadow sm:-bottom-6 sm:h-12 sm:w-12" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-4 pb-4 pt-7 sm:gap-2 sm:pt-8">
        <h3 className="text-base font-bold leading-snug text-navy group-hover:text-royal sm:text-[1.0625rem]">{course.title}</h3>
        <p className="text-[0.8125rem] text-muted sm:text-sm">{course.program ? `STRONGS ${course.program}` : `STRONGS · ${categoryName(subject)}`}</p>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3 text-xs font-semibold">
          <span className={`rounded-md px-2 py-1 ${course.program ? "bg-gold/20 text-navy" : "bg-mist text-navy"}`}>{course.program ? "Course · Certificate" : course.open === false ? "Coming soon" : "Course"}</span>
          <span className="flex items-center gap-1.5 text-muted"><Clock size={15} />{course.weeks} weeks</span>
        </div>
      </div>
    </Link>
  );
}
