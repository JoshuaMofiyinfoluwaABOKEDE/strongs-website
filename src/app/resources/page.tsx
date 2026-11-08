import type { Metadata } from "next";
import { articles, themes } from "@/content/articles";
import { PageHero, SectionHeading } from "@/components/ui";
import { books } from "@/content/books";
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
          <SectionHeading id="art-title" eyebrow="Articles" title="Short, searching words" intro="Writing by STRONGS commentators and authors to stir your walk with God." />
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

      <section id="books" aria-labelledby="books-title" className="bg-mist">
        <div className="container-site section-pad flex flex-col gap-10">
          <SectionHeading id="books-title" eyebrow="Books" title="Books from the STRONGS family" intro="Longer writing to read, keep and share." />
          {books.map((b) => {
            const excerpts = articles.filter((a) => a.book === b.slug);
            return (
              <article key={b.slug} className="grid items-start gap-10 rounded-3xl bg-white p-[clamp(1.5rem,4vw,3rem)] shadow-[0_0_0_1px_var(--color-line)] md:grid-cols-[minmax(0,15rem)_1fr]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.cover} alt={`Cover of ${b.title} by ${b.author}`} loading="lazy" className="mx-auto w-full max-w-[15rem] rounded-xl shadow-[0_18px_40px_rgba(11,31,58,0.25)]" />
                <div className="flex flex-col gap-4">
                  <p className="text-sm font-semibold text-royal">By {b.author} · Foreword by {b.foreword} · {b.pages} pages</p>
                  <h3 className="text-[clamp(1.6rem,3vw,2.3rem)] font-bold leading-tight text-navy">{b.title}</h3>
                  <p className="lead text-muted">{b.summary}</p>
                  <div>
                    <p className="eyebrow mb-2 text-xs">Chapters</p>
                    <ol className="grid gap-1.5 sm:grid-cols-2">
                      {b.chapters.map((c, i) => <li key={c} className="text-[0.9375rem]"><span className="font-semibold text-royal">{i + 1}.</span> {c}</li>)}
                    </ol>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <a href={b.pdf} target="_blank" rel="noopener" className="btn btn-navy">Read the book (PDF)</a>
                    {excerpts[0] && <Link href={`/resources/${excerpts[0].slug}/`} className="btn btn-line">Read an excerpt</Link>}
                  </div>
                  {excerpts.length > 0 && (
                    <div className="border-t border-line pt-4">
                      <p className="eyebrow mb-2 text-xs">Excerpts on this site</p>
                      <ul className="flex flex-wrap gap-x-5 gap-y-2">
                        {excerpts.map((e) => <li key={e.slug}><Link href={`/resources/${e.slug}/`} className="font-semibold">{e.title}</Link></li>)}
                      </ul>
                    </div>
                  )}
                  <p className="text-sm text-muted">About the author: {b.authorBio}</p>
                </div>
              </article>
            );
          })}
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
