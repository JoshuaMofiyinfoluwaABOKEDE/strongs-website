import type { Metadata } from "next";
import { articles, themes } from "@/content/articles";
import { PageHero, PhotoSlot, SectionHeading } from "@/components/ui";
import { ArticleList } from "@/components/ArticleList";
import { site } from "@/content/site";
import { meetings } from "@/content/meetings";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resources",
  description: "Articles and teaching from STRONGS to help you understand Scripture accurately, grow in grace and win souls.",
};

export default function ResourcesPage() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Sound words for every believer"
        intro="Articles, Bible studies, sermons, audio and devotionals to help you understand Scripture accurately, grow in grace and win souls."
      >
        <p className="font-medium italic text-gold">“Hold fast the form of sound words.” · 2 Timothy 1:13</p>
      </PageHero>

      <section aria-labelledby="art-title" className="bg-white">
        <div className="container-site section-pad flex flex-col gap-8">
          <SectionHeading id="art-title" eyebrow="Articles" title="Short, searching words" intro="Writing by STRONGS commentators to stir your walk with God." />
          <ArticleList articles={articles} themes={themes} />
        </div>
      </section>

      <section aria-labelledby="club-title" className="bg-navy text-white">
        <div className="container-site section-pad grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col gap-5">
            <SectionHeading
              dark
              id="club-title"
              eyebrow="Every week"
              title="Bible Club and Evangelism Training"
              intro="Reading is good; being taught is better. Come to our two weekly meetings, where believers are grounded in the Word and trained to win souls."
            />
            <ul className="flex flex-col gap-2 text-pale">
              {meetings.map((m) => (
                <li key={m.id} className="tick">
                  <strong className="font-semibold text-white">{m.name}:</strong> {m.day}, {m.time} ({m.whereNote.toLowerCase()})
                </li>
              ))}
            </ul>
            <Link href="/meetings/" className="btn btn-gold self-start">Times, places and recent topics</Link>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/flyers/bible-club-james-humility.webp" alt="Bible Club flyer: The grave humiliation in the costly neglect of humility, James 4:6–10" loading="lazy" className="w-full rounded-2xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/flyers/training-singularity-gospel.webp" alt="Evangelism and Follow-up Training flyer: The Singularity of the Gospel, 1 Corinthians 15:1–4" loading="lazy" className="w-full rounded-2xl" />
          </div>
        </div>
      </section>

      <section aria-labelledby="media-title" className="bg-mist">
        <div className="container-site section-pad flex flex-col gap-8">
          <SectionHeading id="media-title" eyebrow="Coming soon" title="Sermons, audio and devotionals" intro="Recorded preaching from crusades and conferences, audio teaching and daily devotionals will be added here." />
          <div className="grid gap-4 sm:grid-cols-3">
            <PhotoSlot video label="Sermon recordings" note="Coming soon" className="h-48" />
            <PhotoSlot video label="Audio teaching" note="Coming soon" className="h-48" />
            <PhotoSlot label="Devotionals" note="Coming soon" className="h-48" />
          </div>
        </div>
      </section>

      <section aria-labelledby="write-title" className="bg-white">
        <div className="container-site flex flex-wrap items-center justify-between gap-6 py-18">
          <div className="flex max-w-2xl flex-col gap-3">
            <h2 id="write-title" className="text-[clamp(1.5rem,2.8vw,2.1rem)] font-bold leading-tight text-navy">Write, sing or teach with STRONGS</h2>
            <p className="lead text-muted">STRONGS began with symposiums for writers, musicians and teenagers. If God has given you a gift for opening up His Word, we would love to hear from you.</p>
          </div>
          <a href={`mailto:${site.email}?subject=Contributor`} className="btn btn-navy">Get in touch</a>
        </div>
      </section>
    </>
  );
}
