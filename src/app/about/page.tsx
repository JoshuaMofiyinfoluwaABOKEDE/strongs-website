import type { Metadata } from "next";
import Link from "next/link";
import { leaders, site } from "@/content/site";
import { PageHero, Photo, Portrait, Scripture, SectionHeading } from "@/components/ui";
import { Book, Check, Cross, Globe, Handshake, Lightbulb, Plus, Shield } from "@/components/icons";

export const metadata: Metadata = {
  title: "Who we are",
  description: "STRONGS, The Spiritual Intellectuals: a Christian, non-denominational gospel mission led by its General Coordinator, Joshua Mofiyinfoluwa ABOKEDE.",
};

const convictions = [
  { icon: Cross, title: "Christ at the centre" },
  { icon: Book, title: "Grounded in Scripture" },
  { icon: Lightbulb, title: "Sound in thought" },
  { icon: Globe, title: "Sent to the nations" },
];

const principles = [
  { icon: Shield, title: "Dignity and consent" },
  { icon: Plus, title: "Qualified practitioners" },
  { icon: Handshake, title: "Local partnership" },
  { icon: Check, title: "Honest reporting" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Who we are"
        title="A gospel mission raising spiritual intellectuals"
        intro="A Christian, non-denominational mission: we preach Christ, teach the Word and equip a generation to serve."
      />

      <section aria-labelledby="story-title" className="bg-white">
        <div className="container-site section-pad grid items-start gap-14 lg:grid-cols-[1.1fr_1fr]">
          <Photo
            src="/images/photos/abokede-campus-aflame.webp"
            alt="Joshua Mofiyinfoluwa ABOKEDE, General Coordinator of STRONGS, preaching with a microphone at Campus aFlame"
            caption={<>{site.coordinator}, General Coordinator, preaching at Campus aFlame, LAUTECH.</>}
            className="lg:sticky lg:top-28"
            imgClassName="aspect-[5/4]"
          />
          <div className="flex flex-col gap-5">
            <SectionHeading id="story-title" eyebrow="Our story" title="Born of a burden for souls and for the Word" />
            <p className="text-lg font-medium text-navy">
              STRONGS began with a divine call in {site.founded}: a burden laid on {site.coordinator}, our General Coordinator, to reach secondary-school students with the gospel.
            </p>
            <p className="lead text-muted">
              Two burdens have driven the work ever since: to see sinners turned to saints and saints turned to soul winners, and to raise believers who handle the Word of God rightly. A company of Bible students and young believers saw how many people longed to understand Scripture but could not find teaching that was sound, practical and plain.
            </p>
            <p className="lead text-muted">
              We began with symposiums for writers, musicians and teenagers, and with articles that opened up the Scriptures in clear, simple language. The burden grew. Today our teams preach in crusades and open-air meetings, on campuses and in secondary schools, in towns and in villages, and gather believers for Bible study, prayer and mission conferences.
            </p>
            <blockquote className="border-l-[3px] border-gold pl-5 text-lg font-medium italic leading-relaxed text-navy">
              Every generation needs its preacher; this generation needs Elijahs.
            </blockquote>
            <p className="lead text-muted">
              Our dream was shaped by a line from Nigeria&apos;s former national anthem, “Help our youth the truth to know”. We labour to reveal Jesus, who is the Way, the Truth and the Life, to the young, and through them to every age.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="vision-title" className="bg-mist">
        <div className="container-site section-pad flex flex-col gap-10">
          <SectionHeading id="vision-title" eyebrow="Why we exist" title="Vision and mission" />
          <div className="grid gap-6 md:grid-cols-2">
            <article className="flex flex-col gap-3.5 rounded-3xl bg-navy p-10 text-white">
              <p className="eyebrow-dark text-xs">Vision</p>
              <p className="text-[clamp(1.2rem,1.9vw,1.45rem)] font-medium leading-relaxed">
                To raise a generation of believers who are deeply grounded in God&apos;s Word, intellectually sound in the truth of Scripture, and actively engaged in fulfilling the Great Commission.
              </p>
            </article>
            <article className="flex flex-col gap-3.5 rounded-3xl bg-white p-10">
              <p className="eyebrow text-xs">Mission</p>
              <p className="text-[clamp(1.2rem,1.9vw,1.45rem)] font-medium leading-relaxed text-navy">
                To make biblical truth accessible, clear, and practical through sound teaching, discipleship resources, and evangelistic content that helps believers grow in faith, understand Scripture accurately, and become effective witnesses of Christ.
              </p>
            </article>
          </div>
          <div className="flex flex-col gap-4 pt-2">
            <p className="eyebrow">Our convictions</p>
            <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {convictions.map(({ icon: Icon, title }) => (
                <li key={title} className="flex flex-col items-center gap-3 rounded-2xl bg-white px-4 py-6 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-navy text-gold"><Icon size={26} /></span>
                  <h3 className="text-lg font-semibold leading-snug text-navy">{title}</h3>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Scripture dark text="Go ye into all the world, and preach the gospel to every creature." reference="Mark 16:15" />

      <section aria-labelledby="team-title" className="bg-white">
        <div className="container-site section-pad flex flex-col gap-10">
          <SectionHeading id="team-title" eyebrow="Leadership" title="Labourers who lead" />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {leaders.map((l) => (
              <li key={l.name} className="flex flex-col gap-2 rounded-3xl bg-mist p-7">
                <div className="mb-2"><Portrait photo={l.photo} alt={`Portrait of ${l.name}`} initials={l.photo ? undefined : l.initials} /></div>
                <h3 className="text-lg font-semibold leading-snug text-navy">{l.name}</h3>
                <p className="text-sm font-semibold text-royal">{l.role}</p>
                <p className="text-[0.9375rem] text-muted">{l.bio}</p>
              </li>
            ))}
          </ul>
          <p className="text-[0.9375rem] text-muted">
            Each arm of the work has its own leadership: see <Link href="/crusades/">STRONGS Crusades</Link> and <Link href="/missions/">STRONGS Missions</Link>.
          </p>
        </div>
      </section>

      <section aria-labelledby="serve-title" className="bg-mist">
        <div className="container-site section-pad grid items-start gap-14 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <SectionHeading
              id="serve-title"
              eyebrow="Mercy alongside the message"
              title="Faith expressed through responsible service"
            />
            <blockquote className="border-t border-pale pt-5 text-xl font-medium italic leading-relaxed text-navy">
              “As we have therefore opportunity, let us do good unto all men.”
              <span className="mt-2 block text-sm font-semibold not-italic text-royal">Galatians 6:10 · KJV</span>
            </blockquote>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {principles.map(({ icon: Icon, title }) => (
              <li key={title} className="flex items-center gap-4 rounded-2xl bg-white p-5">
                <span className="grid h-12 w-12 flex-none place-items-center rounded-full bg-mist text-royal"><Icon size={24} /></span>
                <h3 className="text-lg font-semibold leading-snug text-navy">{title}</h3>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="about-cta" className="bg-white">
        <div className="container-site flex flex-wrap items-center justify-between gap-6 py-18">
          <h2 id="about-cta" className="max-w-2xl text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight text-navy">
            The harvest is waiting. Will you go, pray or give?
          </h2>
          <div className="flex flex-wrap gap-3.5">
            <Link href="/get-involved/" className="btn btn-navy">Join the mission</Link>
            <a href={`mailto:${site.email}`} className="btn btn-line">Email us</a>
          </div>
        </div>
      </section>
    </>
  );
}
