"use client";

import { useState } from "react";
import { Search } from "@/components/icons";

/** Filters the course rows on the catalogue page as you type. */
export function CourseSearch() {
  const [count, setCount] = useState<number | null>(null);

  function filter(q: string) {
    const query = q.trim().toLowerCase();
    let shown = 0;
    document.querySelectorAll<HTMLElement>("[data-course-section]").forEach((section) => {
      let inSection = 0;
      section.querySelectorAll<HTMLElement>("[data-course-title]").forEach((li) => {
        const ok = !query || (li.dataset.courseTitle ?? "").includes(query);
        li.hidden = !ok;
        if (ok) inSection++;
      });
      section.hidden = inSection === 0;
      shown += inSection;
    });
    setCount(query ? shown : null);
    window.dispatchEvent(new Event("resize"));
  }

  return (
    <form role="search" data-course-search onSubmit={(e) => { e.preventDefault(); document.querySelector("[data-course-section]:not([hidden])")?.scrollIntoView({ behavior: "smooth" }); }} className="flex max-w-xl flex-col gap-2">
      <label htmlFor="course-q" className="sr-only">Search courses</label>
      <div className="flex items-center gap-2 rounded-full bg-white p-1.5 pl-5 text-ink shadow-lg">
        <span className="text-muted"><Search size={20} /></span>
        <input id="course-q" type="search" placeholder="What do you want to learn? Try “singing” or “writing”" onChange={(e) => filter(e.target.value)} className="min-w-0 flex-1 bg-transparent py-2 text-[0.9375rem] outline-none placeholder:text-muted" />
        <button type="submit" className="btn btn-gold min-h-10 px-5 text-sm">Search</button>
      </div>
      <p role="status" className="min-h-5 pl-5 text-sm text-pale">{count === null ? "" : count === 0 ? "No courses match. Try another word." : `${count} ${count === 1 ? "course" : "courses"} found`}</p>
    </form>
  );
}
