import type { Metadata } from "next";
import Link from "next/link";
import { missions } from "@/content/missions";
import { college } from "@/content/college";
import { Photo, PhotoSlot, SectionHeading } from "@/components/ui";
import { Carousel } from "@/components/Carousel";

export const metadata: Metadata = {
  title: "STRONGS Missions",
  description:
    "Six specialised missions of STRONGS: Medical, School, Drama, Educational (with STRONGS College), Media and Children.",
};

export default function MissionsPage() {
  return (
    <>
      <section aria-labelledby="mis-title" className="bg-navy text-white">
        <div className="container-site flex flex-col gap-9 py-[clamp(3.5rem,8vw,6.5rem)]">
          <div className="flex max-w-4xl flex-col gap-5">
            <p className="eyebrow-dark">STRONGS Missions</p>
            <h1 id="mis-title" className="text-[clamp(2.6rem,5.4vw,4.5rem)] font-extrabold leading-[1.04] tracking-[-0.03em]">
              Specialised missions. <span className="text-gold">One gospel.</span>
            </h1>
            <p className="lead text-pale">
              Alongside our crusades, six specialised missions carry the gospel into hospitals and homes, schools and campuses, stages and screens, and among children, so that every gift is sent into the harvest.
            </p>
          </div>
          <ul className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {missions.map((m) => (
              <li key={m.id}>
                <a href={`#${m.id}`} className="flex h-full flex-col gap-2 rounded-2xl bg-navy-2 p-6 text-white no-underline hover:bg-[#1a3760] hover:text-white">
                  <span className="text-sm font-bold text-gold">{m.letter}</span>
                  <span className="text-lg font-semibold leading-snug">{m.short}</span>
                  <span className="text-sm text-pale">{m.leader?.name ?? "Leader to be announced"}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {missions.map((m, i) => (
        <section key={m.id} id={m.id} aria-labelledby={`${m.id}-title`} className={i % 2 ? "bg-mist" : "bg-white"}>
          <div className="container-site section-pad grid items-start gap-11 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <p className="eyebrow">Mission {m.letter}</p>
              <h2 id={`${m.id}-title`} className="h2 text-navy">{m.name}</h2>
              <p className="text-[1.0625rem] font-semibold text-navy">{m.focus}</p>
              <p className="lead text-muted">{m.intro}</p>
              <p className="eyebrow pt-2 text-xs">{m.activitiesTitle}</p>
              <ul className="flex flex-col gap-2">
                {m.activities.map((a) => <li key={a} className="tick">{a}</li>)}
              </ul>
              {m.id === "school" && (
                <p className="text-[0.9375rem]"><Link href="/calendar/" className="font-semibold">See dates on the calendar</Link></p>
              )}
              {m.id === "media" && (
                <p className="text-[0.9375rem]"><Link href="/communities/" className="font-semibold">Creatives and media people: join the Creatives&apos; Community</Link></p>
              )}
              {m.id === "educational" && (
                <Link href="/college/" className="flex flex-col gap-1.5 rounded-3xl bg-navy p-6 text-white no-underline hover:bg-navy-2 hover:text-white">
                  <span className="eyebrow-dark text-xs">A vision of the Educational Mission · Not yet open</span>
                  <span className="text-2xl font-bold">STRONGS College</span>
                  <span className="font-medium italic text-gold">{college.motto}</span>
                  <span className="text-[0.9375rem] text-pale">A plan for a faith-based mission school for primary and secondary students. See the vision and where we are →</span>
                </Link>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {m.leader ? (
                <div className="flex flex-wrap overflow-hidden rounded-3xl bg-white shadow-[0_0_0_1px_var(--color-line)]">
                  {m.leader.photo ? (
                    <div className="relative min-h-56 flex-[0_0_11rem] bg-navy">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.leader.photo} alt={`Portrait of ${m.leader.name}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top" />
                    </div>
                  ) : (
                    <div className="clean-slot grid min-h-56 flex-[0_0_11rem] place-items-center">
                      <span className="text-5xl font-extrabold tracking-[-0.02em] text-gold" aria-hidden="true">
                        {m.leader.name.split(" ").filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join("")}
                      </span>
                    </div>
                  )}
                  <div className="flex min-w-0 flex-[1_1_16rem] flex-col gap-2 p-6">
                    <p className="eyebrow text-xs">{m.leader.role}</p>
                    <h3 className="text-xl font-bold leading-snug text-navy">{m.leader.name}</h3>
                    <p className="text-[0.9375rem] text-muted">{m.leader.bio}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 rounded-3xl border-[1.5px] border-dashed border-steel bg-white p-7">
                  <p className="eyebrow text-xs">Mission Leader</p>
                  <p className="text-xl font-semibold text-navy">To be announced</p>
                  <p className="text-[0.9375rem] text-muted">
                    Gifted in media and called to serve? <Link href="/get-involved/#contact" className="font-semibold">Tell us.</Link>
                  </p>
                </div>
              )}
              {m.image ? (
                <Photo src={m.image.src} alt={m.image.alt} caption={m.image.caption} imgClassName="h-72 object-top" />
              ) : null}
              {m.gallery && (
                <Carousel label={`${m.short}: more photos`}>
                  {m.gallery.map((g) => (
                    <li key={g.src} className="w-[9.5rem]">
                      <a href={g.src} target="_blank" rel="noopener" className="block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={g.src} alt={g.alt} loading="lazy" className="aspect-square w-full rounded-xl object-cover object-top" />
                      </a>
                    </li>
                  ))}
                </Carousel>
              )}
              {m.image ? null : (
                <PhotoSlot label={`${m.short} in action`} className="h-56" />
              )}
            </div>
          </div>
        </section>
      ))}

      <section aria-labelledby="mis-cta" className="bg-navy text-white">
        <div className="container-site flex flex-wrap items-center justify-between gap-6 py-18">
          <h2 id="mis-cta" className="max-w-2xl text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight">Is God calling you to serve in one of these missions?</h2>
          <div className="flex flex-wrap gap-3.5">
            <Link href="/get-involved/#contact" className="btn btn-gold">Join a mission</Link>
            <Link href="/get-involved/#give" className="btn btn-line-light">Support the missions</Link>
          </div>
        </div>
      </section>
    </>
  );
}
