import "server-only";
import { createHash } from "node:crypto";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";
import { hasDatabase, pool } from "@/lib/db";

/**
 * Sign-in for the courses platform. Learners register with a name, email and password.
 * Users, sessions and passwords are stored in the site's own database.
 *
 * BETTER_AUTH_SECRET signs the session cookies. If it has not been set in Vercel, a secret
 * derived from the (already secret) database connection string is used instead.
 */
const secret =
  process.env.BETTER_AUTH_SECRET ||
  createHash("sha256")
    .update(`strongs-courses:${process.env.DATABASE_URL || process.env.POSTGRES_URL || "local-development"}`)
    .digest("base64");

export const authOptions = {
  appName: "STRONGS Courses",
  secret,
  baseURL: process.env.BETTER_AUTH_URL || {
    allowedHosts: ["strongs-website.vercel.app", "*.vercel.app", "strongsimpact.org", "www.strongsimpact.org", "localhost:3000", "localhost:3100"],
    fallback: "https://strongs-website.vercel.app",
  },
  database: hasDatabase ? pool() : undefined,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  trustedOrigins: [
    "https://strongs-website.vercel.app",
    "https://*.vercel.app",
    "https://www.strongsimpact.org",
    "https://strongsimpact.org",
    "http://localhost:3000",
  ],
  plugins: [admin({ defaultRole: "user", adminRoles: ["admin"] }), nextCookies()],
};

function createAuth() {
  return betterAuth({ ...authOptions, plugins: [admin({ defaultRole: "user", adminRoles: ["admin"] }), nextCookies()] });
}

const globalForAuth = globalThis as unknown as { strongsAuth?: ReturnType<typeof createAuth> };

export function getAuth() {
  if (!globalForAuth.strongsAuth) globalForAuth.strongsAuth = createAuth();
  return globalForAuth.strongsAuth;
}
