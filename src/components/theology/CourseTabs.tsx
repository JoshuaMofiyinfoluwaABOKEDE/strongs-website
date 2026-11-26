"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** The tab bar under the course title (edX-style): Course and Progress. */
export function CourseTabs({ slug }: { slug: string }) {
  const path = usePathname();
  const base = `/theology/${slug}/`;
  const tabs = [
    { href: base, label: "Course", active: !path.startsWith(`${base}progress`) },
    { href: `${base}progress/`, label: "Progress", active: path.startsWith(`${base}progress`) },
  ];
  return (
    <nav aria-label="Course" className="container-site flex gap-1">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          aria-current={t.active ? "page" : undefined}
          className={`rounded-t-lg px-5 py-2.5 text-sm font-semibold no-underline ${t.active ? "bg-mist text-navy" : "text-pale hover:bg-navy-2 hover:text-white"}`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
