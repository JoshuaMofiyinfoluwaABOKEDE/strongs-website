import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Verify a certificate" };

async function lookUp(form: FormData) {
  "use server";
  const code = String(form.get("code") ?? "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
  if (code) redirect(`/certificates/${code}/`);
}

export default function VerifyPage() {
  return (
    <>
      <section className="bg-mist">
        <div className="container-site flex max-w-2xl flex-col gap-5 py-[clamp(3rem,7vw,5rem)]">
          <p className="eyebrow">STRONGS Courses</p>
          <h1 className="h2 text-navy">Verify a certificate</h1>
          <p className="lead text-muted">Enter the certificate number printed at the bottom of a STRONGS certificate, for example STR-ABCD-2345.</p>
          <form action={lookUp} className="flex flex-wrap gap-3">
            <input name="code" required placeholder="STR-XXXX-XXXX" className="field max-w-xs uppercase" aria-label="Certificate number" />
            <button type="submit" className="btn btn-navy cursor-pointer border-0 font-[inherit]">Check</button>
          </form>
        </div>
      </section>
    </>
  );
}
