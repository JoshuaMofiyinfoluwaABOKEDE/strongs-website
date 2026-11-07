import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "@/components/icons";

/**
 * A horizontal row that scrolls (swipe on phones, arrows on larger screens).
 * Works without JavaScript; the arrow buttons appear once CarouselScript has run.
 * Give each child an <li> with a width, e.g. className="w-[16rem]".
 */
export function Carousel({ label, children, dark = false, className = "" }: { label: string; children: ReactNode; dark?: boolean; className?: string }) {
  const btn = `carousel-btn absolute top-[38%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border shadow-lg transition disabled:pointer-events-none disabled:opacity-0 md:flex ${
    dark ? "border-navy-line bg-navy-2 text-white hover:bg-royal" : "border-line bg-white text-navy hover:border-royal hover:text-royal"
  }`;
  return (
    <div data-carousel className={`relative ${className}`} role="region" aria-label={label}>
      <ul data-carousel-track className="carousel-track -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-4">
        {children}
      </ul>
      <button type="button" data-carousel-prev aria-label={`Scroll ${label} back`} className={`${btn} -left-5`}>
        <ChevronLeft size={22} />
      </button>
      <button type="button" data-carousel-next aria-label={`Scroll ${label} forward`} className={`${btn} -right-5`}>
        <ChevronRight size={22} />
      </button>
    </div>
  );
}
