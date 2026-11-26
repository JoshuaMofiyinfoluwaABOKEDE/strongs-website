import "server-only";
import { getMigrations } from "better-auth/db/migration";
import { authOptions } from "@/lib/auth";
import { hasDatabase, pool, q } from "@/lib/db";
import { migrations } from "@/lib/schema";
import { courseCategories, courses } from "@/content/courses";
import { theologyOrder } from "@/content/theology/catalog";
import { theologyCourses } from "@/content/theology/courses";
import { createHash } from "node:crypto";

const globalForSetup = globalThis as unknown as { strongsReady?: Promise<void> };

/**
 * Makes sure the database has every table and the starting catalogue.
 * Runs once per server instance; afterwards it costs nothing.
 */
export function ensureReady(): Promise<void> {
  if (!hasDatabase) return Promise.reject(new Error("The courses database is not connected yet."));
  if (!globalForSetup.strongsReady) {
    globalForSetup.strongsReady = setup().then(syncTheology).catch((e) => {
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
  }));
  const checksum = createHash("sha1").update(JSON.stringify(rows)).digest("hex");
  const seen = (await q<{ value: string }>(`SELECT value FROM lms_meta WHERE key = 'theology'`))[0]?.value;
  if (seen === checksum) return;
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO lms_category (id, name, blurb, position) VALUES ('theology', 'School of Theology', 'Self-paced theology courses with assessments and certificates.', 99) ON CONFLICT (id) DO NOTHING`,
    );
    for (const r of rows) {
      await client.query(
        `INSERT INTO lms_course (slug, title, category_id, school, level, weeks, effort, format, summary, about, objectives, outcomes, listed, enrolment_open, position)
         VALUES ($1,$2,'theology','theology',$3,$4,'3–4 hours a week','Online, self-paced',$5,$6,$7,$8,false,true,$9)
         ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, school='theology', category_id='theology', level=EXCLUDED.level, weeks=EXCLUDED.weeks,
           summary=EXCLUDED.summary, about=EXCLUDED.about, objectives=EXCLUDED.objectives, outcomes=EXCLUDED.outcomes, position=EXCLUDED.position,
           listed=false, enrolment_open=true, updated_at=now()`,
        [r.slug, r.title, r.level, r.weeks, r.summary, r.about, JSON.stringify(r.objectives), JSON.stringify(r.outcomes), r.position],
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
