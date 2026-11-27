"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/content/site";
import { Menu, User } from "@/components/icons";
import { inCourseArea } from "@/components/LearnTabs";

/** True when the current page belongs to this menu item (e.g. /crusades/this-same-jesus/ → Crusades). */
function isActive(pathname: string, href: string) {
  if (href === "/missions/" && pathname.startsWith("/college")) return true;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href);
}

/**
 * The bar is exactly 72px tall plus its 1px border (73px), at every width:
 * sticky strips further down the page (course subjects, exam timer) sit at top-[73px].
 */
export function Header() {
  const pathname = usePathname() ?? "/";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="mx-auto flex h-[72px] w-full max-w-[84rem] items-center gap-4 px-[clamp(1rem,4vw,3rem)] xl:gap-5 xl:px-8">
        <Link href="/" aria-label="STRONGS home" className="flex min-w-0 shrink items-center gap-2.5 no-underline sm:gap-3">
          <img src="/images/strongs-logo.webp" alt="" width={44} height={44} className="h-10 w-10 flex-none rounded-full sm:h-11 sm:w-11" />
          <span className="flex min-w-0 flex-col justify-center">
            <span className="font-display text-[1.0625rem] font-extrabold leading-none tracking-[0.16em] text-navy sm:text-lg">STRONGS</span>
            <span className="mt-1 truncate font-display text-[0.5625rem] font-semibold uppercase leading-none tracking-[0.12em] text-royal sm:text-[0.625rem] sm:tracking-[0.16em] xl:tracking-[0.1em] min-[1400px]:tracking-[0.16em]">
              The Spiritual Intellectuals
            </span>
          </span>
        </Link>

        {/* Desktop bar. The logo links home, so Home is left out to keep the row uncrowded. */}
        <nav aria-label="Main" className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 whitespace-nowrap xl:flex">
          {mainNav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-full px-2 py-2 text-[0.8125rem] font-medium no-underline transition-colors min-[1400px]:px-2.5 min-[1400px]:text-[0.84375rem] ${
                  active ? "bg-mist font-semibold text-royal" : "text-ink hover:bg-mist hover:text-royal"
                }`}
              >
                {item.short ?? item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex flex-none items-center gap-2 sm:gap-2.5 xl:ml-0">
          {/* My learning belongs to the courses: it shows only there, on computers (phones use the bottom tab bar). */}
          {inCourseArea(pathname) && (
            <Link
              href="/dashboard/"
              aria-label="My learning"
              title="My learning"
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-line text-navy no-underline hover:border-navy hover:text-royal lg:inline-flex"
            >
              <User size={19} />
            </Link>
          )}
          <Link href="/get-involved/#give" className="btn btn-navy hidden min-h-10 px-5 text-[0.875rem] sm:inline-flex">
            Give
          </Link>

          {/* Phone and tablet menu: works without JavaScript. */}
          <details key={pathname} data-menu className="group relative xl:hidden">
            <summary
              aria-label="Menu"
              className="flex h-10 min-w-10 cursor-pointer list-none items-center justify-center gap-2 rounded-full border border-line px-2.5 text-sm font-semibold text-navy hover:border-navy group-open:border-navy group-open:bg-navy group-open:text-white sm:px-4"
            >
              <span className="group-open:hidden"><Menu size={20} /></span>
              <span aria-hidden="true" className="hidden w-5 text-center text-lg leading-none group-open:inline">✕</span>
              <span className="hidden sm:inline group-open:hidden">Menu</span>
              <span className="hidden sm:group-open:inline">Close</span>
            </summary>
            <nav
              aria-label="Main"
              className="absolute right-0 top-[calc(100%+0.875rem)] max-h-[calc(100dvh-6rem)] w-[min(21rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-line bg-white p-2.5 shadow-[0_18px_50px_rgba(11,31,58,0.25)]"
            >
              <ul className="flex flex-col">
                {[{ href: "/", label: "Home" }, ...mainNav].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(pathname, item.href) ? "page" : undefined}
                      className="flex min-h-11 items-center justify-between rounded-xl px-4 text-[0.9375rem] font-medium text-ink no-underline hover:bg-mist aria-[current=page]:bg-mist aria-[current=page]:font-semibold aria-[current=page]:text-royal"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li className="mt-2 sm:hidden">
                  <Link href="/get-involved/#give" className="btn btn-navy w-full">
                    Give
                  </Link>
                </li>
              </ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
