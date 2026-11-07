import Link from "next/link";
import type { Course, CourseCategory } from "@/content/courses";
import { categoryName } from "@/content/courses";
import { Book, Briefcase, Chat, Clock, People, Pen, Play, Plus, Music } from "@/components/icons";

const coverStyle: Record<CourseCategory, { bg: string; Icon: (p: { size?: number }) => React.JSX.Element }> = {
  bible: { bg: "from-navy via-navy-2 to-royal", Icon: Book },
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

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.slug}/`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white text-ink no-underline shadow-sm transition hover:-translate-y-0.5 hover:text-ink hover:shadow-[0_8px_24px_rgba(11,31,58,0.14)]"
    >
      <div className="relative">
        <CourseCover category={course.category} className="h-32" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/strongs-logo.webp" alt="" className="absolute -bottom-6 left-4 h-12 w-12 rounded-lg border-2 border-white bg-white p-0.5 shadow" />
      </div>
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-8">
        <h3 className="text-[1.0625rem] font-bold leading-snug text-navy group-hover:text-royal">{course.title}</h3>
        <p className="text-sm text-muted">STRONGS · {categoryName(course.category)}</p>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3 text-xs font-semibold">
          <span className="rounded-md bg-mist px-2 py-1 text-navy">Course</span>
          <span className="flex items-center gap-1.5 text-muted"><Clock size={15} />{course.weeks} weeks</span>
        </div>
      </div>
    </Link>
  );
}
