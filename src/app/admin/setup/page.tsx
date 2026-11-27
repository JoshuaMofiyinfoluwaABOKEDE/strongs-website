import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NotConnected } from "@/components/learn/NotConnected";
import { hasDatabase } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { claimAdmin } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Admin access", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function SetupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!hasDatabase) return <NotConnected />;
  const user = await requireUser("/admin/setup/");
  if (user.role === "admin") redirect("/admin/");
  const { error } = await searchParams;
  const ready = (process.env.ADMIN_SETUP_KEY || "").length >= 8;
  return (
    <>
      <section className="bg-mist">
        <div className="container-site flex max-w-2xl flex-col gap-5 py-[clamp(3rem,7vw,5rem)]">
          <p className="eyebrow">Courses admin</p>
          <h1 className="h2 text-navy">Admin access</h1>
          <p className="lead text-muted">
            This area is for STRONGS administrators. You are signed in as <strong>{user.email}</strong>, which does not have admin access.
          </p>
          <p className="text-muted">
            An existing administrator can give you access from <em>Students</em> in the admin area. To set up the very first administrator,
            sign in with the STRONGS admin email and enter the setup key saved in Vercel.
          </p>
          {ready ? (
            <form action={claimAdmin} className="flex flex-wrap items-end gap-3">
              <label className="label">
                Setup key
                <input name="key" type="password" required autoComplete="off" className="field w-72" />
              </label>
              <button type="submit" className="btn btn-navy cursor-pointer border-0 font-[inherit]">Unlock admin</button>
            </form>
          ) : (
            <p className="rounded-xl bg-white px-4 py-3 text-sm text-muted">No setup key has been saved in Vercel yet (ADMIN_SETUP_KEY).</p>
          )}
          {error && <p role="alert" className="text-sm text-[#8a1c1c]">That did not work. Check the key, and that you are signed in with the admin email.</p>}
          <Link href="/dashboard/">Back to My learning</Link>
        </div>
      </section>
    </>
  );
}
