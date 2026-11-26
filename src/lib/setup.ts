import "server-only";
import { getMigrations } from "better-auth/db/migration";
import { authOptions } from "@/lib/auth";
import { hasDatabase, pool, q } from "@/lib/db";
import { migrations } from "@/lib/schema";
import { courseCategories, courses } from "@/content/courses";
import { theologyOrder, theologySubject } from "@/content/theology/catalog";
import { theologyCourses } from "@/content/theology/courses";
import { shortCourses } from "@/content/short";
import type { ShortCourse, ShortQuestion } from "@/content/short/types";
import { createHash } from "node:crypto";

const globalForSetup = globalThis as unknown as { strongsReady?: Promise<void> };

/**
 * Makes sure the database has every table and the starting catalogue.
 * Runs once per server instance; afterwards it costs nothing.
 */
export function ensureReady(): Promise<void> {
  if (!hasDatabase) return Promise.reject(new Error("The courses database is not connected yet."));
  if (!globalForSetup.strongsReady) {
    globalForSetup.strongsReady = setup().then(syncTheology).then(syncShortCourses).catch((e) => {
      globalForSetup.strongsReady = undefined;
      throw e;
    });
  }
  return globalForSetup.strongsReady;
}

async function setup() {
  await q(`CREATE TABLE IF NOT EXISTS lms_migration (id INT PRIMARY KEY, name TEXT NOT NULL, run_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  const done = new Set((await q<{ id: number }>(`SELECT id FROM lms_migration`)).map((r) => r.id));
  const latest = Math.max(...migrations.map((m) => m.id));
  const authReady = (await q(`SELECT 1 FROM information_schema.tables WHERE table_name = 'user'`)).length > 0;
  if (authReady && done.has(latest)) return;

  const client = await pool().connect();
  try {
    // Only one server instance sets up at a time.
    await client.query(`SELECT pg_advisory_lock(424242)`);

    const { runMigrations } = await getMigrations(authOptions as Parameters<typeof getMigrations>[0]);
    await runMigrations();

    const again = new Set((await client.query<{ id: number }>(`SELECT id FROM lms_migration`)).rows.map((r) => r.id));
    for (const m of migrations) {
      if (again.has(m.id)) continue;
      await client.query("BEGIN");
      await client.query(m.sql);
      await client.query(`INSERT INTO lms_migration (id, name) VALUES ($1, $2)`, [m.id, m.name]);
      await client.query("COMMIT");
    }

    await seedCatalogue(client);
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    await client.query(`SELECT pg_advisory_unlock(424242)`).catch(() => {});
    client.release();
  }
}

/**
 * Copies the existing 8 subjects and 27 courses (with their module outlines) into the database,
 * the first time only. After that, courses are managed in the admin area.
 */
async function seedCatalogue(client: import("pg").PoolClient) {
  const { rows } = await client.query(`SELECT count(*)::int AS n FROM lms_course`);
  if (rows[0].n > 0) return;
  await client.query("BEGIN");
  for (const [i, c] of courseCategories.entries()) {
    await client.query(
      `INSERT INTO lms_category (id, name, blurb, position) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
      [c.id, c.name, c.blurb, i],
    );
  }
  for (const [i, c] of courses.entries()) {
    const { rows: ins } = await client.query<{ id: number }>(
      `INSERT INTO lms_course (slug, title, category_id, level, weeks, effort, format, summary, about, outcomes, audience, prerequisites, featured, position)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
      [c.slug, c.title, c.category, c.level, c.weeks, c.effort, "Online, self-paced", c.summary, c.about, JSON.stringify(c.outcomes), c.audience, c.prerequisites, !!c.featured, i],
    );
    for (const [j, m] of c.modules.entries()) {
      await client.query(`INSERT INTO lms_module (course_id, position, title, summary) VALUES ($1,$2,$3,$4)`, [ins[0].id, j, m.title, m.text]);
    }
  }
  await client.query("COMMIT");
}

/**
 * Keeps one row in lms_course for each School of Theology course file, so enrolment,
 * My learning and certificates work as for every other course. Course content itself is
 * read from the files. Runs only when the files have changed since the last sync.
 */
async function syncTheology() {
  await q(`CREATE TABLE IF NOT EXISTS lms_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`);
  const files = theologyOrder.map((o) => theologyCourses.find((c) => c.slug === o.slug)).filter((c) => !!c);
  const rows = files.map((c, i) => ({
    slug: c.slug,
    title: c.title,
    level: c.level,
    weeks: c.modules.length,
    summary: c.summary,
    about: c.description,
    objectives: c.objectives,
    outcomes: c.outcomes,
    position: 1000 + i,
    subject: theologySubject(c.slug),
  }));
  const checksum = createHash("sha1").update(JSON.stringify(rows)).digest("hex");
  const seen = (await q<{ value: string }>(`SELECT value FROM lms_meta WHERE key = 'theology'`))[0]?.value;
  if (seen === checksum) return;
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    // The School of Theology is listed by subject with the other courses (edX-style), so make sure its subjects exist.
    for (const id of ["theology", "living", "history"]) {
      const cat = courseCategories.find((x) => x.id === id)!;
      await client.query(
        `INSERT INTO lms_category (id, name, blurb, position) VALUES ($1, $2, $3, 50) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, blurb = EXCLUDED.blurb
         WHERE lms_category.name = 'School of Theology'`,
        [cat.id, cat.name, cat.blurb],
      );
    }
    for (const r of rows) {
      await client.query(
        `INSERT INTO lms_course (slug, title, category_id, school, level, weeks, effort, format, summary, about, objectives, outcomes, listed, enrolment_open, position)
         VALUES ($1,$2,$10,'theology',$3,$4,'3–4 hours a week','Online, self-paced',$5,$6,$7,$8,false,true,$9)
         ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, school='theology', category_id=EXCLUDED.category_id, level=EXCLUDED.level, weeks=EXCLUDED.weeks,
           summary=EXCLUDED.summary, about=EXCLUDED.about, objectives=EXCLUDED.objectives, outcomes=EXCLUDED.outcomes, position=EXCLUDED.position,
           listed=false, enrolment_open=true, updated_at=now()`,
        [r.slug, r.title, r.level, r.weeks, r.summary, r.about, JSON.stringify(r.objectives), JSON.stringify(r.outcomes), r.position, theologySubject(r.slug)],
      );
    }
    await client.query(
      `INSERT INTO lms_meta (key, value) VALUES ('theology', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [checksum],
    );
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

/* ───────────── STRONGS short courses written as content files ───────────── */

/** Same order every time, different per question, so the right answer is not always first. */
function shuffled(q: ShortQuestion) {
  const seed = createHash("sha1").update(q.q).digest();
  const idx = q.options.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = seed[i % seed.length] % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const letter = (n: number) => String.fromCharCode(97 + n);
  return { options: idx.map((i, n) => ({ id: letter(n), text: q.options[i] })), correct: [letter(idx.indexOf(q.answer))] };
}

const minutesFor = (body: string) => Math.max(8, Math.round(body.split(/\s+/).length / 120) + 6);

/**
 * Copies each course file into the database: modules, reading lessons, a quiz per module,
 * a practical assignment and a final assessment, then opens the course for enrolment.
 * A course that an admin has already started writing by hand is left alone. When a file
 * changes later, its lessons and questions are updated in place (learner progress is kept).
 */
async function syncShortCourses() {
  if (!shortCourses.length) return;
  const seen = new Map((await q<{ key: string; value: string }>(`SELECT key, value FROM lms_meta WHERE key LIKE 'short:%'`)).map((r) => [r.key.slice(6), r.value]));
  // Local tests build one course by hand in the admin area, so they can ask for it to be left alone.
  const skip = new Set((process.env.SHORT_COURSES_SKIP ?? "").split(",").filter(Boolean));
  for (const [i, c] of shortCourses.entries()) {
    if (skip.has(c.slug)) continue;
    const checksum = createHash("sha1").update(JSON.stringify(c)).digest("hex");
    if (seen.get(c.slug) === checksum) continue;
    const client = await pool().connect();
    try {
      await client.query("BEGIN");
      await syncOne(client, c, i, seen.has(c.slug));
      await client.query(`INSERT INTO lms_meta (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, [`short:${c.slug}`, checksum]);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK").catch(() => {});
      console.error(`Could not sync course ${c.slug}`, e);
    } finally {
      client.release();
    }
  }
}

async function syncOne(client: import("pg").PoolClient, c: ShortCourse, index: number, synced: boolean) {
  const about = c.about ? c.about + (c.reading?.length ? `\n\nFurther reading: ${c.reading.join("; ")}.` : "") : null;
  let row = (await client.query<{ id: number }>(`SELECT id FROM lms_course WHERE slug = $1`, [c.slug])).rows[0];
  if (!row) {
    if (!c.title || !c.category) throw new Error("a new course needs a title and category");
    row = (
      await client.query<{ id: number }>(
        `INSERT INTO lms_course (slug, title, category_id, level, weeks, effort, format, summary, about, objectives, outcomes, audience, prerequisites, featured, listed, enrolment_open, position)
         VALUES ($1,$2,$3,$4,$5,$6,'Online, self-paced',$7,$8,$9,$10,$11,$12,$13,true,true,$14) RETURNING id`,
        [c.slug, c.title, c.category, c.level ?? "All levels", c.modules.length, c.effort ?? "2–3 hours a week", c.summary ?? "", about ?? "", JSON.stringify(c.objectives), JSON.stringify(c.outcomes ?? []), c.audience ?? "", c.prerequisites ?? "", !!c.featured, 200 + index],
      )
    ).rows[0];
  } else if (!synced) {
    // One of the original courses: only fill it if nobody has started writing it in the admin area.
    const { rows } = await client.query<{ n: number }>(
      `SELECT (SELECT count(*) FROM lms_lesson l JOIN lms_module m ON m.id = l.module_id WHERE m.course_id = $1)::int + (SELECT count(*) FROM lms_assessment WHERE course_id = $1)::int AS n`,
      [row.id],
    );
    if (rows[0].n > 0) return;
    await client.query(`DELETE FROM lms_module WHERE course_id = $1`, [row.id]);
  }
  // Course details from the file (the original 27 keep their own unless the file gives them).
  await client.query(
    `UPDATE lms_course SET objectives = $2, weeks = $3, enrolment_open = true,
       title = COALESCE($4, title), category_id = COALESCE($5, category_id), level = COALESCE($6, level), summary = COALESCE($7, summary),
       about = COALESCE($8, about), outcomes = CASE WHEN $9::jsonb = '[]'::jsonb THEN outcomes ELSE $9::jsonb END, updated_at = now()
     WHERE id = $1`,
    [row.id, JSON.stringify(c.objectives), c.modules.length, c.title ?? null, c.category ?? null, c.level ?? null, c.summary ?? null, about, JSON.stringify(c.outcomes ?? [])],
  );

  const mods = (await client.query<{ id: number; position: number }>(`SELECT id, position FROM lms_module WHERE course_id = $1 ORDER BY position, id`, [row.id])).rows;
  for (const [mi, m] of c.modules.entries()) {
    let modId = mods[mi]?.id;
    if (modId) await client.query(`UPDATE lms_module SET title = $2, summary = $3, position = $4 WHERE id = $1`, [modId, m.title, m.summary, mi]);
    else modId = (await client.query<{ id: number }>(`INSERT INTO lms_module (course_id, position, title, summary) VALUES ($1,$2,$3,$4) RETURNING id`, [row.id, mi, m.title, m.summary])).rows[0].id;

    const lessons = [...m.lessons.map((l) => ({ ...l, kind: "reading" })), ...(mi === c.modules.length - 1 ? [{ title: c.assignment.title, body: c.assignment.body, scripture: "", kind: "assignment" }] : [])];
    const have = (await client.query<{ id: number }>(`SELECT id FROM lms_lesson WHERE module_id = $1 ORDER BY position, id`, [modId])).rows;
    for (const [li, l] of lessons.entries()) {
      const vals = [l.title, l.body, l.scripture ?? "", l.kind, minutesFor(l.body), li];
      if (have[li]) await client.query(`UPDATE lms_lesson SET title=$2, body=$3, scripture=$4, kind=$5, minutes=$6, position=$7, published=true, updated_at=now() WHERE id=$1`, [have[li].id, ...vals]);
      else await client.query(`INSERT INTO lms_lesson (module_id, title, body, scripture, kind, minutes, position, published) VALUES ($1,$2,$3,$4,$5,$6,$7,true)`, [modId, ...vals]);
    }
    await syncQuiz(client, row.id, modId, "quiz", `Module ${mi + 1} quiz: ${m.title}`, m.quiz, mi);
  }
  await syncQuiz(client, row.id, null, "final", "Final assessment", c.final, 99);
}

async function syncQuiz(client: import("pg").PoolClient, courseId: number, moduleId: number | null, kind: "quiz" | "final", title: string, questions: ShortQuestion[], position: number) {
  const instructions =
    kind === "final"
      ? "Questions on the whole course. You need 70% to pass, and you may try again."
      : "A short check on this module. You need 70% to pass, and you may try again. The next module opens when you pass.";
  let a = (
    await client.query<{ id: number }>(
      moduleId === null ? `SELECT id FROM lms_assessment WHERE course_id = $1 AND module_id IS NULL AND kind = 'final' LIMIT 1` : `SELECT id FROM lms_assessment WHERE course_id = $1 AND module_id = $2 LIMIT 1`,
      moduleId === null ? [courseId] : [courseId, moduleId],
    )
  ).rows[0];
  if (a) await client.query(`UPDATE lms_assessment SET title=$2, instructions=$3, published=true, position=$4 WHERE id=$1`, [a.id, title, instructions, position]);
  else
    a = (
      await client.query<{ id: number }>(
        `INSERT INTO lms_assessment (course_id, module_id, kind, title, instructions, pass_mark, published, position) VALUES ($1,$2,$3,$4,$5,70,true,$6) RETURNING id`,
        [courseId, moduleId, kind, title, instructions, position],
      )
    ).rows[0];
  const have = (await client.query<{ id: number }>(`SELECT id FROM lms_question WHERE assessment_id = $1 ORDER BY position, id`, [a.id])).rows;
  for (const [qi, qn] of questions.entries()) {
    const { options, correct } = shuffled(qn);
    const vals = [qn.q, JSON.stringify(options), JSON.stringify(correct), qn.why ?? "", qi];
    if (have[qi]) await client.query(`UPDATE lms_question SET prompt=$2, options=$3, correct=$4, explanation=$5, position=$6, kind='single' WHERE id=$1`, [have[qi].id, ...vals]);
    else await client.query(`INSERT INTO lms_question (assessment_id, prompt, options, correct, explanation, position, kind) VALUES ($1,$2,$3,$4,$5,$6,'single')`, [a.id, ...vals]);
  }
}
