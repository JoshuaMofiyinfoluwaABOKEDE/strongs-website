import "server-only";
import { randomBytes } from "node:crypto";
import { hasDatabase, one, q } from "@/lib/db";
import { ensureReady } from "@/lib/setup";
import { courseCategories, courses as staticCourses, type Course as StaticCourse, type CourseCategory } from "@/content/courses";

/* ───────────────────────── Types ───────────────────────── */

export type Category = { id: string; name: string; blurb: string };

export type CourseRow = {
  id: number;
  slug: string;
  title: string;
  category_id: string;
  level: string;
  weeks: number;
  effort: string;
  format: string;
  summary: string;
  about: string;
  objectives: string[];
  outcomes: string[];
  audience: string;
  prerequisites: string;
  featured: boolean;
  listed: boolean;
  enrolment_open: boolean;
  position: number;
  review: Record<string, boolean>;
  reviewed_by: string | null;
  reviewed_at: string | null;
};

export type ModuleRow = { id: number; course_id: number; position: number; title: string; summary: string };
export type LessonRow = {
  id: number;
  module_id: number;
  position: number;
  kind: "reading" | "assignment";
  title: string;
  body: string;
  scripture: string;
  video_url: string;
  resources: { label: string; url: string }[];
  minutes: number;
  published: boolean;
};
export type AssessmentRow = {
  id: number;
  course_id: number;
  module_id: number | null;
  kind: "quiz" | "final";
  title: string;
  instructions: string;
  pass_mark: number;
  published: boolean;
  position: number;
};
export type QuestionRow = {
  id: number;
  assessment_id: number;
  position: number;
  kind: "single" | "multiple";
  prompt: string;
  options: { id: string; text: string }[];
  correct: string[];
  explanation: string;
};

/** The standards every course is checked against before it opens for enrolment. */
export const standards: { key: string; label: string; help: string }[] = [
  { key: "scripture", label: "Biblically accurate", help: "Every Bible reference has been checked, quoted correctly and read in its context." },
  { key: "doctrine", label: "Sound Christian doctrine", help: "Teaching agrees with the historic Christian faith: the Trinity, the person and work of Christ, salvation by grace through faith, the authority of Scripture." },
  { key: "nondenominational", label: "Non-denominational", help: "No denomination's distinctives are taught as required; secondary matters are presented fairly and charitably." },
  { key: "practical", label: "Practically relevant", help: "Each module leads to something the learner can do, with assignments that apply it." },
  { key: "intellectual", label: "Intellectual quality", help: "Clear, well-reasoned and accurate; sources are credited and facts are checked." },
  { key: "original", label: "Original or permitted material", help: "Lesson text is the author's own or used with permission; nothing is copied without credit." },
];

/* ───────────────────── Catalogue (public) ───────────────────── */

/** A course as the public pages show it. Falls back to the built-in list if the database is not connected. */
export type CatalogueCourse = StaticCourse & {
  id?: number;
  objectives: string[];
  enrolmentOpen: boolean;
  lessonCount: number;
  minutes: number;
};

function fromStatic(c: StaticCourse): CatalogueCourse {
  return { ...c, objectives: [], enrolmentOpen: false, lessonCount: 0, minutes: 0 };
}

export async function getCategories(): Promise<Category[]> {
  if (!hasDatabase) return courseCategories;
  await ensureReady();
  return q<Category>(`SELECT id, name, blurb FROM lms_category ORDER BY position, name`);
}

export async function getCatalogue(): Promise<CatalogueCourse[]> {
  if (!hasDatabase) return staticCourses.map(fromStatic);
  await ensureReady();
  const rows = await q<CourseRow & { lesson_count: number; minutes: number; modules: { title: string; text: string }[] | null }>(
    `SELECT c.*,
       (SELECT count(*)::int FROM lms_lesson l JOIN lms_module m ON m.id = l.module_id WHERE m.course_id = c.id AND l.published) AS lesson_count,
       (SELECT coalesce(sum(l.minutes),0)::int FROM lms_lesson l JOIN lms_module m ON m.id = l.module_id WHERE m.course_id = c.id AND l.published) AS minutes,
       (SELECT json_agg(json_build_object('title', m.title, 'text', m.summary) ORDER BY m.position, m.id) FROM lms_module m WHERE m.course_id = c.id) AS modules
     FROM lms_course c WHERE c.listed ORDER BY c.position, c.title`,
  );
  return rows.map(toCatalogue);
}

function toCatalogue(r: CourseRow & { lesson_count?: number; minutes?: number; modules?: { title: string; text: string }[] | null }): CatalogueCourse {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category_id as CourseCategory,
    level: r.level as StaticCourse["level"],
    weeks: r.weeks,
    effort: r.effort,
    format: r.format,
    summary: r.summary,
    about: r.about,
    outcomes: r.outcomes ?? [],
    objectives: r.objectives ?? [],
    modules: r.modules ?? [],
    audience: r.audience,
    prerequisites: r.prerequisites,
    featured: r.featured,
    enrolmentOpen: r.enrolment_open,
    lessonCount: r.lesson_count ?? 0,
    minutes: r.minutes ?? 0,
  };
}

/* ───────────────────── A single course ───────────────────── */

export type Outline = {
  course: CourseRow;
  modules: (ModuleRow & { lessons: LessonRow[]; assessments: AssessmentRow[] })[];
  finals: AssessmentRow[];
};

/** A course with its modules, lessons and assessments. `all` includes unpublished items (admin). */
export async function getOutline(slugOrId: string | number, all = false): Promise<Outline | null> {
  if (!hasDatabase) return null;
  await ensureReady();
  const course = await one<CourseRow>(
    typeof slugOrId === "number" ? `SELECT * FROM lms_course WHERE id = $1` : `SELECT * FROM lms_course WHERE slug = $1`,
    [slugOrId],
  );
  if (!course) return null;
  const mods = await q<ModuleRow>(`SELECT * FROM lms_module WHERE course_id = $1 ORDER BY position, id`, [course.id]);
  const lessons = await q<LessonRow>(
    `SELECT l.* FROM lms_lesson l JOIN lms_module m ON m.id = l.module_id WHERE m.course_id = $1 ${all ? "" : "AND l.published"} ORDER BY l.position, l.id`,
    [course.id],
  );
  const assessments = await q<AssessmentRow>(
    `SELECT * FROM lms_assessment WHERE course_id = $1 ${all ? "" : "AND published"} ORDER BY position, id`,
    [course.id],
  );
  return {
    course,
    modules: mods.map((m) => ({
      ...m,
      lessons: lessons.filter((l) => l.module_id === m.id),
      assessments: assessments.filter((a) => a.module_id === m.id),
    })),
    finals: assessments.filter((a) => a.module_id === null),
  };
}

/** Lessons and assessments in the order a learner meets them. */
export function sequence(o: Outline) {
  const items: ({ type: "lesson"; lesson: LessonRow } | { type: "assessment"; assessment: AssessmentRow })[] = [];
  for (const m of o.modules) {
    for (const l of m.lessons) items.push({ type: "lesson", lesson: l });
    for (const a of m.assessments) items.push({ type: "assessment", assessment: a });
  }
  for (const a of o.finals) items.push({ type: "assessment", assessment: a });
  return items;
}

/* ───────────────────── Learner progress ───────────────────── */

export type Progress = {
  enrolled: boolean;
  enrolment: { enrolled_at: string; last_lesson_id: number | null; completed_at: string | null } | null;
  doneLessons: Set<number>;
  submissions: Map<number, { status: "pending" | "approved" | "revise"; feedback: string; text: string; link: string; submitted_at: string }>;
  best: Map<number, { score: number; passed: boolean }>;
  total: number;
  complete: number;
  percent: number;
  finished: boolean;
};

export async function getProgress(userId: string, o: Outline): Promise<Progress> {
  const enrolment = await one<{ enrolled_at: string; last_lesson_id: number | null; completed_at: string | null }>(
    `SELECT enrolled_at, last_lesson_id, completed_at FROM lms_enrolment WHERE user_id = $1 AND course_id = $2`,
    [userId, o.course.id],
  );
  const lessonIds = o.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const assessIds = [...o.modules.flatMap((m) => m.assessments.map((a) => a.id)), ...o.finals.map((a) => a.id)];
  const done = lessonIds.length
    ? await q<{ lesson_id: number }>(`SELECT lesson_id FROM lms_lesson_progress WHERE user_id = $1 AND lesson_id = ANY($2)`, [userId, lessonIds])
    : [];
  const subs = lessonIds.length
    ? await q<{ lesson_id: number; status: "pending" | "approved" | "revise"; feedback: string; text: string; link: string; submitted_at: string }>(
        `SELECT lesson_id, status, feedback, text, link, submitted_at FROM lms_submission WHERE user_id = $1 AND lesson_id = ANY($2)`,
        [userId, lessonIds],
      )
    : [];
  const attempts = assessIds.length
    ? await q<{ assessment_id: number; score: number; passed: boolean }>(
        `SELECT assessment_id, max(score)::int AS score, bool_or(passed) AS passed FROM lms_attempt WHERE user_id = $1 AND assessment_id = ANY($2) GROUP BY assessment_id`,
        [userId, assessIds],
      )
    : [];
  const doneLessons = new Set(done.map((d) => d.lesson_id));
  const best = new Map(attempts.map((a) => [a.assessment_id, { score: a.score, passed: a.passed }]));
  const total = lessonIds.length + assessIds.length;
  const complete = lessonIds.filter((id) => doneLessons.has(id)).length + assessIds.filter((id) => best.get(id)?.passed).length;
  return {
    enrolled: !!enrolment,
    enrolment,
    doneLessons,
    submissions: new Map(subs.map((s) => [s.lesson_id, s])),
    best,
    total,
    complete,
    percent: total ? Math.round((complete / total) * 100) : 0,
    finished: total > 0 && complete === total,
  };
}

/** The next thing to study: the first unfinished lesson or assessment. */
export function nextStep(o: Outline, p: Progress) {
  for (const item of sequence(o)) {
    if (item.type === "lesson" && !p.doneLessons.has(item.lesson.id)) return item;
    if (item.type === "assessment" && !p.best.get(item.assessment.id)?.passed) return item;
  }
  return null;
}

/** Remember where the learner is, so "Continue" brings them back here. (Not a server action.) */
export async function touchLesson(userId: string, courseId: number, lessonId: number) {
  await q(`UPDATE lms_enrolment SET last_lesson_id = $3, last_active_at = now() WHERE user_id = $1 AND course_id = $2`, [userId, courseId, lessonId]);
}

export const lessonHref = (slug: string, id: number) => `/learn/${slug}/lesson/${id}/`;
export const assessmentHref = (slug: string, id: number) => `/learn/${slug}/assessment/${id}/`;

/**
 * Checks whether the learner has finished every published lesson, passed every
 * published assessment and had every assignment approved. If so, marks the course
 * complete and issues the certificate (once).
 */
export async function checkCompletion(userId: string, courseId: number): Promise<string | null> {
  const o = await getOutline(courseId);
  if (!o) return null;
  const p = await getProgress(userId, o);
  if (!p.enrolled || !p.finished) return null;
  await q(`UPDATE lms_enrolment SET completed_at = coalesce(completed_at, now()) WHERE user_id = $1 AND course_id = $2`, [userId, courseId]);
  const existing = await one<{ code: string }>(`SELECT code FROM lms_certificate WHERE user_id = $1 AND course_id = $2`, [userId, courseId]);
  if (existing) return existing.code;
  const user = await one<{ name: string }>(`SELECT name FROM "user" WHERE id = $1`, [userId]);
  const code = newCertificateCode();
  await q(
    `INSERT INTO lms_certificate (code, user_id, course_id, learner_name, course_title) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (user_id, course_id) DO NOTHING`,
    [code, userId, courseId, user?.name ?? "Learner", o.course.title],
  );
  return code;
}

export function newCertificateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  let s = "";
  for (const b of bytes) s += alphabet[b % alphabet.length];
  return `STR-${s.slice(0, 4)}-${s.slice(4)}`;
}

export type CertificateRow = {
  id: number;
  code: string;
  user_id: string;
  course_id: number;
  learner_name: string;
  course_title: string;
  issued_at: string;
  revoked: boolean;
  revoked_reason: string;
  slug?: string;
  school?: string;
};

export async function getCertificate(code: string) {
  if (!hasDatabase) return null;
  await ensureReady();
  return one<CertificateRow>(
    `SELECT ce.*, c.slug, c.school FROM lms_certificate ce JOIN lms_course c ON c.id = ce.course_id WHERE ce.code = $1`,
    [code.toUpperCase()],
  );
}

/* ───────────────────── Dashboard ───────────────────── */

export async function getMyCourses(userId: string) {
  await ensureReady();
  return q<{
    course_id: number;
    slug: string;
    title: string;
    category_id: string;
    school: string;
    enrolled_at: string;
    last_active_at: string;
    completed_at: string | null;
    total: number;
    complete: number;
    certificate: string | null;
  }>(
    `WITH my AS (SELECT * FROM lms_enrolment WHERE user_id = $1),
     items AS (
       SELECT m.course_id, l.id AS lesson_id, NULL::int AS assessment_id FROM lms_lesson l JOIN lms_module m ON m.id = l.module_id WHERE l.published AND m.course_id IN (SELECT course_id FROM my)
       UNION ALL
       SELECT a.course_id, NULL, a.id FROM lms_assessment a WHERE a.published AND a.course_id IN (SELECT course_id FROM my)
     )
     SELECT my.course_id, c.slug, c.title, c.category_id, c.school, my.enrolled_at, my.last_active_at, my.completed_at,
       (SELECT count(*)::int FROM items i WHERE i.course_id = my.course_id) AS total,
       (SELECT count(*)::int FROM items i WHERE i.course_id = my.course_id AND (
          (i.lesson_id IS NOT NULL AND EXISTS (SELECT 1 FROM lms_lesson_progress p WHERE p.user_id = $1 AND p.lesson_id = i.lesson_id))
          OR (i.assessment_id IS NOT NULL AND EXISTS (SELECT 1 FROM lms_attempt t WHERE t.user_id = $1 AND t.assessment_id = i.assessment_id AND t.passed))
       )) AS complete,
       (SELECT code FROM lms_certificate ce WHERE ce.user_id = $1 AND ce.course_id = my.course_id AND NOT ce.revoked) AS certificate
     FROM my JOIN lms_course c ON c.id = my.course_id
     ORDER BY my.completed_at IS NOT NULL, my.last_active_at DESC`,
    [userId],
  );
}

export const percent = (complete: number, total: number) => (total ? Math.round((complete / total) * 100) : 0);

/**
 * Learners go step by step: a lesson or assessment stays locked until every quiz or test before it
 * in the course has been passed. Returns the assessment that blocks the item at `index`, or null.
 */
export function blockedBy(o: Outline, p: Progress, index: number) {
  const items = sequence(o);
  for (let i = 0; i < index && i < items.length; i++) {
    const it = items[i];
    if (it.type === "assessment" && !p.best.get(it.assessment.id)?.passed) return it.assessment;
  }
  return null;
}
