import type { Metadata } from "next";
import Link from "next/link";
import { LearnBar } from "@/components/learn/LearnBar";
import { getCertificate } from "@/lib/lms";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const c = await getCertificate(code);
  return { title: c ? `Certificate: ${c.course_title}` : "Certificate not found", robots: { index: false } };
}

const date = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function CertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const c = await getCertificate(code);
  return (
    <>
      <LearnBar />
      <section className="bg-mist">
        <div className="container-site flex justify-center py-[clamp(3rem,7vw,5rem)]">
          {!c ? (
            <div className="flex max-w-xl flex-col gap-4 text-center">
              <h1 className="h2 text-navy">Certificate not found</h1>
              <p className="lead text-muted">No STRONGS certificate has the number <strong>{code.toUpperCase()}</strong>. Check the number and try again.</p>
              <Link href="/certificates/verify/" className="btn btn-navy self-center">Check another number</Link>
            </div>
          ) : (
            <div className="flex w-full max-w-3xl flex-col items-center gap-6 rounded-3xl border-[10px] border-navy bg-white p-[clamp(1.5rem,5vw,3.5rem)] text-center outline outline-1 -outline-offset-[22px] outline-gold">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/strongs-logo.webp" alt="" width={64} height={64} />
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-royal">{c.revoked ? "Certificate withdrawn" : "Verified certificate"}</p>
              {c.revoked ? (
                <p className="lead max-w-lg text-muted">Certificate {c.code} was issued by STRONGS but has since been withdrawn{c.revoked_reason ? `: ${c.revoked_reason}` : "."}</p>
              ) : (
                <>
                  <p className="italic text-muted">This certifies that</p>
                  <p className="font-serif text-[clamp(2rem,5vw,3rem)] font-semibold leading-tight text-navy">{c.learner_name}</p>
                  <p className="text-muted">completed the STRONGS {c.school === "theology" ? "School of Theology " : ""}course</p>
                  <p className="text-[clamp(1.4rem,3vw,2rem)] font-bold leading-tight text-navy">{c.course_title}</p>
                  <p className="text-muted">on {date(c.issued_at)}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Certificate no. {c.code}</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <a href={`/certificates/${c.code}/pdf/`} className="btn btn-navy">Download PDF</a>
                    {c.slug && <Link href={c.school === "theology" ? `/courses/theology/${c.slug}/` : `/courses/${c.slug}/`} className="btn btn-line">About the course</Link>}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
