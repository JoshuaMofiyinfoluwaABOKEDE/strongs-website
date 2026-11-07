import type { Metadata } from "next";
import { giving, site } from "@/content/site";
import { PageHero, Scripture, SectionHeading } from "@/components/ui";
import { StrongsForm } from "@/components/Form";
import { CopyButton } from "@/components/CopyButton";
import { Flame, Heart, Mail, Package, People, Phone, Pin, Shield } from "@/components/icons";

export const metadata: Metadata = {
  title: "Get involved",
  description: "Pray, go and give with STRONGS. Partnership pathways, official giving details and how to reach us.",
};

const ways = [
  { icon: Flame, title: "Pray", text: "Intercede for every outreach, the mission team and the souls we will meet." },
  { icon: People, title: "Go", text: "Serve on a team at crusades, conferences and campus outreaches." },
  { icon: Package, title: "Give in kind", text: "Bibles, study materials, transport, feeding, a venue or professional services." },
  { icon: Heart, title: "Give", text: "Send labourers into the harvest through official channels only." },
];

const pathways = [
  { title: "Churches and ministries", text: "Co-host outreaches, send workers and welcome new believers into your fellowship." },
  { title: "Schools and campus groups", text: "Open your gates to a programme and co-organise student events." },
  { title: "Christian media", text: "Coverage, content collaboration and livestream support." },
  { title: "Preachers and teachers", text: "Minister or lead workshops in line with our statement of faith." },
  { title: "Values-aligned sponsors", text: "Event sponsorship and in-kind support, with no influence on doctrine." },
  { title: "Individuals and families", text: "Pray, go and give, and help build STRONGS College." },
];

export default function GetInvolvedPage() {
  return (
    <>
      <PageHero
        eyebrow="Get involved"
        title={<>Go with us. Pray for us. <span className="text-gold">Hold the ropes.</span></>}
        intro="Every crusade, campus mission and conference is carried by those who go, those who pray and those who give so that others can go. There is a place for you in the harvest."
      >
        <div className="flex flex-wrap gap-3.5 pt-1">
          <a href="#contact" className="btn btn-gold">Join the mission</a>
          <a href="#give" className="btn btn-line-light">Giving details</a>
        </div>
      </PageHero>

      <section aria-labelledby="ways-title" className="bg-white">
        <div className="container-site flex flex-col gap-8 pb-[clamp(3rem,6vw,4.5rem)] pt-[clamp(4rem,8vw,6.5rem)]">
          <SectionHeading id="ways-title" title="Four ways to stand with the mission" />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ways.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex flex-col gap-2.5 rounded-3xl bg-mist p-7">
                <span className="text-royal"><Icon size={30} /></span>
                <h3 className="text-[1.375rem] font-bold text-navy">{title}</h3>
                <p className="text-[0.9375rem] text-muted">{text}</p>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 rounded-3xl border-[1.5px] border-line px-7 py-5">
            <p className="eyebrow text-xs">Every student outreach needs</p>
            <p className="font-semibold text-navy">Prayer · Bibles and study materials · Transport · Feeding</p>
          </div>
        </div>
      </section>

      <Scripture
        dark
        text="How then shall they call on him in whom they have not believed? and how shall they believe in him of whom they have not heard? and how shall they hear without a preacher? And how shall they preach, except they be sent?"
        reference="Romans 10:14–15"
      />

      <section aria-labelledby="paths-title" className="bg-mist">
        <div className="container-site section-pad flex flex-col gap-8">
          <SectionHeading id="paths-title" eyebrow="Partnership pathways" title="Labour together in the harvest" />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pathways.map((p) => (
              <li key={p.title} className="flex flex-col gap-2 rounded-3xl bg-white p-7">
                <h3 className="text-xl font-semibold text-navy">{p.title}</h3>
                <p className="text-[0.9375rem] text-muted">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="give" aria-labelledby="give-title" className="bg-white">
        <div className="container-site section-pad flex flex-col gap-8">
          <SectionHeading id="give-title" eyebrow="Give" title="Official giving details" />
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div className="grid gap-x-10 gap-y-6 rounded-3xl border-2 border-navy p-[clamp(1.75rem,3.5vw,2.75rem)] sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Account number</p>
                <p className="text-[2rem] font-bold tracking-wide text-navy">{giving.accountNumber}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Bank</p>
                <p className="text-[2rem] font-bold text-navy">{giving.bank}</p>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Account name</p>
                <p className="text-lg font-medium">{giving.accountName}</p>
              </div>
              <CopyButton text={giving.accountNumber} label="Copy account number" />
            </div>
            <div className="flex flex-col gap-3.5 rounded-3xl bg-navy p-[clamp(1.75rem,3.5vw,2.5rem)] text-white">
              <span className="text-gold"><Shield size={32} /></span>
              <h3 className="text-2xl font-bold text-gold">Give safely</h3>
              <p className="text-pale">
                Only give through channels listed in official STRONGS communication. If in doubt, confirm by emailing{" "}
                <a href={`mailto:${site.email}`} className="font-semibold text-white">{site.email}</a> before you give.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" aria-labelledby="contact-title" className="bg-mist">
        <div className="container-site section-pad grid items-start gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div className="flex flex-col gap-5">
            <SectionHeading id="contact-title" eyebrow="Contact" title="Let's build together" intro="Tell us how God is leading you to help, and we will get back to you." />
            <ul className="flex flex-col gap-4 pt-2">
              <li className="flex items-center gap-3.5"><span className="text-royal"><Mail size={22} /></span><a href={`mailto:${site.email}`} className="font-semibold">{site.email}</a></li>
              <li className="flex items-center gap-3.5"><span className="text-royal"><Phone size={22} /></span><a href={site.phoneHref} className="font-semibold">{site.phone}</a></li>
              <li className="flex items-center gap-3.5"><span className="text-royal"><Pin size={22} /></span>{site.address}</li>
            </ul>
          </div>
          <div className="rounded-3xl bg-white p-[clamp(1.75rem,3.5vw,2.75rem)]">
            <StrongsForm
              formName="contact"
              labelledBy="contact-title"
              submitLabel="Send message"
              fields={[
                { name: "name", label: "Full name", type: "text", required: true },
                { name: "phone", label: "Phone number", type: "tel" },
                { name: "email", label: "Email", type: "email", required: true },
                { name: "organisation", label: "Church, school or organisation (optional)", type: "text" },
                {
                  name: "help",
                  label: "How would you like to help?",
                  type: "select",
                  wide: true,
                  options: [
                    "Pray with the mission",
                    "Go with an outreach team",
                    "Give in kind",
                    "Partner as a church or ministry",
                    "Host at a school or campus",
                    "Media coverage or livestream",
                    "Preach or teach",
                    "Sponsor an event",
                    "Help build STRONGS College",
                    "Something else",
                  ],
                },
                { name: "message", label: "Message", type: "textarea" },
              ]}
            />
          </div>
        </div>
      </section>
    </>
  );
}
