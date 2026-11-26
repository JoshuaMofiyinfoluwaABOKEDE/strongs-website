/**
 * A STRONGS short course written as a content file. On start-up its lessons, quizzes,
 * practical assignment and final assessment are copied into the database (see syncShortCourses),
 * where they can be edited in the admin area like any other course.
 *
 * For the 27 original courses only `slug`, the content and (optionally) objectives are needed:
 * title, subject, length and description already live in the database.
 * New courses also give title, category, level, summary and about.
 */
export type ShortQuestion = { q: string; options: string[]; answer: number; why?: string };

export type ShortCourse = {
  slug: string;
  title?: string;
  category?: string;
  level?: string;
  effort?: string;
  featured?: boolean;
  summary?: string;
  about?: string;
  audience?: string;
  prerequisites?: string;
  objectives: string[];
  outcomes?: string[];
  modules: {
    title: string;
    summary: string;
    lessons: { title: string; scripture?: string; body: string }[];
    quiz: ShortQuestion[];
  }[];
  assignment: { title: string; body: string };
  final: ShortQuestion[];
  reading?: string[];
};
