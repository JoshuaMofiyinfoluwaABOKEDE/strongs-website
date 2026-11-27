import type { Metadata } from "next";
import Link from "next/link";
import { NotConnected } from "@/components/learn/NotConnected";
import { hasDatabase, one } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { signOut } from "@/app/account-actions";
import { updateProfile } from "@/app/profile/actions";
import { User } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Profile", robots: { index: false } };

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  if (!hasDatabase) return <NotConnected />;
  const { saved, error } = await searchParams;
  const user = await requireUser("/profile/");
  const me = await one<{ name: string; email: string }>(`SELECT name, email FROM "user" WHERE id = $1`, [user.id]);
  const p = await one<{ location: string; languages: string; about: string; phone: string; share_phone: boolean }>(
    `SELECT location, languages, about, phone, share_phone FROM lms_profile WHERE user_id = $1`,
    [user.id],
  );
  const certs = await one<{ n: number }>(`SELECT count(*)::int AS n FROM lms_certificate WHERE user_id = $1`, [user.id]).catch(() => null);

  return (
    <div className="edx bg-mist">
      <section className="bg-navy text-white">
        <div className="container-site flex items-center gap-4 py-[clamp(1.75rem,4vw,3rem)]">
          <span className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-white text-navy"><User size={34} /></span>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="eyebrow-dark">Profile</p>
            <h1 className="text-[clamp(1.375rem,4vw,2.2rem)] font-bold leading-tight">{me?.name ?? user.name}</h1>
            <p className="truncate text-sm text-pale">{me?.email ?? user.email}</p>
          </div>
        </div>
      </section>

      <section className="container-site grid items-start gap-6 py-6 sm:py-10 lg:grid-cols-[1fr_20rem]">
        <form action={updateProfile} className="flex flex-col gap-5 rounded-3xl border border-line bg-white p-5 sm:p-7">
          {saved && <p role="status" className="rounded-xl bg-mist p-3 text-sm text-royal">Saved.</p>}
          {error === "name" && <p role="alert" className="text-sm text-[#8a1c1c]">Please enter your full name.</p>}
          {error === "phone" && <p role="alert" className="text-sm text-[#8a1c1c]">Please enter a valid phone number, for example +234 813 789 0055.</p>}

          <label className="flex flex-col gap-1.5">
            <span className="font-semibold text-navy">Full name</span>
            <input name="name" defaultValue={me?.name ?? user.name} required minLength={2} maxLength={80} className="field" />
            <span className="text-xs text-muted">This name is printed on your certificates.</span>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-semibold text-navy">Location</span>
            <input name="location" defaultValue={p?.location ?? ""} maxLength={80} className="field" placeholder="e.g. Ogbomoso, Oyo State" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-semibold text-navy">Languages you speak</span>
            <input name="languages" defaultValue={p?.languages ?? ""} maxLength={80} className="field" placeholder="e.g. English, Yoruba" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-semibold text-navy">About me</span>
            <textarea name="about" defaultValue={p?.about ?? ""} maxLength={500} rows={4} className="field" placeholder="A few words for your classmates" />
          </label>
          <fieldset className="flex flex-col gap-2 rounded-2xl bg-mist p-4">
            <legend className="sr-only">Phone number</legend>
            <label className="flex flex-col gap-1.5">
              <span className="font-semibold text-navy">Phone or WhatsApp number</span>
              <input name="phone" type="tel" defaultValue={p?.phone ?? ""} maxLength={24} className="field" placeholder="+234 ..." />
            </label>
            <label className="flex items-start gap-2.5 text-sm">
              <input type="checkbox" name="share_phone" defaultChecked={p?.share_phone ?? false} className="mt-1 h-4 w-4" />
              <span>Show my number to people taking the same courses, so they can call or WhatsApp me. If you are under 18, please leave this off.</span>
            </label>
          </fieldset>
          <p className="text-xs text-muted">Your profile is visible only to people in the same courses as you. Your email address is never shown.</p>
          <button type="submit" className="btn btn-navy cursor-pointer self-start border-0 font-[inherit]">Save profile</button>
        </form>

        <aside className="flex flex-col gap-3 rounded-3xl border border-line bg-white p-5">
          <Link href="/dashboard/" className="flex min-h-11 items-center justify-between font-semibold no-underline">My learning <span aria-hidden="true">→</span></Link>
          <Link href="/dashboard/#certificates" className="flex min-h-11 items-center justify-between font-semibold no-underline">My certificates{certs?.n ? ` (${certs.n})` : ""} <span aria-hidden="true">→</span></Link>
          <Link href="/certificates/verify/" className="flex min-h-11 items-center justify-between font-semibold no-underline">Verify a certificate <span aria-hidden="true">→</span></Link>
          {user.role === "admin" && <Link href="/admin/" className="flex min-h-11 items-center justify-between font-semibold no-underline">Admin <span aria-hidden="true">→</span></Link>}
          {(user.role === "instructor" || user.role === "admin") && <Link href="/instructor/" className="flex min-h-11 items-center justify-between font-semibold no-underline">Grading <span aria-hidden="true">→</span></Link>}
          <form action={signOut} className="border-t border-line pt-3">
            <button type="submit" className="min-h-11 cursor-pointer border-0 bg-transparent p-0 font-[inherit] font-semibold text-[#8a1c1c] hover:underline">Sign out</button>
          </form>
        </aside>
      </section>
    </div>
  );
}
