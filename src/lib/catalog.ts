import "server-only";
import { courseCategories, type CourseCategory } from "@/content/courses";
import { theologyCode, theologySubject } from "@/content/theology/catalog";
import { getCatalogue, getCategories, type Category } from "@/lib/lms";
import { allTheologyCourses } from "@/lib/theology/content";
import { courseHours } from "@/lib/theology/meta";

/**
 * One catalogue for every STRONGS course (edX-style): short courses and School of Theology
 * courses side by side, browsed by subject. A programme (the School of Theology) is a badge
 * on the card and a filter, not a separate catalogue.
 */
export type CatalogItem = {
  slug: string;
  href: string;
  title: string;
  summary: string;
  subject: CourseCategory;
  level: string;
  weeks: number;
  effort: string;
  program: string | null;
  code: string | null;
  featured: boolean;
  open: boolean;
  /** Lower-case text the search box matches against. */
  search: string;
};

export const THEOLOGY_PROGRAM = "School of Theology";

/** These theology courses lead their subjects in the Popular carousel. */
const featuredTheology = new Set(["introduction-to-theology", "the-doctrine-of-god", "the-person-of-christ", "the-holy-spirit", "the-church", "prayer-and-fasting", "personal-evangelism"]);

export async function getSubjects(): Promise<Category[]> {
  const cats = await getCategories();
  const rank = (id: string) => {
    const i = courseCategories.findIndex((c) => c.id === id);
    return i < 0 ? 999 : i;
  };
  return [...cats].sort((a, b) => rank(a.id) - rank(b.id));
}

export async function getCatalogItems(): Promise<CatalogItem[]> {
  const [general, subjects] = await Promise.all([getCatalogue(), getSubjects()]);
  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? id;
  const items: CatalogItem[] = general.map((c) => ({
    slug: c.slug,
    href: `/courses/${c.slug}/`,
    title: c.title,
    summary: c.summary,
    subject: c.category,
    level: c.level,
    weeks: c.weeks,
    effort: c.effort,
    program: null,
    code: null,
    featured: !!c.featured,
    open: c.enrolmentOpen && c.lessonCount > 0,
    search: "",
  }));
  for (const c of allTheologyCourses()) {
    items.push({
      slug: c.slug,
      href: `/courses/theology/${c.slug}/`,
      title: c.title,
      summary: c.summary,
      subject: theologySubject(c.slug) as CourseCategory,
      level: c.level,
      weeks: c.modules.length,
      effort: courseHours(c),
      program: THEOLOGY_PROGRAM,
      code: theologyCode(c.slug),
      featured: featuredTheology.has(c.slug),
      open: true,
      search: "",
    });
  }
  for (const i of items) i.search = [i.title, i.summary, subjectName(i.subject), i.program ?? "", i.code ?? "", i.level].join(" ").toLowerCase();
  return items;
}
