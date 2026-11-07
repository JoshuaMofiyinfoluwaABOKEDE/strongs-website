"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/content/site";
import { Menu } from "@/components/icons";

/** True when the current page belongs to this menu item (e.g. /crusades/this-same-jesus/ → Crusades). */
function isActive(pathname: string, href: string) {
  if (href === "/missions/" && pathname.startsWith("/college")) return true;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href);
}

export function Header() {
  const pathname = usePathname() ?? "/";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white">
      <div className="mx-auto flex w-full max-w-[82.5rem] items-center justify-between gap-6 px-[clamp(1.25rem,4vw,3rem)] py-3">
        <Link href="/" aria-label="STRONGS home" className="flex items-center gap-3 no-underline">
          <img src="/images/strongs-logo.webp" alt="" width={52} height={52} className="h-12 w-12 lg:h-[3.25rem] lg:w-[3.25rem]" />
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-extrabold tracking-[0.18em] text-navy">STRONGS</span>
            <span className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-royal">The Spiritual Intellectuals</span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-3.5 whitespace-nowrap text-[0.875rem] font-medium xl:flex 2xl:gap-6 2xl:text-[0.9375rem]">
          {mainNav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "border-b-2 border-gold py-1.5 text-royal no-underline"
                    : "py-1.5 text-ink no-underline hover:text-royal"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/get-involved/#give" className="btn btn-navy hidden min-h-11 px-6 text-[0.9375rem] sm:inline-flex">
            Give
          </Link>

          {/* Phone and tablet menu: works without JavaScript. */}
          <details className="group relative xl:hidden">
            <summary
              aria-label="Open menu"
              className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-[10px] border border-line text-navy"
            >
              <Menu size={22} />
            </summary>
            <nav
              aria-label="Main"
              className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(20rem,calc(100vw-2.5rem))] rounded-2xl border border-line bg-white p-3 shadow-xl"
            >
              <ul className="flex flex-col">
                {[{ href: "/", label: "Home" }, ...mainNav].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(pathname, item.href) ? "page" : undefined}
                      className="flex min-h-12 items-center rounded-xl px-4 font-medium text-ink no-underline hover:bg-mist aria-[current=page]:text-royal"
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
