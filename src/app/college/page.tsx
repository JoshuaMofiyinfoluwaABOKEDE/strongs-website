import type { Metadata } from "next";
import Link from "next/link";
import { college } from "@/content/college";
import { PhotoSlot, SectionHeading } from "@/components/ui";
import { StrongsForm } from "@/components/Form";

export const metadata: Metadata = {
  title: "STRONGS College",
  description: `STRONGS College: ${college.motto}. A faith-based mission school under the STRONGS Educational Mission.`,
};

export default function CollegePage() {
  return (
    <>
      <section aria-labelledby="college-title" className="bg-navy text-white">
        <div className="container-site grid items-center gap-14 py-[clamp(3.5rem,8vw,6.5rem)] lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col gap-6">
            <nav aria-label="Breadcrumb" className="text-sm text-pale">
              <Link href="/missions/" className="text-pale hover:text-white">STRONGS Missions</Link>
              <span aria-hidden="true"> › </span>
              <Link href="/missions/#educational" className="text-pale hover:text-white">Educational Mission</Link>
              <span aria-hidden="true"> › </span>STRONGS College
            </nav>
            <p className="eyebrow-dark">STRONGS Educational Mission · A vision in progress</p>
            <h1 id="college-title" className="text-[clamp(2.75rem,5.6vw,4.5rem)] font-extrabold leading-[1.04] tracking-[-0.03em]">STRONGS College</h1>
            <p className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-medium italic leading-snug text-gold">{college.motto}</p>
            <p className="lead max-w-xl text-pale">{college.summary}</p>
            <div className="flex flex-wrap gap-3.5">
              <a href="#interest" className="btn btn-gold">Register your interest</a>
              <Link href="/get-involved/#contact" className="btn btn-line-light">Partner to build it</Link>
            </div>
          </div>
          <PhotoSlot dark label="STRONGS College" note="Pictures of the site coming soon" className="min-h-[28rem]" />
        </div>
      </section>

      <section aria-labelledby="vm-title" className="bg-white">
        <div className="container-site section-pad flex flex-col gap-10">
          <SectionHeading
            id="vm-title"
            eyebrow="Why STRONGS College"
            title="Education that goes beyond memorisation"
            intro="We believe education should empower students to think critically, solve problems and contribute meaningfully to society. The college offers a holistic, Christ-centred education that nurtures students academically, morally and spiritually."
          />
          <div className="grid gap-6 md:grid-cols-2">
            <article className="flex flex-col gap-3.5 rounded-3xl bg-navy p-10 text-white">
              <p className="eyebrow-dark text-xs">Our vision</p>
              <p className="text-[clamp(1.1rem,1.7vw,1.3rem)] font-medium leading-relaxed">{college.vision}</p>
            </article>
            <article className="flex flex-col gap-3.5 rounded-3xl bg-mist p-10">
              <p className="eyebrow text-xs">Our mission</p>
              <p className="text-[clamp(1.1rem,1.7vw,1.3rem)] font-medium leading-relaxed text-navy">{college.mission}</p>
            </article>
          </div>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {college.values.map((v) => (
              <li key={v} className="flex flex-col gap-1.5 rounded-2xl border-[1.5px] border-line p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold">Core value</p>
                <p className="text-2xl font-bold text-navy">{v}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="curr-title" className="bg-mist">
        <div className="container-site section-pad grid items-start gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <SectionHeading id="curr-title" eyebrow="Academics" title="Nigerian and British curricula" intro="A well-structured academic programme that produces students who are academically well grounded, morally upright and equipped as distinctive leaders." />
            <ul className="flex flex-col gap-3">
              {college.academics.map((a) => <li key={a} className="tick">{a}</li>)}
            </ul>
          </div>
          <div className="flex flex-col rounded-3xl bg-white p-[clamp(1.75rem,3.5vw,2.5rem)]">
            <p className="eyebrow mb-3 text-xs">External examinations</p>
            {college.exams.map((e) => (
              <div key={e.level} className="flex justify-between gap-4 border-t border-line py-4">
                <span className="font-semibold text-navy">{e.level}</span>
                <span className="text-right text-muted">{e.exam}</span>
              </div>
            ))}
            <p className="border-t border-line pt-3 text-sm text-muted">Students must meet both academic and behavioural standards to move to the next class.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="spirit-title" className="bg-navy text-white">
        <div className="container-site section-pad flex flex-col gap-10">
          <SectionHeading dark id="spirit-title" eyebrow="A school that sends" title="Discipleship and missions at the heart of school life" intro="Spiritual growth is pursued alongside academic excellence. Our goal is to lead every student to a personal relationship with Christ and to help them develop a biblical worldview." />
          <div className="grid gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
            {college.spiritual.map((s) => (
              <article key={s.title} className="flex flex-col gap-2 rounded-2xl bg-navy-2 p-7">
                <h3 className="text-xl font-semibold">{s.title}</h3>
                <p className="text-[0.9375rem] text-pale">{s.text}</p>
              </article>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border-[1.5px] border-gold px-7 py-6">
            <p className="text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold leading-none text-gold">20%</p>
            <p className="flex-[1_1_26rem]">{college.missionShare}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="believe-title" className="bg-white">
        <div className="container-site section-pad grid items-start gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <SectionHeading id="believe-title" eyebrow="What we believe" title="All truth comes from God" />
            <ul className="flex flex-col gap-3.5">
              {college.beliefs.map((b) => <li key={b} className="border-t border-line pt-3.5">{b}</li>)}
            </ul>
          </div>
          <div className="flex flex-col gap-5">
            <p className="eyebrow">Beyond the classroom</p>
            <h2 className="text-[clamp(1.6rem,2.8vw,2.1rem)] font-bold leading-tight text-navy">Sports, competitions and the arts</h2>
            <p className="lead text-muted">
              Soccer tournaments and sports, inter-house, inter-class and inter-school quiz competitions, music and arts, and excursions to places of interest, all played in the spirit of teamwork, discipline and Christian sportsmanship.
            </p>
            <div className="flex flex-col gap-1.5 rounded-2xl bg-mist p-6">
              <h3 className="text-lg font-semibold text-navy">Discipline with purpose</h3>
              <p className="text-[0.9375rem] text-muted">
                Zero tolerance for indiscipline, so that students grow in humility, responsibility, excellence and godliness. Students dress modestly and uphold Christian ethics at all times.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="lead-title" className="bg-mist">
        <div className="container-site section-pad flex flex-col gap-9">
          <SectionHeading id="lead-title" eyebrow="Leadership" title="Under the STRONGS Educational Mission" />
          <ul className="grid gap-4.5 sm:grid-cols-2 lg:grid-cols-5">
            {college.leadership.map((l) => (
              <li key={l.role} className="flex flex-col gap-1 rounded-2xl bg-white p-6">
                <p className="text-[0.8125rem] font-semibold text-royal">{l.role}</p>
                <p className={`text-lg font-semibold leading-snug ${l.name.startsWith("[") ? "text-muted" : "text-navy"}`}>{l.name}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="interest" aria-labelledby="interest-title" className="bg-white">
        <div className="container-site section-pad grid items-start gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div className="flex flex-col gap-5">
            <SectionHeading id="interest-title" eyebrow="Be part of it" title="Register your interest" intro="Tell us whether you are a parent looking ahead, a teacher with a calling, or a partner who wants to help build the college." />
            <div className="border-t border-line pt-3.5">
              <p className="font-semibold text-navy">For parents</p>
              <p className="text-[0.9375rem] text-muted">Admission is open to all who accept the school&apos;s Christian ethos and curriculum, through an entrance examination and interview.</p>
            </div>
            <div className="border-t border-line pt-3.5">
              <p className="font-semibold text-navy">For teachers</p>
              <p className="text-[0.9375rem] text-muted">Born-again Christians holding an NCE, B.Ed. or higher qualification in education or a related field.</p>
            </div>
          </div>
          <div className="rounded-3xl bg-mist p-[clamp(1.75rem,3.5vw,2.5rem)]">
            <StrongsForm
              formName="college-interest"
              labelledBy="interest-title"
              submitLabel="Register interest"
              fields={[
                { name: "name", label: "Full name", type: "text", required: true },
                { name: "phone", label: "Phone number", type: "tel", required: true },
                { name: "email", label: "Email", type: "email", wide: true },
                { name: "interest", label: "I am interested in", type: "select", options: ["Admission for my child", "Teaching at the college", "Partnering or giving"] },
                { name: "level", label: "Child's level (if applying)", type: "select", options: ["Not applying", "Primary", "Junior secondary", "Senior secondary"] },
              ]}
            />
          </div>
        </div>
      </section>
    </>
  );
}
