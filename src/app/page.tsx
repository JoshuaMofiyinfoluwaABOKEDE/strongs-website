import Link from "next/link";
import { site } from "@/content/site";
import { past, upcoming } from "@/content/events";
import { communities } from "@/content/communities";
import { articles } from "@/content/articles";
import { childrenClub, meetings, meetingsLeader } from "@/content/meetings";
import { courses } from "@/content/courses";
import { journey, journeyNow } from "@/content/college";
import { CourseCard } from "@/components/CourseCard";
import { Carousel } from "@/components/Carousel";
import { Slideshow } from "@/components/Slideshow";
import { Scripture, SectionHeading, TextLink } from "@/components/ui";
import { StrongsForm } from "@/components/Form";
import { ArrowRight, Book, Cap, Flame, Globe, Heart, Lightbulb, Megaphone, Music, Package, People, Pin, Plus, PrayingHands, Shield, Sun } from "@/components/icons";
import { communityIcons } from "@/content/community-icons";

const heritage = [
  { era: "The Reformers", quote: "My conscience is captive to the Word of God.", who: "Martin Luther, 1521" },
  { era: "The Puritans", quote: "I preached as never sure to preach again, and as a dying man to dying men.", who: "Richard Baxter" },
  { era: "The revivalists", quote: "I look upon all the world as my parish.", who: "John Wesley, 1739" },
  { era: "World missions", quote: "Why should anyone hear the gospel twice before everyone has heard it once?", who: "Oswald J. Smith" },
  { era: "Africa's harvest", quote: "…to see hell empty and heaven full.", who: "Reinhard Bonnke" },
];

/**
 * Photos that crossfade behind the opening words, 5 seconds each.
 * `pos` frames the photo on wide screens; `mobile` keeps the people's faces in view on narrow phone screens.
 */
const heroSlides: { src: string; pos?: string; mobile: string }[] = [
  { src: "/images/photos/irele-assembly-1.webp", pos: "center 60%", mobile: "22% 62%" },
  { src: "/images/photos/abokede-campus-aflame.webp", pos: "center 22%", mobile: "45% 20%" },
  { src: "/images/photos/medical-school-talk-4.webp", pos: "center 35%", mobile: "42% 35%" },
  { src: "/images/photos/irele-classroom.webp", pos: "center 45%", mobile: "55% 45%" },
  { src: "/images/photos/medical-outreach-tent.webp", pos: "center 40%", mobile: "36% 38%" },
  { src: "/images/photos/teens-capacity-1.webp", pos: "center 55%", mobile: "50% 55%" },
  { src: "/images/photos/irele-hall-preaching.webp", pos: "center 35%", mobile: "50% 40%" },
  { src: "/images/photos/medical-school-talk-1.webp", pos: "center 40%", mobile: "16% 40%" },
  { src: "/images/photos/irele-assembly-2.webp", pos: "center 60%", mobile: "70% 60%" },
  { src: "/images/photos/medical-outreach-nurse.webp", pos: "center 35%", mobile: "50% 32%" },
  { src: "/images/photos/school-tla-2.webp", pos: "center 55%", mobile: "40% 55%" },
  { src: "/images/photos/teens-capacity-2.webp", pos: "center 60%", mobile: "45% 62%" },
  { src: "/images/photos/school-tla-1.webp", pos: "center 50%", mobile: "60% 50%" },
];

/** Lines that slide in and out under the headline. */
const heroLines = [
  "A non-denominational gospel mission to campuses, schools, towns and villages.",
  "The whole gospel to the whole man.",
  "Achieving heaven’s goal.",
  "Your spiritual welfare is our greatest concern.",
];

/** Each photo shows for 5s and crossfades for about 1s; the keyframes depend on how many photos there are. */
function heroKeyframes(n: number) {
  const slot = 100 / n;
  const fade = Math.min(slot * 0.25, 1.6);
  const p = (x: number) => `${x.toFixed(3)}%`;
  return `@keyframes heroSlide{0%{opacity:0;transform:scale(1.14) translate3d(0,0,0)}${p(fade)}{opacity:1}${p(slot)}{opacity:1;transform:scale(1.03) translate3d(-1.2%,-0.8%,0)}${p(slot + fade)}{opacity:0;transform:scale(1.02) translate3d(-1.4%,-1%,0)}100%{opacity:0}}
.hero-slide{animation-duration:${n * 5}s}`;
}

const fields = [
  { icon: Globe, title: "Crusades and open-air preaching", text: "The gospel in streets, markets and towns and villages few others visit.", href: "/crusades/" },
  { icon: Flame, title: "Campus and school missions", text: "Campus aFlame, and gospel outreaches to universities and secondary schools.", href: "/missions/#school" },
  { icon: Cap, title: "Children and teens", text: "Children for Christ every year, and the Teenagers’ Community.", href: "/missions/#children" },
  { icon: Sun, title: "Prayer and intercession", text: "Three seasons of fasting and prayer every year: January, March to April, and September.", href: "/meetings/#prayer" },
  { icon: Music, title: "Drama, music and the arts", text: "Drama evangelism and communities for writers and musicians.", href: "/missions/#drama" },
  { icon: Plus, title: "Medical mission and care", text: "Faith expressed in practical care for the communities we reach.", href: "/missions/#medical" },
];

export default function HomePage() {
  const crusade = upcoming.find((e) => e.kind === "Crusade");
  const latest = articles.slice(0, 8);
  const fieldReports = [...upcoming.filter((e) => e !== crusade), ...past.filter((e) => e.image)].slice(0, 12);

  return (
    <>
      {/* Hero: full-screen photos crossfading behind the words */}
      <section aria-labelledby="hero-title" className="hero-full relative isolate flex min-h-[min(46rem,calc(100svh-73px))] items-end justify-center overflow-hidden bg-navy text-center text-white md:min-h-[calc(100svh-73px)] md:items-center">
        <style>{heroKeyframes(heroSlides.length)}</style>
        {/* Phones: the photo fills the top of the screen so faces stay clear of the words; wider screens: the whole background. */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-20 h-[64%] overflow-hidden md:inset-0 md:h-full">
          {heroSlides.map((f, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={f.src}
              src={f.src}
              alt=""
              loading={i < 2 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : undefined}
              className="hero-slide absolute inset-0 h-full w-full object-cover object-[var(--pm)] md:object-[var(--pd)]"
              style={{ ["--pm" as string]: f.mobile, ["--pd" as string]: f.pos ?? "center", ["--i" as string]: i }}
            />
          ))}
        </div>
        {/* Navy shade: lighter in the middle so faces show, darker at the edges for the words */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-[64%] bg-[linear-gradient(180deg,rgba(11,31,58,0.15)_0%,rgba(11,31,58,0.2)_45%,rgba(11,31,58,0.85)_84%,#0b1f3a_100%)] md:hidden" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 hidden bg-[radial-gradient(ellipse_at_center,rgba(11,31,58,0.45)_0%,rgba(11,31,58,0.72)_70%,rgba(11,31,58,0.9)_100%)] md:block" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 hidden h-1/3 bg-gradient-to-t from-navy to-transparent md:block" />
        <div aria-hidden="true" className="hero-glow absolute left-1/2 top-[72%] -z-10 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-3xl md:top-1/2 md:h-[34rem] md:w-[34rem]" />

        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 px-5 pb-10 pt-[min(52vw,16rem)] sm:gap-6 sm:px-6 md:py-16">
          <p className="hero-rise flex items-center gap-3 eyebrow-dark" style={{ animationDelay: "0.1s" }}>
            <span aria-hidden="true" className="hero-line h-px w-8 bg-gold sm:w-12" />
            The gospel to every creature
            <span aria-hidden="true" className="hero-line h-px w-8 bg-gold sm:w-12" />
          </p>
          <h1 id="hero-title" className="text-[clamp(2.25rem,5.6vw,4.25rem)] font-extrabold leading-[1.04] tracking-[-0.02em] drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
            <span className="hero-rise block" style={{ animationDelay: "0.25s" }}>Win the lost.</span>
            <span className="hero-rise block" style={{ animationDelay: "0.45s" }}>Ground the saved.</span>
            <span className="hero-rise block" style={{ animationDelay: "0.65s" }}><span className="hero-shine">Send out soul winners.</span></span>
          </h1>

          <div className="hero-rise relative grid min-h-[3.5rem] w-full max-w-xl place-items-center overflow-hidden sm:min-h-[3.75rem]" style={{ animationDelay: "0.85s" }}>
            {heroLines.map((line, i) => (
              <p
                key={line}
                className="hero-say [grid-area:1/1] px-2 text-[clamp(1rem,1.7vw,1.25rem)] font-medium leading-snug text-pale"
                style={{ ["--i" as string]: i }}
              >
                {line}
              </p>
            ))}
          </div>

          <div className="hero-rise flex flex-wrap justify-center gap-3" style={{ animationDelay: "1.05s" }}>
            <Link href="/meetings/" className="btn btn-gold hero-pulse">
              Join Bible Club &amp; Training <ArrowRight size={18} />
            </Link>
            <Link href="/get-involved/" className="btn btn-line-light backdrop-blur-sm">
              Partner with the mission
            </Link>
          </div>
        </div>

        {/* A thin gold line fills as each photo plays */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
          <div className="hero-progress h-full bg-gold" />
        </div>
      </section>

      {/* Weekly meetings */}
      <section aria-labelledby="weekly-title" className="border-b border-line bg-mist">
        <div className="container-site flex flex-col gap-8 py-[clamp(3rem,6vw,4.5rem)]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              id="weekly-title"
              eyebrow="Every week"
              title="Trained and equipped to serve"
              intro="Our two core meetings: one to ground believers in the Word, one to send them out as soul winners."
            />
            <TextLink href="/meetings/">About the meetings</TextLink>
          </div>
          <ol className="overflow-hidden rounded-2xl bg-navy text-white">
            {meetings.map((m, i) => (
              <li key={m.id} className={i > 0 ? "border-t border-navy-line" : ""}>
                <Link
                  href={`/meetings/#${m.id}`}
                  className="group grid gap-x-10 gap-y-4 px-[clamp(1.25rem,4vw,3rem)] py-[clamp(1.5rem,3.5vw,2.5rem)] text-white no-underline hover:bg-navy-2 hover:text-white md:grid-cols-[15.5rem_1fr_auto] md:items-center"
                >
                  <div className="flex items-baseline gap-3 md:flex-col md:gap-1">
                    <span className="text-[clamp(1.89rem,3.33vw,2.405rem)] font-extrabold uppercase leading-none tracking-[-0.02em]">{m.day.replace("Every ", "")}</span>
                    <span className="text-xl font-bold text-gold">{m.time}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 md:border-l md:border-navy-line md:pl-10">
                    <h3 className="text-[clamp(1.235rem,1.98vw,1.485rem)] font-bold leading-tight">{m.name}</h3>
                    <p className="text-pale">{m.purpose}.</p>
                    <p className="flex items-start gap-2 pt-1 text-[0.9375rem] text-pale">
                      <span className="mt-0.5 text-gold">{m.online ? <Globe size={18} /> : <Pin size={18} />}</span>
                      <span><strong className="font-semibold text-white">{m.whereNote}:</strong> {m.where}</span>
                    </p>
                  </div>
                  <span className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-gold/60 px-5 text-sm font-semibold text-gold group-hover:bg-gold group-hover:text-navy md:self-center">
                    Join us <ArrowRight size={16} />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          <p className="flex items-center gap-3 text-[0.9375rem] text-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={meetingsLeader.photo} alt="" className="h-10 w-10 rounded-full object-cover object-top" />
            <span>Both led personally by <strong className="font-semibold text-navy">{meetingsLeader.name}</strong>, {meetingsLeader.role}.</span>
          </p>
          <Link href={childrenClub.href} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl bg-white px-6 py-4 text-ink no-underline shadow-[0_0_0_1px_var(--color-line)] hover:text-ink hover:shadow-[0_0_0_2px_var(--color-royal)]">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-royal">For children</span>
            <span className="font-semibold text-navy">{childrenClub.name}</span>
            <span className="font-bold text-royal">{childrenClub.day}, {childrenClub.time}</span>
            <span className="text-sm text-muted">Led by {childrenClub.leader}</span>
          </Link>
        </div>
      </section>

      {/* Next crusade */}
      {crusade && (
        <section aria-labelledby="crusade-title" className="bg-white">
          <div className="container-site section-pad flex flex-col gap-12 lg:flex-row">
            <div className="flex flex-col justify-between gap-8 rounded-3xl bg-navy p-10 text-white lg:w-[24rem]">
              <div className="flex flex-col gap-2">
                <p className="eyebrow-dark text-xs">Gospel crusade</p>
                <p className="text-[clamp(3.78rem,6.29vw,5.18rem)] font-extrabold leading-none tracking-[-0.04em]">9–13</p>
                <p className="text-2xl font-semibold">December 2026</p>
                <div className="my-3 h-[3px] w-18 bg-gold" />
                <p className="flex items-center gap-2.5 text-[1.0625rem]">
                  <span className="text-gold">
                    <Pin size={20} />
                  </span>
                  {crusade.place}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={`${crusade.href}#register`} className="btn btn-gold min-h-12 px-6">
                  Register to attend
                </Link>
                <Link href="/crusades/" className="btn btn-line-light min-h-12 px-6">
                  STRONGS Crusades
                </Link>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-5">
              <p className="eyebrow">The next crusade</p>
              <h2 id="crusade-title" className="text-[clamp(1.89rem,3.256vw,2.59rem)] font-bold leading-[1.08] tracking-[-0.02em] text-navy">
                {crusade.title}
              </h2>
              <p className="lead max-w-2xl text-muted">
                Five days of lifting up Christ in Sepeteri. Come and hear, come and serve, and pray that many will be saved.
              </p>
              <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { Icon: Megaphone, t: "Gospel meetings" },
                  { Icon: Cap, t: "Students' programme" },
                  { Icon: People, t: "Workers' conference" },
                  { Icon: Plus, t: "Medical mission" },
                ].map(({ Icon, t }) => (
                  <li key={t} className="flex flex-col items-center gap-2.5 rounded-2xl bg-mist px-3 py-5 text-center">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-navy text-gold"><Icon size={24} /></span>
                    <strong className="text-[0.9375rem] font-semibold leading-snug text-navy">{t}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Heritage */}
      <section aria-labelledby="heritage-title" className="bg-navy text-white">
        <div className="container-site section-pad flex flex-col gap-11">
          <SectionHeading
            dark
            id="heritage-title"
            eyebrow="Our heritage"
            title="We stand in a great line of witnesses"
            intro="STRONGS did not invent its burden. We carry what others carried before us."
          />
          <Slideshow
            label="Voices from our heritage"
            interval={7000}
            controls={false}
            className="mx-auto w-full max-w-4xl"
            slides={heritage.map((h) => (
              <figure key={h.who} className="flex h-full flex-col items-center justify-center gap-5 rounded-3xl bg-navy-2 px-[clamp(1.5rem,5vw,4rem)] py-[clamp(2.25rem,5vw,3.5rem)] text-center">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{h.era}</p>
                <blockquote className="text-[clamp(1.26rem,2.46vw,1.763rem)] font-semibold italic leading-snug">“{h.quote}”</blockquote>
                <figcaption className="text-[0.9375rem] text-pale">{h.who}</figcaption>
              </figure>
            ))}
          />
        </div>
      </section>

      {/* Fields of labour */}
      <section aria-labelledby="fields-title" className="bg-white">
        <div className="container-site section-pad flex flex-col gap-11">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading id="fields-title" eyebrow="The whole gospel to the whole man" title="Fields of labour"  />
            <TextLink href="/missions/">Our missions</TextLink>
          </div>
          <Carousel label="Fields of labour">
            {fields.map(({ icon: Icon, title, text, href }) => (
              <li key={title} className="flex w-[17rem]">
                <Link href={href} title={text} className="flex w-full flex-col items-start gap-4 rounded-3xl border border-line bg-white p-7 text-ink no-underline hover:border-royal hover:bg-mist">
                  <span className="grid h-16 w-16 place-items-center rounded-2xl bg-mist text-royal">
                    <Icon size={34} />
                  </span>
                  <span className="text-[1.1875rem] font-semibold leading-snug text-navy">{title}</span>
                </Link>
              </li>
            ))}
            <li className="flex w-[15rem]">
              <SeeMore href="/missions/" title="See all our missions" />
            </li>
          </Carousel>
        </div>
      </section>

      <Scripture
        text="The harvest truly is plenteous, but the labourers are few; pray ye therefore the Lord of the harvest, that he will send forth labourers into his harvest."
        reference="Matthew 9:37–38"
      />

      {/* From the field */}
      <section aria-labelledby="field-title" className="bg-white">
        <div className="container-site section-pad flex flex-col gap-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading id="field-title" eyebrow="From the mission field" title="Recent and upcoming outreaches" />
            <TextLink href="/calendar/">Full calendar</TextLink>
          </div>
          <Slideshow
            label="Recent and upcoming outreaches"
            arrows="overlay"
            dark={false}
            interval={6500}
            slides={fieldReports.map((e, i) => (
              <article key={e.title} className="relative isolate flex h-full min-h-[36rem] overflow-hidden rounded-3xl bg-navy text-white md:min-h-[27rem]">
                {e.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.image} alt="" aria-hidden="true" loading={i === 0 ? "eager" : "lazy"} className="absolute inset-0 -z-10 h-full w-full scale-125 object-cover opacity-45 blur-2xl" />
                )}
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy via-navy/80 to-navy/30 md:bg-gradient-to-r" />
                <div className="flex w-full flex-col-reverse justify-end gap-6 px-6 pb-8 pt-6 md:flex-row md:items-center md:justify-between md:gap-10 md:px-16 md:py-12">
                  <div className="flex min-w-0 flex-1 flex-col items-start gap-3">
                    <span className={`rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-[0.12em] ${e.status === "upcoming" ? "bg-gold text-navy" : "bg-royal text-white"}`}>
                      {e.status === "upcoming" ? "Upcoming" : "Recent"} · {e.kind}
                    </span>
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-gold-light">{e.dateLabel}</p>
                    <h3 className="text-[clamp(1.44rem,2.624vw,1.968rem)] font-bold leading-tight">{e.title}</h3>
                    <p className="line-clamp-3 max-w-xl text-pale">{e.summary}</p>
                    <Link href={e.href ?? "/calendar/"} className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 font-semibold text-white no-underline backdrop-blur-sm hover:bg-white/20 hover:text-white">
                      Read more <ArrowRight size={18} />
                    </Link>
                  </div>
                  {e.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.image} alt={e.imageAlt ?? `Flyer: ${e.title}`} loading={i === 0 ? "eager" : "lazy"} className="mx-auto h-60 w-auto max-w-full shrink-0 rounded-2xl object-contain shadow-[0_20px_50px_rgba(0,0,0,0.45)] md:mx-0 md:h-[21rem]" />
                  )}
                </div>
              </article>
            ))}
          />
        </div>
      </section>

      {/* Mandate */}
      <section aria-labelledby="mandate-title" className="bg-mist">
        <div className="container-site section-pad flex flex-col gap-11">
          <SectionHeading
            id="mandate-title"
            eyebrow="Why “The Spiritual Intellectuals”"
            title="We preach for decisions and teach for depth"
            intro="A convert must become a disciple, and a disciple a labourer."
          />
          <ol className="border-t-2 border-navy">
            {[
              { Icon: Book, t: "Spiritual depth", v: "Rooted and built up in him, and stablished in the faith.", ref: "Colossians 2:7" },
              { Icon: Lightbulb, t: "Intellectual soundness", v: "Of power, and of love, and of a sound mind.", ref: "2 Timothy 1:7" },
              { Icon: Shield, t: "Moral uprightness", v: "Live soberly, righteously, and godly, in this present world.", ref: "Titus 2:12" },
            ].map(({ Icon, t, v, ref }) => (
              <li key={t} className="grid gap-x-10 gap-y-3 border-b border-navy/20 py-7 md:grid-cols-[22rem_1fr] md:items-center">
                <h3 className="flex items-center gap-4 text-[clamp(1.33rem,1.98vw,1.575rem)] font-bold leading-tight text-navy">
                  <span className="grid h-12 w-12 flex-none place-items-center rounded-full bg-navy text-gold"><Icon size={24} /></span>
                  {t}
                </h3>
                <p className="text-[1.0625rem] font-medium italic text-navy">
                  “{v}” <span className="whitespace-nowrap text-sm font-semibold not-italic text-royal">{ref}</span>
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* College */}
      <section aria-labelledby="college-title" className="bg-navy text-white">
        <div className="container-site section-pad flex flex-col items-center gap-12 lg:flex-row">
          <div className="flex flex-1 flex-col gap-5">
            <p className="eyebrow-dark">A vision · Not yet open · Educational Mission</p>
            <h2 id="college-title" className="h2">STRONGS College</h2>
            <p className="text-[clamp(1.188rem,1.8vw,1.35rem)] font-medium italic text-gold">Raising disciples towards distinctive leadership</p>
            <ul className="flex flex-wrap gap-2.5">
              {[
                { Icon: Cap, t: "Academic excellence" },
                { Icon: Book, t: "Christ-centred" },
                { Icon: Globe, t: "Missions-minded" },
              ].map(({ Icon, t }) => (
                <li key={t} className="flex items-center gap-2 rounded-full bg-navy-2 px-4 py-2 text-sm font-semibold"><span className="text-gold"><Icon size={18} /></span>{t}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3.5 pt-1.5">
              <Link href="/college/" className="btn btn-gold">See the vision</Link>
              <Link href="/college/#join" className="btn btn-line-light">Pray and partner</Link>
            </div>
          </div>
          <div className="w-full flex-1 rounded-3xl bg-navy-2 p-[clamp(1.5rem,3vw,2.25rem)]">
            <p className="eyebrow-dark mb-5 text-xs">Where we are</p>
            <ol className="flex flex-col gap-3.5">
              {journey.map((j, i) => (
                <li key={j.step} className="flex items-center gap-3.5">
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                      i < journeyNow ? "bg-gold text-navy" : i === journeyNow ? "border-2 border-gold text-gold" : "border-2 border-navy-line text-pale"
                    }`}
                  >
                    {i < journeyNow ? "✓" : i + 1}
                  </span>
                  <span className="flex min-w-0 flex-col items-start gap-1">
                    {i === journeyNow && <span className="whitespace-nowrap rounded-full bg-gold px-2.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-navy">We are here</span>}
                    <span className={`leading-snug ${i === journeyNow ? "font-semibold text-gold" : i < journeyNow ? "text-white" : "text-pale"}`}>{j.step}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Communities */}
      <section aria-labelledby="communities-title" className="bg-mist">
        <div className="container-site section-pad flex flex-col items-center gap-12 lg:flex-row">
          <div className="flex flex-1 flex-col gap-5">
            <p className="eyebrow">STRONGS Communities</p>
            <h2 id="communities-title" className="h2 text-navy">Every gift has a place in the Kingdom</h2>
            <div className="flex flex-wrap gap-3.5 pt-1.5">
              <Link href="/communities/" className="btn btn-navy">Explore the communities</Link>
              <Link href="/communities/#join" className="btn btn-line">Join one</Link>
            </div>
          </div>
          <ul className="grid w-full flex-1 grid-cols-2 gap-3">
            {communities.map((c) => {
              const Icon = communityIcons[c.short] ?? People;
              return (
                <li key={c.short} className="flex flex-col items-center gap-2 rounded-2xl bg-white px-2 py-4 text-center text-[0.9375rem] font-semibold leading-tight text-navy sm:flex-row sm:gap-3 sm:px-4 sm:text-left">
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-mist text-royal"><Icon size={20} /></span>
                  {c.short}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Courses */}
      <section aria-labelledby="courses-title" className="bg-navy text-white">
        <div className="container-site section-pad flex flex-col gap-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              dark
              id="courses-title"
              eyebrow="STRONGS Courses · Learning and innovation"
              title="Sharpen your mind. Build your future."
            />
            <Link href="/courses/" className="inline-flex min-h-11 items-center gap-2 font-semibold text-gold no-underline hover:text-white">All courses <ArrowRight size={18} /></Link>
          </div>
          <Carousel dark label="Courses">
            {courses.filter((c) => c.featured).concat(courses.filter((c) => !c.featured)).slice(0, 12).map((c) => (
              <li key={c.slug} className="w-[17rem]"><CourseCard course={c} /></li>
            ))}
            <li className="flex w-[15rem]">
              <SeeMore dark href="/courses/" title="See all courses" />
            </li>
          </Carousel>
        </div>
      </section>

      {/* Articles */}
      <section aria-labelledby="articles-title" className="bg-white">
        <div className="container-site section-pad flex flex-col gap-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading id="articles-title" eyebrow="Sound words" title="Latest articles" intro="Short, searching words to stir your walk with God." />
            <TextLink href="/resources/">All articles</TextLink>
          </div>
          <Slideshow
            label="Latest articles"
            arrows="overlay"
            dark={false}
            interval={7000}
            slides={latest.map((a) => (
              <article key={a.slug} className="clean-slot relative isolate flex h-full min-h-[26rem] flex-col justify-end gap-3.5 overflow-hidden rounded-3xl px-7 pb-9 pt-20 text-white md:px-16 md:pb-12">
                <span aria-hidden="true" className="absolute -top-6 right-8 -z-10 font-serif text-[14rem] font-bold leading-none text-gold/20">“</span>
                <span className="self-start rounded-full bg-royal px-3.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white">{a.theme}</span>
                <h3 className="max-w-3xl text-[clamp(1.53rem,2.788vw,2.132rem)] font-bold leading-tight">{a.title}</h3>
                <p className="line-clamp-3 max-w-2xl text-pale">{a.excerpt}</p>
                <p className="text-sm text-gold-light">{a.author} · {a.minutes} min read</p>
                <Link href={`/resources/${a.slug}/`} className="mt-1 inline-flex min-h-12 items-center gap-2 self-start rounded-xl border border-white/30 bg-white/10 px-5 font-semibold text-white no-underline backdrop-blur-sm hover:bg-white/20 hover:text-white">
                  Read more <ArrowRight size={18} />
                </Link>
              </article>
            ))}
          />
        </div>
      </section>

      {/* Get involved */}
      <section aria-labelledby="involved-title" className="bg-mist">
        <div className="container-site section-pad flex flex-col gap-10">
          <SectionHeading
            id="involved-title"
            eyebrow="Get involved"
            title="Go with us. Pray for us. Hold the ropes."
                      />
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { Icon: PrayingHands, t: "Pray", href: "/get-involved/#contact" },
              { Icon: Globe, t: "Go", href: "/get-involved/#contact" },
              { Icon: Package, t: "Give in kind", href: "/get-involved/#contact" },
              { Icon: Heart, t: "Give", href: "/get-involved/#give" },
            ].map(({ Icon, t, href }) => (
              <li key={t} className="flex">
                <Link href={href} className="flex w-full flex-col items-center gap-3 rounded-2xl bg-white p-7 text-center no-underline hover:shadow-[0_0_0_2px_var(--color-royal)]">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-navy text-gold"><Icon size={30} /></span>
                  <span className="text-lg font-bold text-navy">{t}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3.5">
            <Link href="/get-involved/" className="btn btn-navy">Partner with the mission</Link>
            <Link href="/get-involved/#give" className="btn btn-line">Giving details</Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section aria-labelledby="newsletter-title" className="bg-white">
        <div className="container-site flex flex-col gap-8 py-16 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 lg:max-w-md">
            <h2 id="newsletter-title" className="text-[1.75rem] font-bold leading-tight text-navy">Field reports and prayer points</h2>
            <p className="text-muted">News from the mission field and what to pray for before each outreach.</p>
          </div>
          <StrongsForm
            formName="Newsletter"
            labelledBy="newsletter-title"
            submitLabel="Subscribe"
            className="w-full lg:max-w-xl"
            fields={[
              { name: "name", label: "Name", type: "text" },
              { name: "email", label: "Email address", type: "email", required: true },
            ]}
          />
        </div>
      </section>
    </>
  );
}

/** The last card in a home-page carousel, linking to the full list. */
function SeeMore({ href, title, text, dark = false }: { href: string; title: string; text?: string; dark?: boolean }) {
  return (
    <Link
      href={href}
      data-see-more
      className={`group flex w-full flex-col justify-center gap-3 rounded-3xl border-2 border-dashed p-7 no-underline ${
        dark ? "border-gold/60 text-white hover:border-gold hover:bg-navy-2 hover:text-white" : "border-royal/40 bg-mist text-navy hover:border-royal hover:text-navy"
      }`}
    >
      <span className={`grid h-12 w-12 place-items-center rounded-full ${dark ? "bg-gold text-navy" : "bg-navy text-white"}`}><ArrowRight size={22} /></span>
      <span className="text-xl font-bold leading-snug">{title}</span>
      {text && <span className={`text-[0.9375rem] ${dark ? "text-pale" : "text-muted"}`}>{text}</span>}
    </Link>
  );
}
