import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { crusadePages } from "@/content/crusades";
import { site } from "@/content/site";
import { PhotoSlot, Portrait, SectionHeading } from "@/components/ui";
import { StrongsForm } from "@/components/Form";
import { Calendar, People, Pin } from "@/components/icons";

export function generateStaticParams() {
  return crusadePages.map((c) => ({ slug: c.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = crusadePages.find((p) => p.slug === slug);
  return c ? { title: `${c.title} · Crusade`, description: `${c.dates}, ${c.venue}. ${c.summary}` } : {};
}

export default async function CrusadePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = crusadePages.find((p) => p.slug === slug);
  if (!c) notFound();

  return (
    <>
      <section aria-labelledby="c-title" className="bg-navy text-white">
        <div className="container-site flex flex-col gap-7 pb-[clamp(3.5rem,8vw,6rem)] pt-[clamp(2.5rem,5vw,4rem)]">
          <nav aria-label="Breadcrumb" className="text-sm text-pale">
            <Link href="/crusades/" className="text-pale hover:text-white">STRONGS Crusades</Link>
            <span aria-hidden="true"> › </span>
            {c.title}
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-10">
            <div className="flex min-w-0 flex-[1_1_34rem] flex-col gap-4">
              <p className="self-start rounded-full bg-gold px-3.5 py-1 text-xs font-bold uppercase tracking-[0.15em] text-navy">Gospel crusade</p>
              <h1 id="c-title" className="text-[clamp(3rem,7vw,6rem)] font-extrabold leading-[0.98] tracking-[-0.04em]">{c.title}</h1>
              {c.localTitle && <p className="text-[clamp(1.1rem,1.8vw,1.4rem)] font-semibold">{c.localTitle}</p>}
              <p className="text-[clamp(1.1rem,1.8vw,1.4rem)] font-medium italic text-gold">{c.themeScripture}</p>
            </div>
            <div className="flex flex-[0_1_24rem] flex-col gap-3 text-[1.0625rem] font-medium">
              <p className="flex items-center gap-3"><span className="text-gold"><Calendar size={22} /></span>{c.dates}</p>
              <p className="flex items-start gap-3"><span className="mt-0.5 text-gold"><Pin size={22} /></span>{c.venue}</p>
              <p className="flex items-center gap-3"><span className="text-gold"><People size={22} /></span>Organised by STRONGS Crusades{c.coHost ? ` with ${c.coHost}` : ""}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3.5">
            <a href="#register" className="btn btn-gold">Register to attend</a>
            <Link href="/crusades/#volunteer" className="btn btn-line-light">Volunteer</Link>
            <Link href="/crusades/#support" className="btn btn-line-light">Support this crusade</Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="about-c" className="bg-white">
        <div className="container-site grid items-start gap-12 pb-[clamp(3rem,6vw,4.5rem)] pt-[clamp(4rem,8vw,6.5rem)] lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <SectionHeading id="about-c" eyebrow="About the crusade" title="Lifting up Christ" intro={c.summary} />
            <p className="font-semibold text-royal">Pray for the town. Pray that many will be saved.</p>
            {c.flyers && (
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                {c.flyers.map((f) => (
                  <a key={f.src} href={f.src} target="_blank" rel="noopener">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.src} alt={f.alt} loading="lazy" className="w-full rounded-2xl border border-line" />
                  </a>
                ))}
              </div>
            )}
          </div>
          <ul className="flex flex-col border-t border-line">
            {c.components.map((x) => (
              <li key={x.title} className="border-b border-line py-3.5">
                <strong className="font-semibold text-navy">{x.title}</strong>
                <span className="block text-[0.9375rem] text-muted">{x.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="sched-title" className="bg-mist">
        <div className="container-site section-pad flex flex-col gap-7">
          <SectionHeading id="sched-title" eyebrow="Programme" title="Programme schedule" />
          <div className="overflow-x-auto rounded-3xl bg-white">
            <table className="w-full min-w-[45rem] border-collapse text-left text-[0.9375rem]">
              <thead>
                <tr className="bg-navy text-white">
                  {["Day", "Morning", "Afternoon", "Evening"].map((h) => <th key={h} scope="col" className="px-5 py-4 font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {c.schedule.map((s) => (
                  <tr key={s.day} className="border-b border-line last:border-0">
                    <th scope="row" className="px-5 py-4 font-semibold text-navy">{s.day}</th>
                    <td className="px-5 py-4 text-muted">{s.morning}</td>
                    <td className="px-5 py-4 text-muted">{s.afternoon}</td>
                    <td className="px-5 py-4 text-muted">{s.evening}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section aria-labelledby="min-title" className="bg-white">
        <div className="container-site section-pad flex flex-col gap-7">
          <SectionHeading id="min-title" eyebrow="Ministering" title="Ministers" />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {c.ministers.map((m, i) => (
              <li key={i} className="flex flex-col gap-2 rounded-3xl border border-line p-7">
                <div className="mb-1"><Portrait photo={m.photo} alt={`Portrait of ${m.name}`} /></div>
                <h3 className="text-lg font-semibold leading-snug text-navy">{m.name}</h3>
                <p className="text-[0.9375rem] text-muted">{m.role}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="register" aria-labelledby="reg-title" className="bg-navy text-white">
        <div className="container-site section-pad grid items-start gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div className="flex flex-col gap-4">
            <SectionHeading dark id="reg-title" eyebrow="Registration" title="Come to the crusade" intro="Register to attend or to serve, and we'll send you venue details and prayer points." />
            <p className="text-[0.9375rem] text-pale">
              Questions? <a href={`mailto:${site.email}?subject=${encodeURIComponent(c.title)}`} className="font-semibold text-white">{site.email}</a> ·{" "}
              <a href={site.phoneHref} className="font-semibold text-white">{site.phone}</a>
            </p>
          </div>
          <div className="rounded-3xl bg-white p-[clamp(1.75rem,3.5vw,2.5rem)] text-ink">
            <StrongsForm
              formName={`crusade-registration-${c.slug}`}
              labelledBy="reg-title"
              submitLabel="Register"
              fields={[
                { name: "name", label: "Full name", type: "text", required: true },
                { name: "phone", label: "Phone number", type: "tel", required: true, placeholder: "080..." },
                { name: "email", label: "Email (optional)", type: "email" },
                { name: "coming_as", label: "I'm coming", type: "select", options: ["To attend", "As a student", "As a minister or worker", "To serve on the crusade team"] },
              ]}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="after-title" className="bg-white">
        <div className="container-site section-pad flex flex-col gap-6">
          <SectionHeading id="after-title" eyebrow="Photographs and report" title="After the crusade" intro={c.afterwards} />
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            {["Crusade photo", "Crusade photo", "Crusade photo", "Crusade report (PDF)"].map((l, i) => (
              <PhotoSlot key={i} label={l} note="After the crusade" className="h-44 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
