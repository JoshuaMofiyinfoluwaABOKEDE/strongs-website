import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/learn/AuthForm";
import { NotConnected } from "@/components/learn/NotConnected";
import { hasDatabase } from "@/lib/db";
import { getUser } from "@/lib/session";

export const metadata: Metadata = { title: "Create your free account", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/dashboard/" } = await searchParams;
  if (!hasDatabase) return <NotConnected />;
  if (await getUser()) redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard/");
  return (
    <section className="bg-mist">
      <div className="container-site grid gap-12 py-[clamp(3rem,7vw,5.5rem)] lg:grid-cols-[1fr_28rem] lg:items-center">
        <div className="flex flex-col gap-5">
          <p className="eyebrow">STRONGS Courses</p>
          <h1 className="text-[clamp(1.848rem,3.404vw,2.516rem)] font-bold leading-[1.08] tracking-[-0.02em] text-navy">Create your free account</h1>
          <p className="lead max-w-xl text-muted">
            Study at your own pace, track your progress, and earn a certificate from STRONGS when you finish a course. Every course is free.
          </p>
        </div>
        <div className="rounded-3xl bg-white p-[clamp(1.5rem,4vw,2.5rem)] shadow-[0_0_0_1px_var(--color-line)]">
          <AuthForm mode="sign-up" next={next} />
        </div>
      </div>
    </section>
  );
}
