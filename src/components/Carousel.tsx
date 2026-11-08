import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "@/components/icons";

/**
 * A horizontal row that scrolls. The arrows sit in a bar above the row, on every screen size,
 * with a short hint, so first-time visitors can see there is more. Swiping also works on phones.
 * Works without JavaScript; the arrow bar appears once CarouselScript has run and there is more to see.
 * Give each child an <li> with a width, e.g. className="w-[16rem]".
 */
export function Carousel({ label, children, dark = false, className = "" }: { label: string; children: ReactNode; dark?: boolean; className?: string }) {
  const btn = `inline-flex h-11 w-11 items-center justify-center rounded-full border-2 shadow-[0_6px_18px_rgba(11,31,58,0.22)] transition disabled:cursor-default disabled:opacity-30 disabled:shadow-none ${
    dark ? "border-gold bg-gold text-navy hover:bg-gold-light" : "border-navy bg-navy text-white hover:border-royal hover:bg-royal"
  }`;
  return (
    <div data-carousel className={`carousel relative flex flex-col gap-3 ${className}`} role="region" aria-label={label}>
      <div className="carousel-bar items-center justify-end gap-3">
        <span className={`mr-auto text-sm font-medium ${dark ? "text-pale" : "text-muted"}`}>
          <span className="hidden sm:inline">Use the arrows to see more</span>
          <span className="sm:hidden">Swipe or tap the arrows</span>
          <span data-carousel-count className={`ml-2 font-semibold ${dark ? "text-gold" : "text-royal"}`} />
        </span>
        <button type="button" data-carousel-prev aria-label={`Scroll ${label} back`} className={btn}>
          <ChevronLeft size={22} />
        </button>
        <button type="button" data-carousel-next aria-label={`Scroll ${label} forward`} className={btn}>
          <ChevronRight size={22} />
        </button>
      </div>
      <ul data-carousel-track className="carousel-track -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-4">
        {children}
      </ul>
    </div>
  );
}
