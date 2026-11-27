import Link from "next/link";
import type { ReactNode } from "react";

export function AdminTitle({ title, intro, back, children }: { title: ReactNode; intro?: ReactNode; back?: { href: string; label: string }; children?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div className="flex flex-col gap-1.5">
        {back && <Link href={back.href} className="text-sm">← {back.label}</Link>}
        <h1 className="text-[clamp(1.44rem,2.46vw,1.804rem)] font-bold leading-tight text-navy">{title}</h1>
        {intro && <p className="max-w-3xl text-muted">{intro}</p>}
      </div>
      {children}
    </header>
  );
}

export function Notice({ kind = "ok", children }: { kind?: "ok" | "error"; children: ReactNode }) {
  return (
    <p role={kind === "error" ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-sm ${kind === "error" ? "bg-[#fdecec] text-[#8a1c1c]" : "bg-[#e7f1ea] text-[#1d5b33]"}`}>
      {children}
    </p>
  );
}

export function Card({ title, children, id, className = "" }: { title?: ReactNode; children: ReactNode; id?: string; className?: string }) {
  return (
    <section id={id} className={`flex scroll-mt-28 flex-col gap-4 rounded-2xl border border-line bg-white p-[clamp(1.1rem,2.5vw,1.6rem)] ${className}`}>
      {title && <h2 className="text-lg font-bold text-navy">{title}</h2>}
      {children}
    </section>
  );
}

export function Badge({ tone = "muted", children }: { tone?: "muted" | "ok" | "warn" | "gold" | "navy"; children: ReactNode }) {
  const c = {
    muted: "bg-mist text-muted",
    ok: "bg-[#e7f1ea] text-[#1d5b33]",
    warn: "bg-[#fdecec] text-[#8a1c1c]",
    gold: "bg-[#fbf5e6] text-[#7a5a12]",
    navy: "bg-navy text-white",
  }[tone];
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${c}`}>{children}</span>;
}

export const btnSm = "inline-flex min-h-9 cursor-pointer items-center justify-center rounded-lg border-0 px-3.5 text-sm font-semibold font-[inherit] no-underline";
export const btnPrimary = `${btnSm} bg-navy text-white hover:bg-royal hover:text-white`;
export const btnGhost = `${btnSm} border border-steel bg-white text-navy hover:border-royal hover:text-royal`;
export const btnDanger = `${btnSm} bg-[#8a1c1c] text-white hover:bg-[#6d1414]`;

export const date = (d: string | Date | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "–");
