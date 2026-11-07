import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getArticle } from "@/content/articles";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  return a ? { title: a.title, description: a.excerpt, authors: [{ name: a.author }] } : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();

  const i = articles.indexOf(a);
  const prev = articles[i + 1];
  const next = articles[i - 1];
  const more = articles.filter((x) => x.theme === a.theme && x.slug !== a.slug).slice(0, 3);

  return (
    <>
      <article aria-labelledby="a-title">
        <header className="bg-mist">
          <div className="mx-auto flex max-w-3xl flex-col gap-4 px-[clamp(1.25rem,4vw,3rem)] pb-12 pt-[clamp(3rem,6vw,5rem)]">
            <nav aria-label="Breadcrumb" className="text-sm text-muted">
              <Link href="/resources/">Resources</Link> <span aria-hidden="true">›</span> {a.theme}
            </nav>
            <h1 id="a-title" className="text-[clamp(2.2rem,4.5vw,3.4rem)] font-bold leading-[1.1] tracking-[-0.02em] text-navy">{a.title}</h1>
            <p className="text-[0.9375rem] text-muted">
              By <span className="font-semibold text-navy">{a.author}</span> · {a.minutes} min read
            </p>
          </div>
        </header>
        <div className="mx-auto max-w-3xl px-[clamp(1.25rem,4vw,3rem)] py-14">
          <div className="prose-strongs">
            {a.body.map((p, k) => <p key={k}>{p}</p>)}
          </div>
          <div className="mt-12 flex flex-wrap justify-between gap-4 border-t border-line pt-6 text-[0.9375rem]">
            {prev ? <Link href={`/resources/${prev.slug}/`} className="font-semibold">← {prev.title}</Link> : <span />}
            {next && <Link href={`/resources/${next.slug}/`} className="font-semibold">{next.title} →</Link>}
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section aria-labelledby="more-title" className="bg-mist">
          <div className="container-site flex flex-col gap-6 py-16">
            <h2 id="more-title" className="text-2xl font-bold text-navy">More on {a.theme.toLowerCase()}</h2>
            <ul className="grid gap-5 md:grid-cols-3">
              {more.map((m) => (
                <li key={m.slug} className="flex flex-col gap-2 rounded-3xl bg-white p-7">
                  <h3 className="text-lg font-semibold leading-snug">
                    <Link href={`/resources/${m.slug}/`} className="text-navy no-underline hover:text-royal">{m.title}</Link>
                  </h3>
                  <p className="text-[0.9375rem] text-muted">{m.excerpt}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
