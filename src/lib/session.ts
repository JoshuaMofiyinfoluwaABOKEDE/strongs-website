import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { hasDatabase, one } from "@/lib/db";
import { ensureReady } from "@/lib/setup";

export type SessionUser = { id: string; name: string; email: string; role: string };

/** The signed-in learner, or null. */
export const getUser = cache(async function getUser(): Promise<SessionUser | null> {
  if (!hasDatabase) return null;
  await ensureReady();
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return null;
  // Role, name and blocked status are read fresh, so changes made by an admin apply at once.
  const u = await one<{ id: string; name: string; email: string; role: string | null; banned: boolean | null }>(
    `SELECT id, name, email, role, banned FROM "user" WHERE id = $1`,
    [session.user.id],
  );
  if (!u || u.banned) return null;
  return { id: u.id, name: u.name, email: u.email, role: u.role ?? "user" };
});

export async function requireUser(next = "/dashboard/"): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect(`/sign-in/?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser("/admin/");
  if (user.role !== "admin") redirect("/admin/setup/");
  return user;
}

export const isAdmin = (u: SessionUser | null) => u?.role === "admin";
