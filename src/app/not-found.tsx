import Link from "next/link";

export default function NotFound() {
  return (
    <section className="bg-mist">
      <div className="container-site flex flex-col items-start gap-5 py-28">
        <p className="eyebrow">Page not found</p>
        <h1 className="text-[clamp(2.2rem,4.5vw,3.4rem)] font-bold leading-tight text-navy">This page has moved or no longer exists</h1>
        <p className="lead max-w-2xl text-muted">The STRONGS website has been rebuilt. Try one of these instead.</p>
        <div className="flex flex-wrap gap-3.5">
          <Link href="/" className="btn btn-navy">Home</Link>
          <Link href="/crusades/" className="btn btn-line">Crusades</Link>
          <Link href="/resources/" className="btn btn-line">Articles</Link>
        </div>
      </div>
    </section>
  );
}
