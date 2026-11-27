import type { Metadata } from "next";
import Link from "next/link";
import { CertificatePreview } from "@/components/CertificatePreview";
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
      <section className="bg-mist">
        <div className="container-site flex justify-center py-[clamp(3rem,7vw,5rem)]">
          {!c ? (
            <div className="flex max-w-xl flex-col gap-4 text-center">
              <h1 className="h2 text-navy">Certificate not found</h1>
              <p className="lead text-muted">No STRONGS certificate has the number <strong>{code.toUpperCase()}</strong>. Check the number and try again.</p>
              <Link href="/certificates/verify/" className="btn btn-navy self-center">Check another number</Link>
            </div>
          ) : (
            <div className="flex w-full max-w-4xl flex-col items-center gap-6 text-center">
              <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-royal shadow-sm">{c.revoked ? "Certificate withdrawn" : "✓ Verified STRONGS certificate"}</p>
              {c.revoked ? (
                <p className="lead max-w-lg text-muted">Certificate {c.code} was issued by STRONGS but has since been withdrawn{c.revoked_reason ? `: ${c.revoked_reason}` : "."}</p>
              ) : (
                <>
                  <h1 className="sr-only">Certificate of completion for {c.learner_name}</h1>
                  <CertificatePreview name={c.learner_name} course={c.course_title} school={c.school} date={date(c.issued_at)} code={c.code} />
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
