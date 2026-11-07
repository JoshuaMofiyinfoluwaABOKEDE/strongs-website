import Link from "next/link";
import { footerNav, site } from "@/content/site";

export function Footer() {
  return (
    <footer className="bg-navy text-[0.9375rem] text-pale">
      <div className="container-site flex flex-col gap-12 pb-10 pt-18">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img src="/images/strongs-logo.webp" alt="" width={56} height={56} className="h-14 w-14" />
              <span className="text-lg font-extrabold tracking-[0.18em] text-white">STRONGS</span>
            </div>
            <p className="text-[1.0625rem] font-semibold text-white">
              Resolute. Resilient. <span className="text-gold">Relentless.</span>
            </p>
            <p>A non-denominational gospel mission raising spiritual intellectuals.</p>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-2.5">
            <p className="eyebrow-dark text-xs">The mission</p>
            {footerNav.map((item) => (
              <Link key={item.href} href={item.href} className="text-white no-underline hover:text-gold">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-2.5">
            <p className="eyebrow-dark text-xs">Contact</p>
            <a href={`mailto:${site.email}`} className="text-white no-underline hover:text-gold">
              {site.email}
            </a>
            <a href={site.phoneHref} className="text-white no-underline hover:text-gold">
              {site.phone}
            </a>
            <p>{site.address}</p>
          </div>

          <div className="flex flex-col gap-2.5">
            <p className="eyebrow-dark text-xs">Follow</p>
            {site.facebook.href ? (
              <a href={site.facebook.href} className="text-white no-underline hover:text-gold" rel="noopener">
                {site.facebook.label}
              </a>
            ) : (
              <p className="text-white">{site.facebook.label}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-4 border-t border-navy-line pt-6 text-sm">
          <p>
            © {new Date().getFullYear()} {site.fullName} · <span className="italic text-gold">Soli Deo gloria</span>
          </p>
          <a href={`mailto:${site.email}`} className="text-pale hover:text-gold">
            Contact the office
          </a>
        </div>
      </div>
    </footer>
  );
}
