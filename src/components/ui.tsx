import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Camera, Play } from "@/components/icons";

/** Section heading: small gold/blue label, big title, optional intro. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  id,
  dark = false,
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  id?: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex max-w-3xl flex-col gap-3.5 ${className}`}>
      {eyebrow && <p className={dark ? "eyebrow-dark" : "eyebrow"}>{eyebrow}</p>}
      <h2 id={id} className={`h2 ${dark ? "text-white" : "text-navy"}`}>
        {title}
      </h2>
      {intro && <p className={`lead ${dark ? "text-pale" : "text-muted"}`}>{intro}</p>}
    </div>
  );
}

/**
 * A clean branded picture, used wherever a real photo or video has not been supplied yet.
 * Navy with a gold sunrise, an icon and a label.
 */
export function PhotoSlot({
  label,
  dark = false,
  video = false,
  note,
  className = "",
}: {
  label: string;
  dark?: boolean;
  video?: boolean;
  note?: string;
  className?: string;
}) {
  return (
    <figure
      className={`clean-slot relative isolate flex flex-col items-center justify-center gap-2.5 overflow-hidden rounded-3xl p-6 text-center text-white ${
        dark ? "clean-slot-dark" : ""
      } ${className}`}
    >
      <span className="relative z-10 grid h-14 w-14 place-items-center rounded-full border border-gold/60 bg-navy/60 text-gold">
        {video ? <Play size={26} /> : <Camera size={26} />}
      </span>
      <figcaption className="relative z-10 flex max-w-xs flex-col gap-0.5">
        <span className="font-semibold leading-snug">{label}</span>
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-gold-light">{note ?? (video ? "Videos coming soon" : "Photos coming soon")}</span>
      </figcaption>
    </figure>
  );
}

/** A real photograph or flyer. Images live in /public/images. */
export function Photo({
  src,
  alt,
  caption,
  className = "",
  imgClassName = "",
  fit = "cover",
  dark = false,
}: {
  src: string;
  alt: string;
  caption?: ReactNode;
  className?: string;
  imgClassName?: string;
  fit?: "cover" | "contain";
  dark?: boolean;
}) {
  return (
    <figure className={`flex flex-col gap-2.5 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`w-full rounded-3xl ${fit === "cover" ? "object-cover" : `object-contain ${dark ? "bg-navy-2" : "bg-mist"}`} ${imgClassName}`}
      />
      {caption && <figcaption className={`text-sm ${dark ? "text-pale" : "text-muted"}`}>{caption}</figcaption>}
    </figure>
  );
}

/** Round portrait space: a photo if we have one, otherwise initials or a "Photo" label. */
export function Portrait({ initials, size = "md", photo, alt = "" }: { initials?: string; size?: "md" | "lg"; photo?: string; alt?: string }) {
  const dim = size === "lg" ? "h-28 w-28 text-3xl" : "h-24 w-24 text-2xl";
  if (photo)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photo} alt={alt} loading="lazy" className={`${dim} rounded-full bg-navy object-cover object-top`} />
    );
  return initials ? (
    <div className={`${dim} flex items-center justify-center rounded-full bg-navy font-bold text-gold`} aria-hidden="true">
      {initials}
    </div>
  ) : (
    <div
      className={`${dim} flex items-center justify-center rounded-full border-[1.5px] border-dashed border-steel bg-white text-xs text-muted`}
      aria-hidden="true"
    >
      Photo
    </div>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex min-h-11 items-center gap-2 font-semibold no-underline">
      {children} <ArrowRight size={18} />
    </Link>
  );
}

/** Page hero used on inner pages. */
export function PageHero({
  eyebrow,
  title,
  intro,
  children,
  breadcrumb,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  breadcrumb?: { href: string; label: string }[];
}) {
  return (
    <section className="bg-navy text-white">
      <div className="container-site flex flex-col gap-6 py-[clamp(3.5rem,7vw,6rem)]">
        {breadcrumb && (
          <nav aria-label="Breadcrumb" className="text-sm text-pale">
            {breadcrumb.map((b, i) => (
              <span key={b.href}>
                <Link href={b.href} className="text-pale hover:text-white">
                  {b.label}
                </Link>
                {i < breadcrumb.length - 1 && <span aria-hidden="true"> › </span>}
              </span>
            ))}
          </nav>
        )}
        <p className="eyebrow-dark">{eyebrow}</p>
        <h1 className="max-w-4xl text-[clamp(2.5rem,5.2vw,4.25rem)] font-bold leading-[1.08] tracking-[-0.02em]">{title}</h1>
        {intro && <p className="lead max-w-3xl text-pale">{intro}</p>}
        {children}
      </div>
    </section>
  );
}

/** Scripture band. Bible verses are quoted from the KJV. */
export function Scripture({ text, reference, dark = false }: { text: string; reference: string; dark?: boolean }) {
  return (
    <section aria-label="Scripture" className={dark ? "bg-navy text-white" : "bg-mist"}>
      <div className="container-site flex flex-col items-center gap-5 py-[clamp(3.5rem,7vw,6rem)] text-center">
        <blockquote className={`max-w-4xl text-[clamp(1.5rem,2.9vw,2.25rem)] font-medium italic leading-snug ${dark ? "" : "text-navy"}`}>
          “{text}”
        </blockquote>
        <div className="h-[3px] w-16 bg-gold" />
        <p className={`font-semibold ${dark ? "text-gold" : "text-royal"}`}>{reference} · KJV</p>
      </div>
    </section>
  );
}
