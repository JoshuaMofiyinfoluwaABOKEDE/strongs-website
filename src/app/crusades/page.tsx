import type { Metadata } from "next";
import Link from "next/link";
import { crusadeArm } from "@/content/crusades";
import { crusades, events, past, upcoming } from "@/content/events";
import { Photo, PhotoSlot, Portrait, SectionHeading } from "@/components/ui";
import { StrongsForm } from "@/components/Form";
import { Carousel } from "@/components/Carousel";

export const metadata: Metadata = {
  title: "STRONGS Crusades",
  description: crusadeArm.intro,
};

const jump = [
  ["#vision", "Vision"],
  ["#how", "How a crusade runs"],
  ["#leadership", "Leadership"],
  ["#crusades", "Crusades"],
  ["#reports", "Themes and reports"],
  ["#testimonies", "Testimonies"],
  ["#gallery", "Photos and videos"],
  ["#partners", "Partnerships"],
  ["#support", "Support"],
  ["#volunteer", "Volunteer"],
];

export default function CrusadesPage() {
  const next = upcoming.find((e) => e.kind === "Crusade");
  const doneByYear = Object.entries(
    past.reduce<Record<string, typeof past>>((acc, e) => {
      (acc[e.sortDate.slice(0, 4)] ??= []).push(e);
      return acc;
    }, {}),
  ).sort((a, b) => b[0].localeCompare(a[0]));
  const moreUpcoming = upcoming.filter((e) => e.kind === "Crusade" && e !== next);
  const previous = crusades.filter((c) => c.status === "past").sort((a, b) => b.sortDate.localeCompare(a.sortDate));
  const d = crusadeArm.director;
  const flyers = events.filter((e) => e.image && e.status === "past").sort((a, b) => b.sortDate.localeCompare(a.sortDate));

  return (
    <>
      <section aria-labelledby="cr-title" className="bg-navy text-white">
        <div className="container-site grid items-center gap-14 py-[clamp(3.5rem,8vw,6.5rem)] lg:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col gap-6">
            <p className="eyebrow-dark">STRONGS Crusades · Achieving heaven&apos;s goal</p>
            <h1 id="cr-title" className="text-[clamp(2.6rem,5.4vw,4.5rem)] font-extrabold leading-[1.04] tracking-[-0.03em]">
              Preaching Christ to <span className="text-gold">whole communities</span>
            </h1>
            <p className="lead max-w-xl text-pale">{crusadeArm.intro}</p>
            <div className="flex flex-wrap gap-3.5">
              {next?.href && <Link href={next.href} className="btn btn-gold">Next crusade: {next.title}</Link>}
              <a href="#support" className="btn btn-line-light">Support a crusade</a>
            </div>
          </div>
          <Photo
            dark
            fit="contain"
            src="/images/flyers/ebiaji-crusade.webp"
            alt="Flyer for the Ebiaji Gospel Crusade: Experience total liberation through Christ, 6pm daily at UPE Field, Ebiaji"
            caption="Ebiaji Gospel Crusade, UPE Field, Ebiaji, Ebonyi State."
            imgClassName="max-h-[34rem]"
          />
        </div>
      </section>

      <nav aria-label="On this page" className="border-b border-line bg-white">
        <div className="container-site flex flex-wrap gap-x-6 gap-y-1.5 py-3.5 text-sm font-medium">
          {jump.map(([href, label]) => (
            <a key={href} href={href} className="no-underline">{label}</a>
          ))}
        </div>
      </nav>

      <section id="vision" aria-labelledby="vision-title" className="bg-white">
        <div className="container-site section-pad grid items-start gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <SectionHeading id="vision-title" eyebrow="Vision" title="Towns and villages that have heard, believed and stood firm" intro={crusadeArm.vision} />
            <blockquote className="border-t border-line pt-5 text-lg font-medium italic leading-relaxed text-navy">
              “Go out quickly into the streets and lanes of the city, and bring in hither the poor, and the maimed, and the halt, and the blind.”
              <span className="mt-1.5 block text-sm font-semibold not-italic text-royal">Luke 14:21 · KJV</span>
            </blockquote>
          </div>
          <div className="flex flex-col gap-4 rounded-3xl bg-mist p-[clamp(1.75rem,3.5vw,2.5rem)]">
            <p className="eyebrow text-xs">Objectives</p>
            <ul className="flex flex-col gap-3">
              {crusadeArm.objectives.map((o) => <li key={o} className="tick">{o}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section id="how" aria-labelledby="how-title" className="bg-navy text-white">
        <div className="container-site section-pad flex flex-col gap-9">
          <SectionHeading dark id="how-title" eyebrow="How a STRONGS crusade runs" title="Prayed through, preached plainly, followed up" intro="Every crusade follows the same pattern, so that the fruit remains." />
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {crusadeArm.howItRuns.map((h, i) => (
              <li key={h.title} className="flex flex-col gap-2 rounded-2xl bg-navy-2 p-7">
                <span className="text-sm font-bold text-gold">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="text-xl font-semibold">{h.title}</h3>
                <p className="text-[0.9375rem] text-pale">{h.text}</p>
              </li>
            ))}
          </ol>
          <p className="text-[0.9375rem] text-pale">“Ye have not chosen me, but I have chosen you, and ordained you, that ye should go and bring forth fruit, and that your fruit should remain.” John 15:16 · KJV</p>
        </div>
      </section>

      <section id="leadership" aria-labelledby="lead-title" className="bg-mist">
        <div className="container-site section-pad flex flex-col gap-9">
          <SectionHeading id="lead-title" eyebrow="Leadership" title="The crusade team" />
          <article className="flex flex-wrap overflow-hidden rounded-3xl bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={d.photo} alt={`Portrait of ${d.name}`} className="min-h-[22rem] flex-[1_1_20rem] bg-navy object-cover object-top" />
            <div className="flex flex-[1.4_1_28rem] flex-col justify-center gap-3.5 p-[clamp(1.75rem,4vw,3rem)]">
              <p className="eyebrow text-xs">{d.role}</p>
              <h3 className="text-[clamp(1.6rem,2.8vw,2.1rem)] font-bold leading-tight text-navy">{d.name}</h3>
              <p className="lead text-muted">{d.profile}</p>
            </div>
          </article>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {crusadeArm.team.map((t) => (
              <li key={t.name} className="flex flex-col gap-2 rounded-3xl border border-line bg-white p-7">
                <div className="mb-1"><Portrait photo={t.photo} alt={`Portrait of ${t.name}`} /></div>
                <h3 className="text-lg font-semibold leading-snug text-navy">{t.name}</h3>
                <p className="text-sm font-semibold text-royal">{t.role}</p>
                <p className="text-[0.9375rem] text-muted">{t.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="crusades" aria-labelledby="list-title" className="bg-white">
        <div className="container-site section-pad flex flex-col gap-8">
          <SectionHeading id="list-title" eyebrow="Crusades" title="Upcoming, ongoing and previous" />
          {next && (
            <article className="flex flex-wrap items-center gap-x-10 gap-y-6 rounded-3xl bg-navy p-[clamp(1.75rem,4vw,2.75rem)] text-white">
              <div className="flex flex-col">
                <p className="eyebrow-dark text-xs">Upcoming</p>
                <p className="text-[clamp(1.9rem,3vw,2.4rem)] font-extrabold leading-tight">{next.dateLabel}</p>
              </div>
              <div className="flex min-w-0 flex-[1_1_22rem] flex-col gap-2">
                <h3 className="text-[clamp(1.75rem,3vw,2.4rem)] font-extrabold">{next.title}</h3>
                <p className="text-pale">{next.place}. {next.summary}</p>
              </div>
              {next.href && <Link href={next.href} className="btn btn-gold">Crusade details</Link>}
            </article>
          )}
          {moreUpcoming.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-semibold text-navy">More crusades coming</h3>
              <Carousel label="More upcoming crusades">
                {moreUpcoming.map((c) => (
                  <li key={c.title} className="w-[15rem]">
                    <article className="flex flex-col gap-2">
                      {c.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.image} alt={c.imageAlt ?? `Flyer: ${c.title}`} loading="lazy" className="aspect-[4/5] w-full rounded-2xl border border-line bg-mist object-cover" />
                      )}
                      <p className="eyebrow mt-1 text-xs">Upcoming · {c.dateLabel}</p>
                      <h4 className="text-lg font-semibold leading-snug text-navy">{c.title}</h4>
                      <p className="text-sm text-muted">{c.place}</p>
                    </article>
                  </li>
                ))}
              </Carousel>
            </div>
          )}
          <div className="grid gap-5 md:grid-cols-3">
            <article className="flex flex-col gap-2.5 rounded-3xl bg-mist p-7">
              <p className="eyebrow text-xs">Ongoing</p>
              <h3 className="text-xl font-semibold text-navy">{crusadeArm.ongoing.title}</h3>
              <p className="text-[0.9375rem] text-muted">{crusadeArm.ongoing.text}</p>
            </article>
            {previous.map((c) => (
              <article key={c.title} className="flex flex-col gap-2.5 rounded-3xl border border-line p-7">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image} alt={c.imageAlt ?? `Flyer: ${c.title}`} loading="lazy" className="h-48 w-full rounded-xl bg-mist object-cover object-top" />
                ) : (
                  <PhotoSlot label="Crusade photo" className="h-36 rounded-xl p-3" />
                )}
                <p className="eyebrow text-xs">Previous · {c.dateLabel}</p>
                <h3 className="text-xl font-semibold text-navy">{c.title}</h3>
                <p className="text-[0.9375rem] text-muted">{c.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="reports" aria-labelledby="rep-title" className="bg-mist">
        <div className="container-site section-pad flex flex-col gap-10">
          <SectionHeading
            id="rep-title"
            eyebrow="Themes and reports"
            title="What God has done"
            intro="Every crusade, conference and outreach so far, year by year, with the message preached at each one."
          />
          {doneByYear.map(([year, list]) => (
            <div key={year} className="grid gap-5 lg:grid-cols-[8rem_1fr]">
              <p className="text-[clamp(2rem,4vw,2.75rem)] font-extrabold leading-none tracking-[-0.03em] text-royal">{year}</p>
              <ul className="grid gap-3.5 md:grid-cols-2">
                {list.map((e) => (
                  <li key={e.title + e.sortDate} className="flex gap-4 rounded-2xl bg-white p-5 shadow-[0_0_0_1px_var(--color-line)]">
                    {e.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e.image} alt="" loading="lazy" className="h-20 w-16 shrink-0 rounded-lg bg-mist object-cover object-top" />
                    )}
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-royal">{e.kind} · {e.dateLabel}</p>
                      <h3 className="font-semibold leading-snug text-navy">{e.title}</h3>
                      {e.theme && <p className="text-sm italic text-ink">Theme: {e.theme}</p>}
                      <p className="text-sm text-muted">{e.place}</p>
                      {e.report && <p className="mt-1 border-l-[3px] border-gold pl-3 text-sm text-ink">{e.report}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-sm text-muted">We publish only verified outcomes in our reports.</p>
        </div>
      </section>

      <section id="testimonies" aria-labelledby="test-title" className="bg-navy text-white">
        <div className="container-site section-pad flex flex-col gap-8">
          <SectionHeading
            dark
            id="test-title"
            eyebrow="Testimonies"
            title="Lives changed by the gospel"
            intro="Has God saved, healed or delivered you at a STRONGS crusade? Your story can strengthen someone else's faith. Send it to us, and we will share it here with your permission."
          />
          {crusadeArm.testimonies.length > 0 && (
          <div className="grid gap-5 md:grid-cols-3">
            {crusadeArm.testimonies.map((t, i) => (
              <figure key={i} className="flex flex-col gap-3.5 rounded-2xl bg-navy-2 p-7">
                <blockquote className="text-[1.0625rem] font-medium italic leading-relaxed">“{t.text}”</blockquote>
                <figcaption className="mt-auto text-sm text-pale">{t.who}</figcaption>
              </figure>
            ))}
          </div>
          )}
          <a href="mailto:strongsimpact@gmail.com?subject=Crusade%20testimony" className="btn btn-line-light self-start">Share your testimony</a>
        </div>
      </section>

      <section id="gallery" aria-labelledby="gal-title" className="bg-white">
        <div className="container-site section-pad flex flex-col gap-7">
          <SectionHeading id="gal-title" eyebrow="From the field" title="Flyers from our outreaches" />
          <Carousel label="Flyers and photos from the field">
            {flyers.map((e) => (
              <li key={e.title} className="w-[14rem]">
                <a href={e.image} target="_blank" rel="noopener" className="group flex flex-col gap-2 no-underline">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.image} alt={e.imageAlt ?? `Flyer: ${e.title}`} loading="lazy" className="aspect-[4/5] w-full rounded-2xl border border-line bg-mist object-cover object-top transition group-hover:opacity-90" />
                  <span className="text-sm font-semibold text-navy">{e.title}</span>
                  <span className="-mt-1.5 text-xs text-muted">{e.dateLabel}</span>
                </a>
              </li>
            ))}
          </Carousel>
          <p className="text-sm text-muted">Photos of identifiable people are published only with their consent, and with a parent&apos;s consent for children.</p>
        </div>
      </section>

      <section id="partners" aria-labelledby="part-title" className="bg-mist">
        <div className="container-site section-pad flex flex-col gap-8">
          <SectionHeading id="part-title" eyebrow="Crusade partnerships" title="No crusade is won alone" intro="Every crusade is carried with local churches, ministries and partners who open the door and care for the converts afterwards." />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {crusadeArm.partners.map((p) => (
              <li key={p.title} className="flex flex-col gap-2 rounded-3xl bg-white p-7">
                <h3 className="text-lg font-semibold text-navy">{p.title}</h3>
                <p className="text-[0.9375rem] text-muted">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="support" aria-labelledby="sup-title" className="bg-white">
        <div className="container-site grid items-center gap-10 pb-[clamp(3rem,6vw,4.5rem)] pt-[clamp(4rem,8vw,6.5rem)] lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <SectionHeading id="sup-title" eyebrow="Support a crusade" title="Hold the ropes for the next crusade" intro="Your prayer and giving put the gospel before a whole town." />
            <div className="flex flex-wrap gap-3.5">
              <Link href="/get-involved/#give" className="btn btn-navy">Give to a crusade</Link>
              <Link href="/get-involved/#contact" className="btn btn-line">Partner with us</Link>
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-3">
            {crusadeArm.needs.map((n) => <li key={n} className="rounded-2xl bg-mist px-5 py-4 font-medium text-navy">{n}</li>)}
          </ul>
        </div>
      </section>

      <section id="volunteer" aria-labelledby="vol-title" className="bg-white">
        <div className="container-site grid items-start gap-10 pb-[clamp(4rem,8vw,6.5rem)] lg:grid-cols-[1fr_1.3fr]">
          <SectionHeading id="vol-title" eyebrow="Volunteer" title="Serve on the crusade team" intro="Join a unit and labour in the harvest field with us." />
          <div className="rounded-3xl bg-mist p-[clamp(1.75rem,3.5vw,2.5rem)]">
            <StrongsForm
              formName="crusade-volunteer"
              labelledBy="vol-title"
              submitLabel="Volunteer"
              fields={[
                { name: "name", label: "Full name", type: "text", required: true },
                { name: "phone", label: "Phone number", type: "tel", required: true },
                { name: "email", label: "Email", type: "email" },
                { name: "unit", label: "Unit", type: "select", options: crusadeArm.volunteerUnits },
              ]}
            />
          </div>
        </div>
      </section>
    </>
  );
}
