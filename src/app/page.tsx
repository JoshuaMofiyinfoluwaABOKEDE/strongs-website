import Link from "next/link";
import { site } from "@/content/site";
import { past, placesReached, upcoming } from "@/content/events";
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
import { ArrowRight, Book, Cap, Flame, Globe, Heart, Music, People, Pin, Plus, Sun } from "@/components/icons";

const heritage = [
  { era: "The Reformers", quote: "My conscience is captive to the Word of God.", who: "Martin Luther, 1521" },
  { era: "The Puritans", quote: "I preached as never sure to preach again, and as a dying man to dying men.", who: "Richard Baxter" },
  { era: "The revivalists", quote: "I look upon all the world as my parish.", who: "John Wesley, 1739" },
  { era: "World missions", quote: "Why should anyone hear the gospel twice before everyone has heard it once?", who: "Oswald J. Smith" },
  { era: "Africa's harvest", quote: "…to see hell empty and heaven full.", who: "Reinhard Bonnke" },
];

const fieldSlides: { src: string; alt: string; tag: string; caption: string; pos?: string }[] = [
  { src: "/images/photos/irele-assembly-1.webp", alt: "A STRONGS evangelist preaching to secondary-school students gathered for morning assembly", tag: "School mission", caption: "Preaching Christ at a school assembly, Irele, October 2026." },
  { src: "/images/photos/medical-school-talk-1.webp", alt: "Nurse Ruth Oduola giving a health talk to students", tag: "Medical mission", caption: "Nurse Ruth Oduola, Head of the Medical Mission, teaching students on health." },
  { src: "/images/photos/school-tla-1.webp", alt: "A STRONGS minister speaking with a microphone to a full classroom of students", tag: "School preaching", caption: "The gospel in the classroom." },
  { src: "/images/photos/irele-hall-preaching.webp", alt: "An evangelist ministering to students in a school hall with a thatched roof", tag: "Student outreach", caption: "Ministering to students during the Irele Student Outreach." },
  { src: "/images/photos/medical-school-talk-3.webp", alt: "A wide view of a hall full of students in different uniforms listening to a health talk", tag: "Medical mission", caption: "Students from several schools at a health talk." },
  { src: "/images/photos/teens-capacity-1.webp", alt: "A minister teaching from the pulpit while teenagers listen from the pews", tag: "Teenagers", caption: "Teenagers' Capacity Building, Sepeteri, September 2026." },
  { src: "/images/photos/founder-campus-aflame.webp", alt: "Joshua Mofiyinfoluwa ABOKEDE preaching at Campus aFlame", tag: "Campus mission", caption: "Campus aFlame: the gospel on university campuses.", pos: "center top" },
];

const fields = [
  { icon: Globe, title: "Crusades and open-air preaching", text: "The gospel proclaimed in streets, markets and town squares.", href: "/crusades/" },
  { icon: Flame, title: "Campus and school missions", text: "Campus aFlame, and gospel outreaches to universities and secondary schools.", href: "/missions/#school" },
  { icon: Cap, title: "Children and teens", text: "The Children’s Bible Club every Saturday, Children for Christ every year, and the Teenagers’ Community.", href: "/missions/#children" },
  { icon: Pin, title: "Rural evangelism", text: "Reaching towns and villages that few others visit.", href: "/crusades/" },
  { icon: Book, title: "Discipleship and Bible study", text: "The weekly Bible Club and Evangelism Training ground believers and make them soul winners.", href: "/meetings/" },
  { icon: People, title: "Conferences and mission training", text: "Students Mission Conference, Fire Conference and workers' training.", href: "/calendar/" },
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
      {/* Hero */}
      <section aria-labelledby="hero-title" className="bg-navy text-white">
        <div className="container-site flex flex-col items-center gap-14 py-[clamp(3.5rem,8vw,6.5rem)] lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <p className="eyebrow-dark">The gospel to every creature</p>
            <h1 id="hero-title" className="text-[clamp(2.5rem,5.2vw,4.25rem)] font-bold leading-[1.08] tracking-[-0.02em]">
              Win the lost. Ground the saved. <span className="text-gold">Send out soul winners.</span>
            </h1>
            <p className="lead max-w-xl text-pale">
              STRONGS is a non-denominational gospel mission. We carry the gospel to campuses, schools, towns and villages,
              root new believers in sound biblical teaching, and send them out to reach others. The fields are white unto
              harvest.
            </p>
            <div className="flex flex-wrap gap-3.5">
              <Link href="/meetings/" className="btn btn-gold">
                Join Bible Club &amp; Training <ArrowRight size={18} />
              </Link>
              <Link href="/get-involved/" className="btn btn-line-light">
                Partner with the mission
              </Link>
            </div>
            <p className="max-w-xl border-t border-navy-line pt-5 text-[1.0625rem] font-medium italic">
              “{site.watchword}”
            </p>
          </div>
          <Slideshow
            label="From the mission field"
            kenburns
            interval={5500}
            className="w-full min-w-0 flex-1"
            slides={fieldSlides.map((f, i) => (
              <figure key={f.src} className="relative h-[22rem] overflow-hidden rounded-3xl bg-navy-2 sm:h-[26rem] lg:h-[32rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.src} alt={f.alt} loading={i === 0 ? "eager" : "lazy"} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: f.pos ?? "center" }} />
                <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-navy/95 via-navy/60 to-transparent px-6 pb-5 pt-16">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-gold">{f.tag}</span>
                  <span className="text-[0.9375rem] font-medium text-white">{f.caption}</span>
                </figcaption>
              </figure>
            ))}
          />
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
              intro="Our two core meetings, where believers are grounded in the Word and made resolute, resilient and relentless soul winners."
            />
            <TextLink href="/meetings/">About the meetings</TextLink>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {meetings.map((m) => (
              <Link
                key={m.id}
                href={`/meetings/#${m.id}`}
                className="group flex flex-col gap-3 rounded-3xl border-t-[5px] border-gold bg-white p-[clamp(1.5rem,3vw,2.25rem)] text-ink no-underline shadow-[0_0_0_1px_var(--color-line)] hover:text-ink hover:shadow-[0_0_0_2px_var(--color-royal)]"
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-royal">{m.purpose}</p>
                <h3 className="text-[clamp(1.4rem,2.3vw,1.85rem)] font-bold leading-tight text-navy">{m.name}</h3>
                <p className="flex flex-wrap items-baseline gap-x-3">
                  <span className="text-[clamp(1.75rem,3vw,2.25rem)] font-extrabold leading-none tracking-[-0.02em] text-navy">{m.day}</span>
                  <span className="text-xl font-bold text-royal">{m.time}</span>
                </p>
                <p className="flex items-start gap-2 text-[0.9375rem] text-muted">
                  <span className="mt-0.5 text-royal">{m.online ? <Globe size={18} /> : <Pin size={18} />}</span>
                  <span><strong className="font-semibold text-navy">{m.whereNote}:</strong> {m.where}</span>
                </p>
                <span className="mt-auto pt-1 text-sm font-semibold text-royal group-hover:underline">Join us →</span>
              </Link>
            ))}
          </div>
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
                <p className="text-[clamp(4.5rem,8.5vw,7rem)] font-extrabold leading-none tracking-[-0.04em]">9–13</p>
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
              <h2 id="crusade-title" className="text-[clamp(2.25rem,4.4vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.02em] text-navy">
                {crusade.title}
              </h2>
              <p className="lead max-w-2xl text-muted">
                For five days we will lift up Christ in Sepeteri. Gospel meetings for the town, a programme for students, a
                conference to equip ministers and workers, and medical care for the community. Come and hear. Come and
                serve. Pray that many will be saved.
              </p>
              <ul className="grid gap-x-8 sm:grid-cols-2">
                {[
                  ["Gospel meetings", "Christ preached in the open to the whole town."],
                  ["Students' programme", "Reaching students and young adults."],
                  ["Ministers' and workers' conference", "Equipping labourers for follow-up."],
                  ["Medical mission", "Care by qualified professionals."],
                ].map(([t, d]) => (
                  <li key={t} className="border-t border-line py-4">
                    <strong className="block font-semibold text-navy">{t}</strong>
                    <span className="text-[0.9375rem] text-muted">{d}</span>
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
            intro="STRONGS did not invent its burden. We follow the Reformers who put the Bible back in the hands of the people, the Puritans who preached with eternity in view, the revivalists who saw whole regions awakened, and the missionaries who would not rest while any had not heard."
          />
          <Slideshow
            label="Voices from our heritage"
            interval={7000}
            className="mx-auto w-full max-w-4xl"
            slides={heritage.map((h) => (
              <figure key={h.who} className="flex h-full flex-col items-center justify-center gap-5 rounded-3xl bg-navy-2 px-[clamp(1.5rem,5vw,4rem)] py-[clamp(2.25rem,5vw,3.5rem)] text-center">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{h.era}</p>
                <blockquote className="text-[clamp(1.4rem,3vw,2.15rem)] font-semibold italic leading-snug">“{h.quote}”</blockquote>
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
            <SectionHeading id="fields-title" eyebrow="The whole gospel to the whole man" title="Fields of labour" intro="One mission, carried into every place the gospel is needed: spirit, soul and body." />
            <TextLink href="/missions/">Our missions</TextLink>
          </div>
          <Carousel label="Fields of labour">
            {fields.map(({ icon: Icon, title, text, href }) => (
              <li key={title} className="flex w-[17rem]">
                <Link href={href} className="flex w-full flex-col gap-2.5 rounded-3xl border border-line bg-white p-7 text-ink no-underline hover:border-royal hover:bg-mist">
                  <span className="text-royal">
                    <Icon size={30} />
                  </span>
                  <span className="text-[1.1875rem] font-semibold leading-snug text-navy">{title}</span>
                  <span className="text-[0.9375rem] text-muted">{text}</span>
                </Link>
              </li>
            ))}
            <li className="flex w-[15rem]">
              <SeeMore href="/missions/" title="See all our missions" text="Medical, School, Drama, Educational, Media and Children." />
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
                    <h3 className="text-[clamp(1.6rem,3.2vw,2.4rem)] font-bold leading-tight">{e.title}</h3>
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
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-2xl bg-mist px-6 py-5">
            <p className="mr-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-royal">The gospel has gone to</p>
            {placesReached.map((p, i) => (
              <span key={p} className="font-medium text-navy">
                {p}
                {i < placesReached.length - 1 && <span aria-hidden="true" className="ml-3.5 text-gold">·</span>}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Mandate */}
      <section aria-labelledby="mandate-title" className="bg-mist">
        <div className="container-site section-pad flex flex-col gap-11">
          <SectionHeading
            id="mandate-title"
            eyebrow="Why “The Spiritual Intellectuals”"
            title="We preach for decisions and teach for depth"
            intro="A convert must become a disciple, and a disciple must become a labourer. So we raise believers who are deep in God, sound in mind and upright in life."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              ["I", "Spiritual depth", "Biblical understanding, prayer, discipleship and growth in Christ-like character."],
              ["II", "Intellectual soundness", "Thoughtful engagement with Scripture, clear reasoning and responsible communication."],
              ["III", "Moral uprightness", "Integrity, discipline and responsibility, so that what we believe shows in how we live."],
            ].map(([n, t, d]) => (
              <article key={t} className="flex flex-col gap-3 rounded-3xl border-t-[5px] border-gold bg-white p-8">
                <p className="text-4xl font-extrabold leading-none text-royal">{n}</p>
                <h3 className="text-2xl font-bold text-navy">{t}</h3>
                <p className="text-muted">{d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* College */}
      <section aria-labelledby="college-title" className="bg-navy text-white">
        <div className="container-site section-pad flex flex-col items-center gap-12 lg:flex-row">
          <div className="flex flex-1 flex-col gap-5">
            <p className="eyebrow-dark">A vision · Not yet open · Educational Mission</p>
            <h2 id="college-title" className="h2">STRONGS College</h2>
            <p className="text-[clamp(1.25rem,2vw,1.5rem)] font-medium italic text-gold">Raising disciples towards distinctive leadership</p>
            <p className="lead text-pale">
              A plan for a faith-based mission school for primary and secondary students: high academic standards,
              Christ-centred discipleship and a heart for missions. We are praying and planning towards it.
            </p>
            <div className="flex flex-wrap gap-3.5 pt-1.5">
              <Link href="/college/" className="btn btn-gold">See the vision</Link>
              <Link href="/college/#join" className="btn btn-line-light">Pray and partner</Link>
            </div>
          </div>
          <div className="w-full flex-1 rounded-3xl bg-navy-2 p-[clamp(1.5rem,3vw,2.25rem)]">
            <p className="eyebrow-dark mb-5 text-xs">Where we are</p>
            <ol className="flex flex-col gap-3">
              {journey.map((j, i) => (
                <li key={j.step} className="flex items-center gap-3.5">
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                      i < journeyNow ? "bg-gold text-navy" : i === journeyNow ? "border-2 border-gold text-gold" : "border-2 border-navy-line text-pale"
                    }`}
                  >
                    {i < journeyNow ? "✓" : i + 1}
                  </span>
                  <span className={i === journeyNow ? "font-semibold text-gold" : i < journeyNow ? "text-white" : "text-pale"}>{j.step}</span>
                  {i === journeyNow && <span className="rounded-full bg-gold px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wide text-navy">We are here</span>}
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
            <p className="lead text-muted">
              Interest-based communities where writers, musicians, teenagers, thinkers, creatives, speakers, young
              professionals and readers connect, learn from experienced hands and produce meaningful work together.
            </p>
            <div className="flex flex-wrap gap-3.5 pt-1.5">
              <Link href="/communities/" className="btn btn-navy">Explore the communities</Link>
              <Link href="/communities/#join" className="btn btn-line">Join one</Link>
            </div>
          </div>
          <ul className="grid w-full flex-1 grid-cols-2 gap-3">
            {communities.map((c) => (
              <li key={c.short} className="rounded-2xl bg-white px-5 py-4.5 font-semibold text-navy">{c.short}</li>
            ))}
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
              intro={`${courses.length} short courses for spiritual intellectuals: writing, music, media and design, leadership, health, digital skills, enterprise and sound biblical thinking. Study online, a few hours a week.`}
            />
            <Link href="/courses/" className="inline-flex min-h-11 items-center gap-2 font-semibold text-gold no-underline hover:text-white">All courses <ArrowRight size={18} /></Link>
          </div>
          <Carousel dark label="Courses">
            {courses.filter((c) => c.featured).concat(courses.filter((c) => !c.featured)).slice(0, 12).map((c) => (
              <li key={c.slug} className="w-[17rem]"><CourseCard course={c} /></li>
            ))}
            <li className="flex w-[15rem]">
              <SeeMore dark href="/courses/" title="See all courses" text={`${courses.length} short courses in 8 subjects.`} />
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
                <h3 className="max-w-3xl text-[clamp(1.7rem,3.4vw,2.6rem)] font-bold leading-tight">{a.title}</h3>
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
            intro="Every crusade, campus mission and conference is carried by those who go, those who pray and those who give so that others can go."
          />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Pray", "Stand with the mission team before and during every outreach."],
              ["Go", "Serve on a team at crusades, conferences and campus outreaches."],
              ["Give in kind", "Bibles, study materials, transport, feeding or a venue."],
              ["Give", "Send labourers into the harvest through official channels."],
            ].map(([t, d]) => (
              <li key={t} className="flex flex-col gap-2 rounded-2xl bg-white p-7">
                <p className="flex items-center gap-2 text-[1.375rem] font-bold text-navy">
                  {t === "Give" && <span className="text-royal"><Heart size={22} /></span>}
                  {t}
                </p>
                <p className="text-[0.9375rem] text-muted">{d}</p>
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
function SeeMore({ href, title, text, dark = false }: { href: string; title: string; text: string; dark?: boolean }) {
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
      <span className={`text-[0.9375rem] ${dark ? "text-pale" : "text-muted"}`}>{text}</span>
    </Link>
  );
}
