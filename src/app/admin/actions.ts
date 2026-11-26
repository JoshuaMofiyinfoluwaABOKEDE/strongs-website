"use server";

import { timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { one, q, tx } from "@/lib/db";
import { checkCompletion, newCertificateCode, standards } from "@/lib/lms";
import { requireAdmin, requireUser } from "@/lib/session";

/* ───────────── helpers ───────────── */

const str = (f: FormData, k: string, max = 5000) => String(f.get(k) ?? "").trim().slice(0, max);
const int = (f: FormData, k: string, d = 0) => {
  const n = Number.parseInt(str(f, k), 10);
  return Number.isFinite(n) ? n : d;
};
const bool = (f: FormData, k: string) => f.get(k) === "on" || f.get(k) === "true";
const lines = (f: FormData, k: string) =>
  str(f, k, 20000)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

function refreshPublic(slug?: string) {
  revalidatePath("/courses/");
  if (slug) revalidatePath(`/courses/${slug}/`);
}

/* ───────────── first administrator ───────────── */

/**
 * Makes the signed-in user an administrator if their email is on the admin list and they
 * enter the setup key saved in Vercel as ADMIN_SETUP_KEY. Used once, to create the first admin.
 */
export async function claimAdmin(form: FormData) {
  const user = await requireUser("/admin/setup/");
  const allowed = (process.env.ADMIN_EMAILS || "strongsimpact@gmail.com").split(",").map((e) => e.trim().toLowerCase());
  const key = process.env.ADMIN_SETUP_KEY || "";
  const given = str(form, "key");
  const ok =
    key.length >= 8 &&
    given.length === key.length &&
    timingSafeEqual(Buffer.from(given), Buffer.from(key)) &&
    allowed.includes(user.email.toLowerCase());
  if (!ok) redirect("/admin/setup/?error=1");
  await q(`UPDATE "user" SET role = 'admin' WHERE id = $1`, [user.id]);
  redirect("/admin/");
}

/* ───────────── courses ───────────── */

export async function createCourse(form: FormData) {
  await requireAdmin();
  const title = str(form, "title", 200);
  const category = str(form, "category", 40);
  if (!title || !category) redirect("/admin/courses/?error=missing");
  let slug = slugify(title) || "course";
  if (await one(`SELECT 1 FROM lms_course WHERE slug = $1`, [slug])) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  const row = await one<{ id: number }>(
    `INSERT INTO lms_course (slug, title, category_id, position, listed) VALUES ($1, $2, $3, (SELECT coalesce(max(position),0)+1 FROM lms_course), false) RETURNING id`,
    [slug, title, category],
  );
  refreshPublic();
  redirect(`/admin/courses/${row!.id}/`);
}

export async function saveCourse(form: FormData) {
  await requireAdmin();
  const id = int(form, "id");
  const old = await one<{ slug: string }>(`SELECT slug FROM lms_course WHERE id = $1`, [id]);
  if (!old) redirect("/admin/courses/");
  let slug = slugify(str(form, "slug", 100)) || old.slug;
  if (slug !== old.slug && (await one(`SELECT 1 FROM lms_course WHERE slug = $1 AND id <> $2`, [slug, id]))) slug = old.slug;
  await q(
    `UPDATE lms_course SET slug=$2, title=$3, category_id=$4, level=$5, weeks=$6, effort=$7, format=$8, summary=$9, about=$10,
       objectives=$11, outcomes=$12, audience=$13, prerequisites=$14, featured=$15, listed=$16, position=$17, updated_at=now()
     WHERE id=$1`,
    [
      id,
      slug,
      str(form, "title", 200),
      str(form, "category", 40),
      str(form, "level", 40) || "All levels",
      Math.max(1, Math.min(52, int(form, "weeks", 4))),
      str(form, "effort", 100),
      str(form, "format", 100),
      str(form, "summary", 600),
      str(form, "about", 5000),
      JSON.stringify(lines(form, "objectives")),
      JSON.stringify(lines(form, "outcomes")),
      str(form, "audience", 1000),
      str(form, "prerequisites", 1000),
      bool(form, "featured"),
      bool(form, "listed"),
      int(form, "position"),
    ],
  );
  refreshPublic(old.slug);
  refreshPublic(slug);
  redirect(`/admin/courses/${id}/?saved=details`);
}

export async function saveReview(form: FormData) {
  const admin = await requireAdmin();
  const id = int(form, "id");
  const review = Object.fromEntries(standards.map((s) => [s.key, bool(form, `std_${s.key}`)]));
  const complete = Object.values(review).every(Boolean);
  const reviewer = str(form, "reviewer", 120) || admin.name;
  await q(
    `UPDATE lms_course SET review=$2, reviewed_by=$3, reviewed_at=CASE WHEN $4 THEN now() ELSE NULL END,
       enrolment_open = CASE WHEN $4 THEN enrolment_open ELSE false END, updated_at=now() WHERE id=$1`,
    [id, JSON.stringify(review), reviewer, complete],
  );
  revalidatePath(`/admin/courses/${id}/`);
  refreshPublic();
  redirect(`/admin/courses/${id}/?saved=review#standards`);
}

export async function setEnrolment(form: FormData) {
  await requireAdmin();
  const id = int(form, "id");
  const open = bool(form, "open");
  const c = await one<{ slug: string; review: Record<string, boolean>; lessons: number }>(
    `SELECT slug, review, (SELECT count(*)::int FROM lms_lesson l JOIN lms_module m ON m.id=l.module_id WHERE m.course_id=c.id AND l.published) AS lessons FROM lms_course c WHERE id=$1`,
    [id],
  );
  if (!c) redirect("/admin/courses/");
  const reviewed = standards.every((s) => c.review?.[s.key]);
  if (open && (!reviewed || c.lessons === 0)) redirect(`/admin/courses/${id}/?error=open#standards`);
  await q(`UPDATE lms_course SET enrolment_open=$2, listed = CASE WHEN $2 THEN true ELSE listed END, updated_at=now() WHERE id=$1`, [id, open]);
  refreshPublic(c.slug);
  redirect(`/admin/courses/${id}/?saved=enrolment#standards`);
}

export async function deleteCourse(form: FormData) {
  await requireAdmin();
  const id = int(form, "id");
  if (str(form, "confirm") !== "DELETE") redirect(`/admin/courses/${id}/?error=confirm#danger`);
  const n = await one<{ n: number }>(`SELECT count(*)::int AS n FROM lms_enrolment WHERE course_id=$1`, [id]);
  if (n && n.n > 0) redirect(`/admin/courses/${id}/?error=enrolled#danger`);
  await q(`DELETE FROM lms_course WHERE id=$1`, [id]);
  refreshPublic();
  redirect("/admin/courses/?deleted=1");
}

/* ───────────── modules ───────────── */

export async function saveModule(form: FormData) {
  await requireAdmin();
  const courseId = int(form, "courseId");
  const id = int(form, "id");
  const title = str(form, "title", 200);
  if (!title) redirect(`/admin/courses/${courseId}/?error=title#curriculum`);
  if (id) {
    await q(`UPDATE lms_module SET title=$2, summary=$3, position=$4 WHERE id=$1 AND course_id=$5`, [id, title, str(form, "summary", 1000), int(form, "position"), courseId]);
  } else {
    await q(
      `INSERT INTO lms_module (course_id, title, summary, position) VALUES ($1,$2,$3,(SELECT coalesce(max(position),-1)+1 FROM lms_module WHERE course_id=$1))`,
      [courseId, title, str(form, "summary", 1000)],
    );
  }
  await refreshCourse(courseId);
  redirect(`/admin/courses/${courseId}/?saved=module#curriculum`);
}

export async function deleteModule(form: FormData) {
  await requireAdmin();
  const courseId = int(form, "courseId");
  const id = int(form, "id");
  const used = await one<{ n: number }>(
    `SELECT count(*)::int AS n FROM lms_lesson_progress p JOIN lms_lesson l ON l.id=p.lesson_id WHERE l.module_id=$1`,
    [id],
  );
  if (used && used.n > 0 && str(form, "confirm") !== "DELETE") redirect(`/admin/courses/${courseId}/?error=module-used#curriculum`);
  await q(`DELETE FROM lms_module WHERE id=$1 AND course_id=$2`, [id, courseId]);
  await refreshCourse(courseId);
  redirect(`/admin/courses/${courseId}/?saved=module#curriculum`);
}

async function refreshCourse(courseId: number) {
  const c = await one<{ slug: string }>(`SELECT slug FROM lms_course WHERE id=$1`, [courseId]);
  revalidatePath(`/admin/courses/${courseId}/`);
  if (c) {
    refreshPublic(c.slug);
    revalidatePath(`/learn/${c.slug}/`, "layout");
  }
}

/* ───────────── lessons ───────────── */

export async function createLesson(form: FormData) {
  await requireAdmin();
  const courseId = int(form, "courseId");
  const moduleId = int(form, "moduleId");
  const title = str(form, "title", 200);
  const kind = str(form, "kind") === "assignment" ? "assignment" : "reading";
  if (!title) redirect(`/admin/courses/${courseId}/?error=title#curriculum`);
  const mod = await one(`SELECT 1 FROM lms_module WHERE id=$1 AND course_id=$2`, [moduleId, courseId]);
  if (!mod) redirect(`/admin/courses/${courseId}/`);
  const row = await one<{ id: number }>(
    `INSERT INTO lms_lesson (module_id, title, kind, position) VALUES ($1,$2,$3,(SELECT coalesce(max(position),-1)+1 FROM lms_lesson WHERE module_id=$1)) RETURNING id`,
    [moduleId, title, kind],
  );
  redirect(`/admin/lessons/${row!.id}/`);
}

export async function saveLesson(form: FormData) {
  await requireAdmin();
  const id = int(form, "id");
  const lesson = await one<{ course_id: number; module_id: number }>(
    `SELECT m.course_id, l.module_id FROM lms_lesson l JOIN lms_module m ON m.id=l.module_id WHERE l.id=$1`,
    [id],
  );
  if (!lesson) redirect("/admin/courses/");
  const moduleId = int(form, "moduleId");
  const sameCourse = await one(`SELECT 1 FROM lms_module WHERE id=$1 AND course_id=$2`, [moduleId, lesson.course_id]);
  const resources = lines(form, "resources")
    .map((l) => {
      const [a, b] = l.includes("|") ? l.split("|").map((x) => x.trim()) : ["", l];
      return { label: a || b, url: b };
    })
    .filter((r) => /^https?:\/\//i.test(r.url));
  const video = str(form, "video_url", 500);
  await q(
    `UPDATE lms_lesson SET title=$2, kind=$3, module_id=$4, position=$5, minutes=$6, scripture=$7, video_url=$8, resources=$9, body=$10, published=$11, updated_at=now() WHERE id=$1`,
    [
      id,
      str(form, "title", 200),
      str(form, "kind") === "assignment" ? "assignment" : "reading",
      sameCourse ? moduleId : lesson.module_id,
      int(form, "position"),
      Math.max(1, Math.min(600, int(form, "minutes", 15))),
      str(form, "scripture", 2000),
      /^https?:\/\//i.test(video) ? video : "",
      JSON.stringify(resources),
      str(form, "body", 200000),
      bool(form, "published"),
    ],
  );
  await refreshCourse(lesson.course_id);
  redirect(`/admin/lessons/${id}/?saved=1`);
}

export async function deleteLesson(form: FormData) {
  await requireAdmin();
  const id = int(form, "id");
  const lesson = await one<{ course_id: number }>(`SELECT m.course_id FROM lms_lesson l JOIN lms_module m ON m.id=l.module_id WHERE l.id=$1`, [id]);
  if (!lesson) redirect("/admin/courses/");
  if (str(form, "confirm") !== "DELETE") redirect(`/admin/lessons/${id}/?error=confirm`);
  await q(`DELETE FROM lms_lesson WHERE id=$1`, [id]);
  await refreshCourse(lesson.course_id);
  redirect(`/admin/courses/${lesson.course_id}/?saved=lesson-deleted#curriculum`);
}

/* ───────────── assessments and questions ───────────── */

export async function createAssessment(form: FormData) {
  await requireAdmin();
  const courseId = int(form, "courseId");
  const moduleId = int(form, "moduleId");
  const title = str(form, "title", 200) || (moduleId ? "Module quiz" : "Final assessment");
  const row = await one<{ id: number }>(
    `INSERT INTO lms_assessment (course_id, module_id, kind, title, position) VALUES ($1,$2,$3,$4,(SELECT coalesce(max(position),-1)+1 FROM lms_assessment WHERE course_id=$1)) RETURNING id`,
    [courseId, moduleId || null, moduleId ? "quiz" : "final", title],
  );
  redirect(`/admin/assessments/${row!.id}/`);
}

export async function saveAssessment(form: FormData) {
  await requireAdmin();
  const id = int(form, "id");
  const a = await one<{ course_id: number }>(`SELECT course_id FROM lms_assessment WHERE id=$1`, [id]);
  if (!a) redirect("/admin/courses/");
  const moduleId = int(form, "moduleId");
  const valid = moduleId ? await one(`SELECT 1 FROM lms_module WHERE id=$1 AND course_id=$2`, [moduleId, a.course_id]) : true;
  const publish = bool(form, "published");
  const count = await one<{ n: number }>(`SELECT count(*)::int AS n FROM lms_question WHERE assessment_id=$1`, [id]);
  await q(
    `UPDATE lms_assessment SET title=$2, module_id=$3, kind=$4, pass_mark=$5, instructions=$6, published=$7, position=$8 WHERE id=$1`,
    [
      id,
      str(form, "title", 200),
      valid && moduleId ? moduleId : null,
      valid && moduleId ? "quiz" : "final",
      Math.max(0, Math.min(100, int(form, "pass_mark", 70))),
      str(form, "instructions", 5000),
      publish && (count?.n ?? 0) > 0,
      int(form, "position"),
    ],
  );
  await refreshCourse(a.course_id);
  redirect(`/admin/assessments/${id}/?saved=1${publish && !count?.n ? "&error=empty" : ""}`);
}

export async function deleteAssessment(form: FormData) {
  await requireAdmin();
  const id = int(form, "id");
  const a = await one<{ course_id: number }>(`SELECT course_id FROM lms_assessment WHERE id=$1`, [id]);
  if (!a) redirect("/admin/courses/");
  if (str(form, "confirm") !== "DELETE") redirect(`/admin/assessments/${id}/?error=confirm`);
  await q(`DELETE FROM lms_assessment WHERE id=$1`, [id]);
  await refreshCourse(a.course_id);
  redirect(`/admin/courses/${a.course_id}/?saved=assessment-deleted#curriculum`);
}

/**
 * Options are typed one per line; a line starting with * marks a correct answer.
 * One correct answer makes a single-choice question; several make it "choose all that apply".
 */
export async function saveQuestion(form: FormData) {
  await requireAdmin();
  const assessmentId = int(form, "assessmentId");
  const id = int(form, "id");
  const raw = lines(form, "options");
  const options = raw.map((l, i) => ({ id: String.fromCharCode(97 + i), text: l.replace(/^\*\s*/, "") }));
  const correct = raw.map((l, i) => (l.startsWith("*") ? String.fromCharCode(97 + i) : null)).filter(Boolean) as string[];
  const prompt = str(form, "prompt", 2000);
  if (!prompt || options.length < 2 || correct.length === 0 || options.length > 10) {
    redirect(`/admin/assessments/${assessmentId}/?error=question${id ? `&q=${id}` : ""}#questions`);
  }
  const kind = correct.length > 1 ? "multiple" : "single";
  if (id) {
    await q(
      `UPDATE lms_question SET prompt=$2, options=$3, correct=$4, kind=$5, explanation=$6, position=$7 WHERE id=$1 AND assessment_id=$8`,
      [id, prompt, JSON.stringify(options), JSON.stringify(correct), kind, str(form, "explanation", 2000), int(form, "position"), assessmentId],
    );
  } else {
    await q(
      `INSERT INTO lms_question (assessment_id, prompt, options, correct, kind, explanation, position)
       VALUES ($1,$2,$3,$4,$5,$6,(SELECT coalesce(max(position),-1)+1 FROM lms_question WHERE assessment_id=$1))`,
      [assessmentId, prompt, JSON.stringify(options), JSON.stringify(correct), kind, str(form, "explanation", 2000)],
    );
  }
  revalidatePath(`/admin/assessments/${assessmentId}/`);
  redirect(`/admin/assessments/${assessmentId}/?saved=question#questions`);
}

export async function deleteQuestion(form: FormData) {
  await requireAdmin();
  const assessmentId = int(form, "assessmentId");
  await q(`DELETE FROM lms_question WHERE id=$1 AND assessment_id=$2`, [int(form, "id"), assessmentId]);
  const left = await one<{ n: number }>(`SELECT count(*)::int AS n FROM lms_question WHERE assessment_id=$1`, [assessmentId]);
  if (!left?.n) await q(`UPDATE lms_assessment SET published=false WHERE id=$1`, [assessmentId]);
  redirect(`/admin/assessments/${assessmentId}/?saved=question#questions`);
}

/* ───────────── students and enrolments ───────────── */

export async function setRole(form: FormData) {
  const admin = await requireAdmin();
  const userId = str(form, "userId");
  const role = str(form, "role") === "admin" ? "admin" : "user";
  if (userId === admin.id && role !== "admin") redirect(`/admin/students/${userId}/?error=self`);
  await getAuth().api.setRole({ body: { userId, role }, headers: await headers() });
  revalidatePath(`/admin/students/${userId}/`);
  redirect(`/admin/students/${userId}/?saved=role`);
}

export async function setPassword(form: FormData) {
  await requireAdmin();
  const userId = str(form, "userId");
  const newPassword = str(form, "password", 200);
  if (newPassword.length < 8) redirect(`/admin/students/${userId}/?error=password`);
  await getAuth().api.setUserPassword({ body: { userId, newPassword }, headers: await headers() });
  redirect(`/admin/students/${userId}/?saved=password`);
}

export async function setBanned(form: FormData) {
  const admin = await requireAdmin();
  const userId = str(form, "userId");
  if (userId === admin.id) redirect(`/admin/students/${userId}/?error=self`);
  if (bool(form, "ban")) {
    await getAuth().api.banUser({ body: { userId, banReason: str(form, "reason", 300) || undefined }, headers: await headers() });
  } else {
    await getAuth().api.unbanUser({ body: { userId }, headers: await headers() });
  }
  redirect(`/admin/students/${userId}/?saved=access`);
}

export async function adminEnrol(form: FormData) {
  await requireAdmin();
  const userId = str(form, "userId");
  const courseId = int(form, "courseId");
  await q(`INSERT INTO lms_enrolment (user_id, course_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [userId, courseId]);
  redirect(`/admin/students/${userId}/?saved=enrolled`);
}

export async function removeEnrolment(form: FormData) {
  await requireAdmin();
  const userId = str(form, "userId");
  const courseId = int(form, "courseId");
  const reset = bool(form, "reset");
  await tx(async (run) => {
    await run(`DELETE FROM lms_enrolment WHERE user_id=$1 AND course_id=$2`, [userId, courseId]);
    if (reset) {
      await run(`DELETE FROM lms_lesson_progress WHERE user_id=$1 AND lesson_id IN (SELECT l.id FROM lms_lesson l JOIN lms_module m ON m.id=l.module_id WHERE m.course_id=$2)`, [userId, courseId]);
      await run(`DELETE FROM lms_submission WHERE user_id=$1 AND lesson_id IN (SELECT l.id FROM lms_lesson l JOIN lms_module m ON m.id=l.module_id WHERE m.course_id=$2)`, [userId, courseId]);
      await run(`DELETE FROM lms_attempt WHERE user_id=$1 AND assessment_id IN (SELECT id FROM lms_assessment WHERE course_id=$2)`, [userId, courseId]);
    }
  });
  redirect(`/admin/students/${userId}/?saved=removed`);
}

/* ───────────── assignment reviews ───────────── */

export async function reviewSubmission(form: FormData) {
  const admin = await requireAdmin();
  const id = int(form, "id");
  const decision = str(form, "decision") === "approved" ? "approved" : "revise";
  const feedback = str(form, "feedback", 3000);
  if (decision === "revise" && !feedback) redirect(`/admin/submissions/?error=feedback&open=${id}#s${id}`);
  const s = await one<{ user_id: string; lesson_id: number; course_id: number }>(
    `UPDATE lms_submission s SET status=$2, feedback=$3, reviewed_at=now(), reviewed_by=$4 FROM lms_lesson l JOIN lms_module m ON m.id=l.module_id
     WHERE s.id=$1 AND l.id=s.lesson_id RETURNING s.user_id, s.lesson_id, m.course_id`,
    [id, decision, feedback, admin.name],
  );
  if (s) {
    if (decision === "approved") {
      await q(`INSERT INTO lms_lesson_progress (user_id, lesson_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [s.user_id, s.lesson_id]);
      await checkCompletion(s.user_id, s.course_id);
    } else {
      await q(`DELETE FROM lms_lesson_progress WHERE user_id=$1 AND lesson_id=$2`, [s.user_id, s.lesson_id]);
    }
  }
  revalidatePath("/admin/submissions/");
  redirect(`/admin/submissions/?saved=1`);
}

/* ───────────── certificates ───────────── */

export async function setCertificateRevoked(form: FormData) {
  await requireAdmin();
  const id = int(form, "id");
  const revoke = bool(form, "revoke");
  await q(`UPDATE lms_certificate SET revoked=$2, revoked_reason=$3 WHERE id=$1`, [id, revoke, revoke ? str(form, "reason", 300) : ""]);
  revalidatePath("/admin/certificates/");
  redirect(`/admin/certificates/?saved=1`);
}

export async function correctCertificateName(form: FormData) {
  await requireAdmin();
  const name = str(form, "name", 80).replace(/\s+/g, " ");
  if (name.length < 2) redirect(`/admin/certificates/?error=name`);
  await q(`UPDATE lms_certificate SET learner_name=$2 WHERE id=$1`, [int(form, "id"), name]);
  redirect(`/admin/certificates/?saved=1`);
}

/** Issue a certificate by hand, for a learner who completed the course in a class rather than online. */
export async function issueCertificate(form: FormData) {
  await requireAdmin();
  const userId = str(form, "userId");
  const courseId = int(form, "courseId");
  const u = await one<{ name: string }>(`SELECT name FROM "user" WHERE id=$1`, [userId]);
  const c = await one<{ title: string }>(`SELECT title FROM lms_course WHERE id=$1`, [courseId]);
  if (!u || !c) redirect(`/admin/students/${userId}/?error=issue`);
  await q(`INSERT INTO lms_enrolment (user_id, course_id, completed_at) VALUES ($1,$2,now()) ON CONFLICT (user_id, course_id) DO UPDATE SET completed_at = coalesce(lms_enrolment.completed_at, now())`, [userId, courseId]);
  await q(
    `INSERT INTO lms_certificate (code, user_id, course_id, learner_name, course_title) VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (user_id, course_id) DO UPDATE SET revoked=false, revoked_reason=''`,
    [newCertificateCode(), userId, courseId, u.name, c.title],
  );
  redirect(`/admin/students/${userId}/?saved=issued`);
}
