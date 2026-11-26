import { CourseCard } from "@/components/CourseCard";
import type { CourseCategory } from "@/content/courses";
import { theologyCode, theologySubject } from "@/content/theology/catalog";
import type { TheologyCourse } from "@/content/theology/types";

/** A School of Theology course as an ordinary catalogue card (same card as every STRONGS course). */
export function TheologyCard({ c }: { c: TheologyCourse; n?: number }) {
  return (
    <CourseCard
      course={{ slug: c.slug, title: c.title, weeks: c.modules.length, subject: theologySubject(c.slug) as CourseCategory, href: `/courses/theology/${c.slug}/`, program: "School of Theology", code: theologyCode(c.slug), open: true }}
    />
  );
}
