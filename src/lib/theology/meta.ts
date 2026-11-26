import type { TheologyCourse } from "@/content/theology/types";

/** Estimated study time: about 3–4 hours a week. */
export const courseHours = (c: TheologyCourse) => `${c.modules.length * 3}–${c.modules.length * 4} hours`;

export const lessonCount = (c: TheologyCourse) => c.modules.reduce((n, m) => n + m.lessons.length, 0);

/** Who the course is for, if the course file does not say. */
export function audienceFor(c: TheologyCourse): string[] {
  if (c.audience?.length) return c.audience;
  return [
    "Believers who want a firm, biblical grasp of the subject",
    "Sunday school, Bible study and house fellowship teachers",
    "Church workers, ministers and leaders",
    c.level === "Foundation" ? "New believers ready to go deeper" : "Learners who have completed the Foundation courses",
  ];
}
