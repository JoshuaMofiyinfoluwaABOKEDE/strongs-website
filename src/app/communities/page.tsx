import type { Metadata } from "next";
import Link from "next/link";
import { communities, communityBenefits, rhythm } from "@/content/communities";
import { events } from "@/content/events";
import { SectionHeading } from "@/components/ui";
import { StrongsForm } from "@/components/Form";
import { Shield } from "@/components/icons";

export const metadata: Metadata = {
  title: "STRONGS Communities",
  description:
    "Interest-based communities for writers, musicians, teenagers, intellectuals, creatives, speakers, young professionals and readers.",
};

export default function CommunitiesPage() {
  const symposiums = events.filter((e) => e.kind === "Symposium" && e.image).sort((a, b) => a.sortDate.localeCompare(b.sortDate));
  return (
    <>
      <section aria-labelledby="comm-title" className="bg-navy text-white">
        <div className="container-site grid items-center gap-14 py-[clamp(3.5rem,8vw,6.5rem)] lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col gap-6">
            <p className="eyebrow-dark">STRONGS Communities</p>
            <h1 id="comm-title" className="text-[clamp(2.4rem,4.8vw,3.9rem)] font-bold leading-[1.08] tracking-[-0.02em]">
              Connecting people. Developing potential. <span className="text-gold">Building purposeful communities.</span>
            </h1>
            <p className="lead max-w-2xl text-pale">
              A network of communities where people who share a gift, a skill or a calling meet, learn from experienced hands, grow together and put their gifts to work for the advancement of God&apos;s Kingdom and society.
            </p>
            <div className="flex flex-wrap gap-3.5">
              <a href="#join" className="btn btn-gold">Join a community</a>
              <a href="#communities" className="btn btn-line-light">See the eight communities</a>
            </div>
          </div>
          <div className="flex flex-col gap-3.5 rounded-3xl bg-navy-2 p-8">
            <p className="eyebrow-dark text-xs">Where STRONGS began</p>
            <p className="text-lg font-medium leading-relaxed">
              STRONGS started with symposiums for writers, musicians and teenagers. Those gatherings now grow into communities with a rhythm of their own.
            </p>
            <p className="text-[0.9375rem] text-pale">Open to everyone: the person just discovering an interest sits alongside the one with years of experience.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="why-title" className="bg-white">
        <div className="container-site section-pad flex flex-col gap-9">
          <SectionHeading id="why-title" eyebrow="Why join" title="Every gift has a place in the Kingdom" />
          <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
            {communityBenefits.map((b) => <li key={b} className="border-t border-line py-4 font-medium text-navy">{b}</li>)}
          </ul>
        </div>
      </section>

      <section id="communities" aria-labelledby="eight-title" className="bg-mist">
        <div className="container-site section-pad flex flex-col gap-9">
          <SectionHeading id="eight-title" eyebrow="The communities" title="Eight communities, one purpose" intro="Communities open in stages, not all at once. Register your interest and we will tell you when yours begins." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {communities.map((c) => (
              <details key={c.name} className="group flex flex-col gap-3 rounded-3xl border border-line bg-white p-7">
                <summary className="flex cursor-pointer list-none flex-col gap-3">
                  {c.flagship && <span className="self-start rounded-full bg-gold px-3 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-navy">{c.flagship}</span>}
                  <h3 className="text-xl font-bold leading-snug text-navy">{c.name}</h3>
                  <p className="text-[0.9375rem] text-muted">{c.focus}</p>
                  <span className="text-sm font-semibold text-royal group-open:hidden">Areas and activities +</span>
                  <span className="hidden text-sm font-semibold text-royal group-open:inline">Show less −</span>
                </summary>
                <div className="flex flex-col gap-3 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-royal">Areas of interest</p>
                  <div className="flex flex-wrap gap-2">
                    {c.areas.map((a) => <span key={a} className="rounded-full bg-mist px-3 py-1 text-[0.8125rem] font-medium text-royal">{a}</span>)}
                  </div>
                  <p className="pt-1 text-xs font-semibold uppercase tracking-[0.15em] text-royal">Activities</p>
                  <ul className="flex flex-col gap-1">
                    {c.activities.map((a) => <li key={a} className="tick text-[0.9375rem]">{a}</li>)}
                  </ul>
                  {c.note && <p className="rounded-xl bg-mist p-3 text-sm text-ink">{c.note}</p>}
                  {(c.short === "Writers" || c.short === "Musicians" || c.short === "Creatives") && (
                    <Link href={`/courses/#${c.short === "Writers" ? "writing" : c.short === "Musicians" ? "music" : "media"}`} className="text-sm font-semibold">Take a {c.short === "Writers" ? "writing" : c.short === "Musicians" ? "music" : "media"} course →</Link>
                  )}
                </div>
              </details>
            ))}
          </div>
          <article aria-labelledby="teens-title" className="grid items-center gap-8 rounded-3xl bg-white p-[clamp(1.5rem,3.5vw,2.5rem)] lg:grid-cols-[1fr_1.4fr]">
            <div className="flex flex-col gap-3">
              <p className="eyebrow text-xs">From the Teenagers&apos; Community</p>
              <h3 id="teens-title" className="text-[clamp(1.5rem,2.6vw,2rem)] font-bold leading-tight text-navy">Teenagers&apos; Capacity Building</h3>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-royal">18–19 September 2026 · CGAC, Oke Taasi, Sepeteri</p>
              <p className="text-lg font-medium italic text-navy">Building Capacity for the Future</p>
              <p className="text-muted">Two days for teenagers on public speaking, agriculture and agribusiness, digital skills, entrepreneurship, leadership, and education and scholarships.</p>
              <p className="text-sm text-muted">Hosted by Enoch Oluwatobiloba Oladosu. Facilitated by Fulfillment Omorinsola Folahan.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/photos/teens-capacity-1.webp" alt="A minister teaching from the pulpit while teenagers listen from the pews" loading="lazy" className="col-span-2 aspect-[16/9] w-full rounded-2xl object-cover" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/photos/teens-capacity-2.webp" alt="Teenagers seated in a church hall listening to the teaching" loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/photos/teens-capacity-3.webp" alt="A young man standing among teenagers during a session" loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover" />
            </div>
          </article>
          <div className="flex flex-col gap-5 rounded-3xl bg-white p-[clamp(1.5rem,3.5vw,2.5rem)]">
            <div className="flex flex-col gap-2">
              <p className="eyebrow text-xs">From the Writers&apos; and Musicians&apos; Communities</p>
              <h3 className="text-[clamp(1.5rem,2.6vw,2rem)] font-bold leading-tight text-navy">Symposiums this year</h3>
              <p className="text-muted">Held online on Google Meet, so anyone can join from anywhere.</p>
            </div>
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {symposiums.map((e) => (
                <li key={e.title} className="flex flex-col gap-2">
                  <a href={e.image} target="_blank" rel="noopener" aria-label={`Open the flyer: ${e.title}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={e.image} alt="" loading="lazy" className="aspect-[4/5] w-full rounded-2xl border border-line object-cover object-top" />
                  </a>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-royal">{e.dateLabel}</p>
                  <h4 className="font-semibold leading-snug text-navy">{e.title}</h4>
                  <p className="text-sm text-muted">{e.summary}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-start gap-3.5 rounded-2xl bg-white px-6 py-5">
            <span className="mt-0.5 flex-none text-royal"><Shield size={24} /></span>
            <p className="text-[0.9375rem]">
              <strong className="font-semibold text-navy">Keeping teenagers safe.</strong> The Teenagers&apos; Community runs with parental consent, adult supervision, a safeguarding policy and carefully moderated communication channels.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="rhythm-title" className="bg-navy text-white">
        <div className="container-site section-pad flex flex-col gap-10">
          <SectionHeading dark id="rhythm-title" eyebrow="How every community works" title="A steady rhythm, not random meetings" />
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {rhythm.map((r, i) => (
              <li key={r.name} className="flex flex-col gap-2 rounded-2xl bg-navy-2 p-6">
                <p className="text-3xl font-extrabold leading-none text-gold">{i + 1}</p>
                <h3 className="text-xl font-semibold">{r.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold">{r.purpose}</p>
                <p className="text-[0.9375rem] text-pale">{r.text}</p>
              </li>
            ))}
          </ol>
          <p className="max-w-4xl border-t border-navy-line pt-6 text-[clamp(1.25rem,2.2vw,1.6rem)] font-semibold leading-snug">
            Our communities don&apos;t only consume information. <span className="text-gold">They produce meaningful work.</span>
          </p>
        </div>
      </section>

      <section id="join" aria-labelledby="join-title" className="bg-white">
        <div className="container-site section-pad grid items-start gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div className="flex flex-col gap-4">
            <SectionHeading id="join-title" eyebrow="Join" title="Find your community" intro="Tell us where your gifts lie and how far along you are. Beginners are as welcome as the experienced, and experienced members are invited to mentor." />
            <p className="text-[0.9375rem] text-muted">Under 18? A parent or guardian must give consent before you join the Teenagers&apos; Community.</p>
          </div>
          <div className="rounded-3xl bg-mist p-[clamp(1.75rem,3.5vw,2.5rem)]">
            <StrongsForm
              formName="community-interest"
              labelledBy="join-title"
              submitLabel="Register interest"
              fields={[
                { name: "name", label: "Full name", type: "text", required: true },
                { name: "phone", label: "Phone number", type: "tel", required: true },
                { name: "email", label: "Email", type: "email", wide: true },
                { name: "community", label: "Community", type: "select", options: communities.map((c) => c.short) },
                { name: "stage", label: "Where you are", type: "select", options: ["Just discovering this interest", "Growing in it", "Experienced, and willing to mentor"] },
              ]}
            />
          </div>
        </div>
      </section>
    </>
  );
}
