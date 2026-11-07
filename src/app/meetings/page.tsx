import type { Metadata } from "next";
import Link from "next/link";
import { childrenClub, meetings, meetingsLeader, prayerSeasons, studyArchive } from "@/content/meetings";
import { site } from "@/content/site";
import { SectionHeading } from "@/components/ui";
import { Carousel } from "@/components/Carousel";
import { Book, Calendar, Monitor, Pin, People } from "@/components/icons";

export const metadata: Metadata = {
  title: "Bible Club and Evangelism Training",
  description:
    "The two weekly meetings where STRONGS trains and equips believers to serve: the Bible Club every Monday at 6pm, and Evangelism and Follow-up Training every Sunday at 7pm.",
};

const whatsapp = (text: string) => `https://wa.me/${site.phoneHref.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

export default function MeetingsPage() {
  return (
    <>
      <section aria-labelledby="mt-title" className="bg-navy text-white">
        <div className="container-site flex flex-col gap-10 py-[clamp(3.5rem,7vw,6rem)]">
          <div className="flex max-w-4xl flex-col gap-5">
            <p className="eyebrow-dark">Every week · The heart of STRONGS</p>
            <h1 id="mt-title" className="text-[clamp(2.5rem,5.2vw,4.25rem)] font-bold leading-[1.08] tracking-[-0.02em]">
              Where believers are <span className="text-gold">trained and equipped</span> to serve
            </h1>
            <p className="lead max-w-3xl text-pale">
              Crusades gather the harvest; these two meetings raise the labourers. Every week believers are grounded in the Word at the Bible Club and trained to win souls and keep them at Evangelism Training.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {meetings.map((m) => (
              <a
                key={m.id}
                href={`#${m.id}`}
                className="group flex flex-col gap-4 rounded-3xl border border-navy-line bg-navy-2 p-[clamp(1.5rem,3vw,2.25rem)] text-white no-underline hover:border-gold hover:text-white"
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">{m.purpose}</p>
                <h2 className="text-[clamp(1.6rem,2.6vw,2.1rem)] font-bold leading-tight">{m.name}</h2>
                <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
                  <p className="text-[clamp(2rem,3.6vw,2.75rem)] font-extrabold leading-none tracking-[-0.02em]">{m.day}</p>
                  <p className="text-2xl font-bold text-gold">{m.time}</p>
                </div>
                <p className="flex items-start gap-2.5 text-pale">
                  <span className="mt-0.5 text-gold">{m.online ? <Monitor size={20} /> : <Pin size={20} />}</span>
                  <span><strong className="font-semibold text-white">{m.whereNote}:</strong> {m.where}</span>
                </p>
                <span className="mt-auto text-sm font-semibold text-gold group-hover:underline">More about the {m.short} ↓</span>
              </a>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-navy-line pt-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={meetingsLeader.photo} alt={`Portrait of ${meetingsLeader.name}`} className="h-16 w-16 rounded-full object-cover object-top" />
            <p className="text-pale">
              Both meetings are led personally by <strong className="font-semibold text-white">{meetingsLeader.name}</strong>, {meetingsLeader.role}.
            </p>
          </div>
          <Link href={childrenClub.href} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-navy-line bg-navy-2 px-6 py-4 text-white no-underline hover:border-gold hover:text-white">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-gold">For children</span>
            <span className="font-semibold">{childrenClub.name}</span>
            <span className="font-bold text-gold">{childrenClub.day}, {childrenClub.time}</span>
            <span className="text-sm text-pale">Led by {childrenClub.leader}, Children Mission →</span>
          </Link>
        </div>
      </section>

      {meetings.map((m, i) => (
        <section key={m.id} id={m.id} aria-labelledby={`${m.id}-title`} className={i % 2 ? "bg-mist" : "bg-white"}>
          <div className="container-site section-pad flex flex-col gap-12">
            <div className="grid items-start gap-12 lg:grid-cols-[1.15fr_1fr]">
              <div className="flex flex-col gap-5">
                <SectionHeading id={`${m.id}-title`} eyebrow={m.purpose} title={m.name} intro={m.description} />
                <ul className="flex flex-col gap-2.5">
                  {m.whatHappens.map((w) => <li key={w} className="tick">{w}</li>)}
                </ul>
                {m.history && <p className="rounded-xl bg-mist px-4 py-3 text-sm text-ink">{m.history}</p>}
                <blockquote className="border-l-[3px] border-gold pl-5 text-lg font-medium italic leading-relaxed text-navy">
                  “{m.scripture.text}”
                  <span className="mt-1.5 block text-sm font-semibold not-italic text-royal">{m.scripture.reference} · KJV</span>
                </blockquote>
              </div>

              <aside className="flex flex-col gap-5 rounded-3xl bg-navy p-[clamp(1.75rem,3.5vw,2.5rem)] text-white" aria-label={`When and where: ${m.name}`}>
                <p className="eyebrow-dark text-xs">Join us</p>
                <p className="flex items-center gap-3 text-[clamp(1.6rem,2.6vw,2rem)] font-extrabold leading-tight">
                  <span className="text-gold"><Calendar size={26} /></span>{m.day}, {m.time}
                </p>
                <p className="flex items-start gap-3 text-pale">
                  <span className="mt-0.5 text-gold">{m.online ? <Monitor size={22} /> : <Pin size={22} />}</span>
                  <span><strong className="font-semibold text-white">{m.whereNote}.</strong> {m.where}</span>
                </p>
                <p className="flex items-start gap-3 text-pale">
                  <span className="mt-0.5 text-gold"><People size={22} /></span>
                  <span>Led by {meetingsLeader.name}</span>
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <a href={whatsapp(`Hello STRONGS, I would like to join the ${m.name} (${m.day}, ${m.time}).`)} className="btn btn-gold" target="_blank" rel="noopener">
                    {m.online ? "Join the WhatsApp group" : "I'm coming"}
                  </a>
                  <a href={`mailto:${site.email}?subject=${encodeURIComponent(m.name)}`} className="btn btn-line-light">Email us</a>
                </div>
              </aside>
            </div>

            {m.id === "bible-club" ? (
              <div id="archive" className="flex flex-col gap-10">
                <div className="flex flex-col gap-2">
                  <p className="eyebrow">The study archive</p>
                  <h3 className="text-[clamp(1.5rem,2.6vw,2rem)] font-bold leading-tight text-navy">Book by book, passage by passage</h3>
                  <p className="max-w-2xl text-muted">Every study we have a record of, newest first. Tap a flyer to see it in full.</p>
                </div>
                {studyArchive.map((group) => (
                  <div key={group.series} className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line pb-3">
                      <h4 className="text-xl font-bold text-navy">{group.series}</h4>
                      <p className="text-sm text-muted">{group.note} · {group.studies.length} {group.studies.length === 1 ? "study" : "studies"}</p>
                    </div>
                    <Carousel label={`${group.series}: studies`}>
                      {group.studies.map((st) => (
                        <li key={st.title + st.date} className="flex w-[12.5rem] flex-col gap-1.5">
                          {st.image && (
                            <a href={st.image} target="_blank" rel="noopener" aria-label={`Open the flyer: ${st.title}`}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={st.image} alt="" loading="lazy" className="aspect-square w-full rounded-xl border border-line bg-mist object-cover object-top" />
                            </a>
                          )}
                          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-royal">{st.date}</p>
                          <p className="text-[0.9375rem] font-semibold leading-snug text-navy">{st.title}</p>
                          {st.passage && <p className="text-sm text-muted">{st.passage}</p>}
                        </li>
                      ))}
                    </Carousel>
                  </div>
                ))}
              </div>
            ) : (
            <div className="flex flex-col gap-5">
              <p className="eyebrow">Recent {m.online ? "training topics" : "studies"}</p>
              <Carousel label={`${m.short}: recent topics`}>
                {m.recent.map((r) => (
                  <li key={r.title} className="flex w-[15rem] flex-col gap-2">
                    {r.image && (
                      <a href={r.image} target="_blank" rel="noopener" aria-label={`Open the flyer: ${r.title}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.image} alt="" loading="lazy" className="aspect-[4/5] w-full rounded-2xl border border-line bg-mist object-cover object-top" />
                      </a>
                    )}
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-royal">{r.date}</p>
                    <h3 className="font-semibold leading-snug text-navy">{r.title}</h3>
                    <p className="text-sm text-muted">{r.text}</p>
                  </li>
                ))}
              </Carousel>
            </div>
            )}
          </div>
        </section>
      ))}

      <section id="prayer" aria-labelledby="prayer-title" className="bg-navy text-white">
        <div className="container-site section-pad flex flex-col gap-10">
          <SectionHeading
            dark
            id="prayer-title"
            eyebrow="Every year · Fasting and prayer"
            title="In prayer we rise or fall"
            intro="Three times every year the whole family of STRONGS sets itself apart to fast and pray for the work, the workers and the harvest. Join us wherever you are."
          />
          <ol className="grid gap-5 md:grid-cols-3">
            {prayerSeasons.map((p, i) => (
              <li key={p.when} className="flex flex-col gap-4 rounded-3xl bg-navy-2 p-[clamp(1.5rem,3vw,2rem)]">
                <span className="text-sm font-bold text-gold">{String(i + 1).padStart(2, "0")}</span>
                <p className="flex items-center gap-2.5 text-[clamp(1.4rem,2.2vw,1.75rem)] font-extrabold leading-tight"><span className="text-gold"><Calendar size={24} /></span>{p.when}</p>
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <p className="text-[0.9375rem] text-pale">{p.text}</p>
                {p.past.length > 0 && (
                  <ul className="mt-auto flex flex-col gap-3 border-t border-navy-line pt-4">
                    {p.past.map((y) => (
                      <li key={y.year} className="flex items-center gap-3.5">
                        <a href={y.image} target="_blank" rel="noopener" className="shrink-0" aria-label={`Open the flyer: ${y.theme}, ${y.year}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={y.image} alt="" loading="lazy" className="h-16 w-16 rounded-lg object-cover object-top" />
                        </a>
                        <span className="flex flex-col">
                          <span className="text-xs font-bold text-gold">{y.year}</span>
                          <span className="font-medium italic">{y.theme}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="mt-cta" className="bg-white">
        <div className="container-site flex flex-wrap items-center justify-between gap-6 py-18">
          <div className="flex max-w-2xl flex-col gap-3">
            <h2 id="mt-cta" className="text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight text-navy">Come and be equipped</h2>
            <p className="lead text-muted">No one is too new and no one is too old. Come to the Bible Club on Monday and the training on Sunday, and grow into a labourer in the harvest.</p>
          </div>
          <div className="flex flex-wrap gap-3.5">
            <Link href="/resources/" className="btn btn-navy"><Book size={18} /> Read our articles</Link>
            <Link href="/calendar/" className="btn btn-line">See the calendar</Link>
          </div>
        </div>
      </section>
    </>
  );
}
