"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Book, Chat, ChevronLeft, Search, User } from "@/components/icons";

/** Pages that belong to the courses platform, where the bottom tab bar is shown on phones and tablets. */
export function inCourseArea(path: string) {
  return /^\/(courses|learn|theology|dashboard|profile|forum|certificates)(\/|$)/.test(path);
}

/** The course a page belongs to, if any, so the bar can offer that course's forum. */
function courseSlug(path: string): string | null {
  const m =
    path.match(/^\/(?:learn|theology|forum)\/([^/]+)/) ??
    path.match(/^\/courses\/theology\/([^/]+)/) ??
    path.match(/^\/courses\/(?!search\/?$|theology\/?$)([^/]+)/);
  return m ? m[1] : null;
}

type Step = { href: string; title: string };
const KEY = "strongs-trail";

function readTrail(): Step[] {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "[]") as Step[];
  } catch {
    return [];
  }
}

/** A readable name for a page before its title has loaded. */
function guessTitle(path: string) {
  const parts = path.split("?")[0].split("/").filter(Boolean);
  if (!parts.length) return "Home";
  const last = parts[parts.length - 1].replace(/-/g, " ");
  return last.charAt(0).toUpperCase() + last.slice(1);
}

const cleanTitle = (t: string) => (/^STRONGS\s*·/.test(t) ? "Home" : t.replace(/\s*·\s*STRONGS.*$/, "").trim());

/** Remembers the pages visited in this tab, newest last, so a learner can jump back two or three pages at once. */
function useTrail(pathname: string) {
  useEffect(() => {
    const href = location.pathname + location.search;
    const save = (fn: (trail: Step[]) => void) => {
      try {
        const trail = readTrail();
        fn(trail);
        sessionStorage.setItem(KEY, JSON.stringify(trail.slice(-15)));
      } catch {
        /* private mode: no trail */
      }
    };
    save((trail) => {
      if (trail[trail.length - 1]?.href === href) return;
      if (trail[trail.length - 2]?.href === href) trail.pop(); // went back one step
      else trail.push({ href, title: guessTitle(href) });
    });
    // The page title arrives a moment after navigation.
    const t = setTimeout(() => save((trail) => {
      const last = trail[trail.length - 1];
      if (last?.href === href && document.title) last.title = cleanTitle(document.title) || last.title;
    }), 500);
    return () => clearTimeout(t);
  }, [pathname]);
}

export function LearnTabs() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  useTrail(pathname);
  useEffect(() => setOpen(false), [pathname]);

  if (!inCourseArea(pathname)) return null;
  const slug = courseSlug(pathname);

  const showBack = () => {
    const here = location.pathname + location.search;
    const seen = new Set([here]);
    const earlier = readTrail()
      .slice(0, -1)
      .reverse()
      .filter((s) => (seen.has(s.href) ? false : (seen.add(s.href), true)))
      .slice(0, 3);
    setSteps(earlier);
    setOpen(true);
  };

  const tabs = [
    { href: "/dashboard/", label: "Learn", icon: <Book size={22} />, active: /^\/(dashboard|learn|theology)(\/|$)/.test(pathname) },
    { href: "/courses/", label: "Discover", icon: <Search size={22} />, active: /^\/courses(\/|$)/.test(pathname) },
    ...(slug ? [{ href: `/forum/${slug}/`, label: "Forum", icon: <Chat size={22} />, active: pathname.startsWith("/forum/") }] : []),
    { href: "/profile/", label: "Profile", icon: <User size={22} />, active: /^\/(profile|certificates)(\/|$)/.test(pathname) },
  ];
  const tabClass = (active: boolean) =>
    `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-semibold no-underline ${active ? "text-navy" : "text-steel hover:text-navy"}`;

  return (
    <>
      {/* Room at the end of the page so the bar never covers the footer. */}
      <div aria-hidden="true" className="h-[calc(3.75rem+env(safe-area-inset-bottom))] lg:hidden" />

      {open && (
        <div className="fixed inset-0 z-40 bg-navy/40 lg:hidden" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-label="Go back"
            className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-4 pb-[calc(5rem+env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(11,31,58,0.25)]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Go back to</p>
            <ul className="flex flex-col">
              {steps.map((s, i) => (
                <li key={s.href}>
                  <button
                    type="button"
                    onClick={() => (i === 0 ? history.back() : router.push(s.href))}
                    className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-2 text-left font-[inherit] text-ink hover:bg-mist"
                  >
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-mist text-xs font-bold text-navy">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate">{s.title}</span>
                  </button>
                </li>
              ))}
              {steps.length === 0 && (
                <li>
                  <button type="button" onClick={() => (history.length > 1 ? history.back() : router.push("/courses/"))} className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-2 text-left font-[inherit] text-ink hover:bg-mist">
                    Previous page
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      <nav
        aria-label="Courses"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_rgba(11,31,58,0.08)] lg:hidden"
      >
        <button type="button" onClick={() => (open ? setOpen(false) : showBack())} aria-expanded={open} className={`${tabClass(open)} cursor-pointer border-0 bg-transparent font-[inherit]`}>
          <ChevronLeft size={22} />
          Back
        </button>
        {tabs.map((t) => (
          <Link key={t.label} href={t.href} aria-current={t.active ? "page" : undefined} className={tabClass(t.active)}>
            {t.icon}
            {t.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
