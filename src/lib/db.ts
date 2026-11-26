import "server-only";
import { Pool, type QueryResultRow } from "pg";

/**
 * One connection pool per server instance. The connection string comes from the
 * Neon database connected to the project in Vercel (DATABASE_URL), or from
 * POSTGRES_URL if that is the name Vercel used.
 */
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

export const hasDatabase = connectionString.length > 0;

const globalForPool = globalThis as unknown as { strongsPool?: Pool };

export function pool(): Pool {
  if (!hasDatabase) throw new Error("The courses database is not connected yet (DATABASE_URL is missing).");
  if (!globalForPool.strongsPool) {
    const local = /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString);
    globalForPool.strongsPool = new Pool({
      connectionString,
      max: 5,
      ssl: local ? undefined : { rejectUnauthorized: false },
    });
  }
  return globalForPool.strongsPool;
}

/** Run a query and return its rows. Always pass values as parameters ($1, $2…), never in the text. */
export async function q<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T[]> {
  const res = await pool().query<T>(text, params);
  return res.rows;
}

export async function one<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await q<T>(text, params);
  return rows[0] ?? null;
}

/** Run several statements in one transaction. */
export async function tx<T>(fn: (run: typeof q) => Promise<T>): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    const run = (async (text: string, params: unknown[] = []) => (await client.query(text, params)).rows) as typeof q;
    const out = await fn(run);
    await client.query("COMMIT");
    return out;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
