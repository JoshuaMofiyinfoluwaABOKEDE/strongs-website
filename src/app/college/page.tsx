import type { Metadata } from "next";
import Link from "next/link";
import { college, journey, journeyNow as now } from "@/content/college";
import { SectionHeading } from "@/components/ui";
import { StrongsForm } from "@/components/Form";
import { Book, Cap, Heart, People, Sun } from "@/components/icons";

export const metadata: Metadata = {
  title: "STRONGS College: the vision",
  description: `STRONGS College is a plan of the STRONGS Educational Mission: a faith-based mission school. ${college.motto}.`,
};


const school = [
  {
    Icon: Book,
    title: "Learning",
    points: [
      "Nigerian and British curricula, from primary to senior secondary",
      ...college.exams.map((e) => `${e.level}: ${e.exam}`),
      "Science and technology, humanities and business",
    ],
  },
  {
    Icon: Heart,
    title: "Faith",
    points: college.spiritual.map((s) => `${s.title}: ${s.text}`),
  },
  {
    Icon: Sun,
    title: "Life",
    points: [
      "Sports, quizzes, music and the arts",
      "Excursions to places of interest",
      "Discipline with purpose: humility, responsibility, excellence and godliness",
    ],
  },
];

export default function CollegePage() {
  return (
    <>
      <section aria-labelledby="college-title" className="bg-navy text-white">
        <div className="container-site grid items-center gap-14 py-[clamp(3.5rem,8vw,6.5rem)] lg:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col gap-6">
            <nav aria-label="Breadcrumb" className="text-sm text-pale">
              <Link href="/missions/" className="text-pale hover:text-white">STRONGS Missions</Link>
              <span aria-hidden="true"> › </span>
              <Link href="/missions/#educational" className="text-pale hover:text-white">Educational Mission</Link>
              <span aria-hidden="true"> › </span>STRONGS College
            </nav>
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-gold px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-gold">
              A vision · Not yet open
            </p>
            <h1 id="college-title" className="text-[clamp(2.75rem,5.6vw,4.5rem)] font-extrabold leading-[1.04] tracking-[-0.03em]">STRONGS College</h1>
            <p className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-medium italic leading-snug text-gold">{college.motto}</p>
            <p className="lead max-w-xl text-pale">
              STRONGS College is a plan the Lord has laid on our hearts: a faith-based, co-educational mission school for primary and
              secondary students. It is not open yet. This page shares what we are praying and planning towards, and how you can
              be part of it from the start.
            </p>
            <div className="flex flex-wrap gap-3.5">
              <a href="#join" className="btn btn-gold">Pray and partner with us</a>
              <a href="#journey" className="btn btn-line-light">Where we are</a>
            </div>
          </div>

          <div id="journey" className="rounded-3xl bg-navy-2 p-[clamp(1.5rem,3vw,2.25rem)]">
            <p className="eyebrow-dark mb-5 text-xs">The journey so far</p>
            <ol className="flex flex-col">
              {journey.map((j, i) => {
                const done = i < now;
                const current = i === now;
                return (
                  <li key={j.step} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < journey.length - 1 && (
                      <span aria-hidden="true" className={`absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 ${done ? "bg-gold" : "bg-navy-line"}`} />
                    )}
                    <span
                      className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                        done ? "bg-gold text-navy" : current ? "border-2 border-gold bg-navy text-gold" : "border-2 border-navy-line text-pale"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <p className={`font-semibold ${current ? "text-gold" : "text-white"}`}>
                        {j.step}
                        {current && <span className="ml-2 rounded-full bg-gold px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wide text-navy">We are here</span>}
                      </p>
                      <p className="text-sm text-pale">{j.text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      <section aria-labelledby="vm-title" className="bg-white">
        <div className="container-site section-pad flex flex-col gap-10">
          <SectionHeading
            id="vm-title"
            eyebrow="The vision"
            title="Education that raises disciples"
            intro="We believe education should help young people think, solve problems and serve. The college we see will nurture students academically, morally and spiritually, with Christ at the centre."
          />
          <div className="grid gap-6 md:grid-cols-2">
            <article className="flex flex-col gap-3.5 rounded-3xl bg-navy p-10 text-white">
              <p className="eyebrow-dark text-xs">Vision</p>
              <p className="text-[clamp(1.1rem,1.7vw,1.3rem)] font-medium leading-relaxed">{college.vision}</p>
            </article>
            <article className="flex flex-col gap-3.5 rounded-3xl bg-mist p-10">
              <p className="eyebrow text-xs">Mission</p>
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

      <section aria-labelledby="see-title" className="bg-mist">
        <div className="container-site section-pad flex flex-col gap-10">
          <SectionHeading
            id="see-title"
            eyebrow="The plan"
            title="The school we see"
            intro="This is the plan as it stands today. It will grow and be refined as we pray and build."
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {school.map(({ Icon, title, points }) => (
              <article key={title} className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-[0_0_0_1px_var(--color-line)]">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-navy text-gold"><Icon size={22} /></span>
                <h3 className="text-2xl font-bold text-navy">{title}</h3>
                <ul className="flex flex-col gap-2.5">
                  {points.map((p) => <li key={p} className="tick text-[0.9375rem]">{p}</li>)}
                </ul>
              </article>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border-[1.5px] border-gold bg-white px-7 py-6">
            <p className="text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold leading-none text-royal">20%</p>
            <p className="flex-[1_1_26rem]">The plan is that 20% {college.missionShare}</p>
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
            <SectionHeading id="team-title" eyebrow="Carrying the vision" title="The planning team" />
            <ul className="flex flex-col">
              {college.leadership.map((l) => (
                <li key={l.role} className="flex flex-wrap justify-between gap-x-4 gap-y-0.5 border-t border-line py-3.5">
                  <span className={`font-semibold ${l.name.startsWith("[") ? "text-muted" : "text-navy"}`}>{l.name}</span>
                  <span className="text-sm text-royal">{l.role}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="join" aria-labelledby="join-title" className="bg-navy text-white">
        <div className="container-site section-pad grid items-start gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div className="flex flex-col gap-6">
            <SectionHeading dark id="join-title" eyebrow="Be part of it from the start" title="How you can help now" />
            <ul className="flex flex-col gap-4">
              {[
                { Icon: Heart, t: "Pray", d: "For wisdom, provision and the right people for the college." },
                { Icon: People, t: "Partner", d: "Give, or help us find land, materials and expertise." },
                { Icon: Cap, t: "Teachers and parents", d: "If you see yourself in this vision, let us know. We will keep you informed." },
              ].map(({ Icon, t, d }) => (
                <li key={t} className="flex gap-4">
                  <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy-2 text-gold"><Icon size={20} /></span>
                  <div>
                    <p className="font-semibold">{t}</p>
                    <p className="text-[0.9375rem] text-pale">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-white p-[clamp(1.75rem,3.5vw,2.5rem)] text-ink">
            <StrongsForm
              formName="college-interest"
              labelledBy="join-title"
              submitLabel="Keep me informed"
              fields={[
                { name: "name", label: "Full name", type: "text", required: true },
                { name: "phone", label: "Phone number", type: "tel", required: true },
                { name: "email", label: "Email", type: "email", wide: true },
                { name: "interest", label: "I would like to", type: "select", options: ["Pray for the college", "Partner or give", "Teach there one day", "Hear when admission opens", "Just stay informed"] },
              ]}
            />
          </div>
        </div>
      </section>
    </>
  );
}
