import Link from "next/link";

/** Shown on platform pages until the database is connected in Vercel. */
export function NotConnected() {
  return (
    <section className="bg-mist">
      <div className="container-site flex max-w-2xl flex-col gap-4 py-[clamp(3rem,7vw,5.5rem)]">
        <p className="eyebrow">STRONGS Courses</p>
        <h1 className="h2 text-navy">Online learning opens soon</h1>
        <p className="lead text-muted">Accounts, lessons and certificates are being set up. In the meantime you can browse every course.</p>
        <Link href="/courses/" className="btn btn-navy self-start">Browse the courses</Link>
      </div>
    </section>
  );
}
