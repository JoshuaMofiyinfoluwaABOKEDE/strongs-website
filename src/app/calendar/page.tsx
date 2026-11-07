import type { Metadata } from "next";
import Link from "next/link";
import { past, upcoming, type StrongsEvent } from "@/content/events";
import { SectionHeading } from "@/components/ui";
import { childrenClub, meetings } from "@/content/meetings";
import { Calendar, Pin } from "@/components/icons";

export const metadata: Metadata = {
  title: "Calendar",
  description: "Every STRONGS crusade, conference and outreach by date.",
};

function EventRow({ e }: { e: StrongsEvent }) {
  return (
    <li className="grid gap-x-10 gap-y-2 border-b border-line py-7 md:grid-cols-[12rem_1fr_auto] md:items-center">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-royal">{e.dateLabel}</p>
        <p className="self-start rounded-full bg-mist px-3 py-0.5 text-xs font-semibold text-navy">{e.kind}</p>
      </div>
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        {e.image && (
          <a href={e.image} target="_blank" rel="noopener" className="shrink-0 self-start" aria-label={`Open the flyer for ${e.title}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={e.image} alt="" loading="lazy" className="h-32 w-28 rounded-xl border border-line bg-mist object-cover object-top" />
          </a>
        )}
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-[1.375rem] font-semibold text-navy">{e.title}</h3>
          {e.theme && !e.theme.startsWith("[") && e.theme !== e.title && <p className="text-[0.9375rem] font-medium italic text-royal">Theme: {e.theme}</p>}
          <p className="flex items-center gap-2 text-[0.9375rem] text-muted"><Pin size={16} />{e.place}</p>
          <p className="text-muted">{e.summary}</p>
        </div>
      </div>
      {e.href ? (
        <Link href={e.href} className="btn btn-line min-h-11 justify-self-start px-5 text-[0.9375rem]">Details</Link>
      ) : e.status === "upcoming" ? (
        <a href={`mailto:strongsimpact@gmail.com?subject=${encodeURIComponent(e.title)}`} className="btn btn-line min-h-11 justify-self-start px-5 text-[0.9375rem]">Ask for details</a>
      ) : (
        <span />
      )}
    </li>
  );
}

export default function CalendarPage() {
  const [next, ...rest] = upcoming;
  return (
    <>
      <section aria-labelledby="cal-title" className="bg-mist">
        <div className="container-site flex flex-col gap-5 pb-[clamp(2.5rem,5vw,3.5rem)] pt-[clamp(3.5rem,7vw,5.5rem)]">
          <p className="eyebrow">Calendar</p>
          <h1 id="cal-title" className="max-w-4xl text-[clamp(2.4rem,4.8vw,3.9rem)] font-bold leading-[1.08] tracking-[-0.02em] text-navy">
            Crusades, missions and conferences by date
          </h1>
          <p className="lead max-w-3xl text-muted">
            Every STRONGS crusade, conference and outreach in one place. Come and hear, come and serve, or bring STRONGS to your town, school or church.
          </p>
        </div>
      </section>

      <section aria-labelledby="weekly-cal-title" className="bg-mist">
        <div className="container-site pb-8">
          <div className="flex flex-col gap-4 rounded-[1.75rem] border-[1.5px] border-royal bg-white p-[clamp(1.5rem,3vw,2.25rem)]">
            <h2 id="weekly-cal-title" className="text-xs font-bold uppercase tracking-[0.18em] text-royal">Every week</h2>
            <ul className="grid gap-5 md:grid-cols-2">
              {meetings.map((m) => (
                <li key={m.id} className="flex flex-col gap-1">
                  <p className="text-[clamp(1.4rem,2.4vw,1.75rem)] font-extrabold leading-tight text-navy">{m.day}, {m.time}</p>
                  <p className="text-lg font-semibold text-navy">{m.name}</p>
                  <p className="flex items-start gap-2 text-[0.9375rem] text-muted"><span className="mt-0.5"><Pin size={16} /></span>{m.whereNote}: {m.where}</p>
                </li>
              ))}
            </ul>
            <p className="border-t border-line pt-4 text-[0.9375rem] text-ink">
              <strong className="font-semibold text-navy">For children:</strong> {childrenClub.name}, every Saturday at {childrenClub.time}. <Link href={childrenClub.href} className="font-semibold">Children Mission</Link>
            </p>
            <p className="text-[0.9375rem] text-ink">
              <strong className="font-semibold text-navy">Every year, fasting and prayer:</strong> 1–21 January · 1 March – 30 April · 1–21 September
            </p>
            <Link href="/meetings/" className="self-start text-sm font-semibold">About the Bible Club, Evangelism Training and prayer seasons →</Link>
          </div>
        </div>
      </section>

      {next && (
        <section aria-labelledby="next-title" className="bg-mist">
          <div className="container-site pb-[clamp(4rem,8vw,6.5rem)]">
            <article className="flex flex-wrap items-center gap-x-10 gap-y-6 rounded-[1.75rem] bg-navy p-[clamp(1.75rem,4vw,3.25rem)] text-white">
              <div className="flex min-w-0 flex-[1_1_28rem] flex-col gap-4">
                <p className="self-start rounded-full bg-gold px-3.5 py-1 text-xs font-bold uppercase tracking-[0.15em] text-navy">Next: {next.kind}</p>
                <h2 id="next-title" className="text-[clamp(2.4rem,5vw,3.9rem)] font-extrabold leading-none tracking-[-0.03em]">{next.title}</h2>
                <div className="flex flex-wrap gap-x-7 gap-y-2 text-[1.0625rem] font-medium">
                  <p className="flex items-center gap-2.5"><span className="text-gold"><Calendar size={20} /></span>{next.dateLabel}</p>
                  <p className="flex items-center gap-2.5"><span className="text-gold"><Pin size={20} /></span>{next.place}</p>
                </div>
                <p className="lead max-w-2xl text-pale">{next.summary}</p>
              </div>
              {next.href && <Link href={next.href} className="btn btn-gold">Full details and registration</Link>}
            </article>
          </div>
        </section>
      )}

      <section aria-labelledby="upcoming-title" className="bg-white">
        <div className="container-site flex flex-col gap-6 pt-[clamp(4rem,8vw,6.5rem)]">
          <SectionHeading id="upcoming-title" title="Coming up" />
          <ul className="border-t border-line">
            {rest.map((e) => <EventRow key={e.title} e={e} />)}
          </ul>
        </div>
      </section>

      <section aria-labelledby="past-title" className="bg-white">
        <div className="container-site section-pad flex flex-col gap-6">
          <SectionHeading id="past-title" eyebrow="Past events" title="Where the gospel has gone" />
          <ul className="border-t border-line">
            {past.map((e) => <EventRow key={e.title} e={e} />)}
          </ul>
        </div>
      </section>

      <section aria-labelledby="invite-title" className="bg-navy text-white">
        <div className="container-site flex flex-wrap items-center justify-between gap-6 py-18">
          <div className="flex max-w-2xl flex-col gap-3">
            <h2 id="invite-title" className="text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight">Open a door for the gospel in your town, school or church</h2>
            <p className="lead text-pale">We co-host crusades, conferences and student outreaches with churches, schools and campuses.</p>
          </div>
          <Link href="/get-involved/#contact" className="btn btn-gold">Invite STRONGS</Link>
        </div>
      </section>
    </>
  );
}
