import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "@/components/icons";

/**
 * A horizontal row that scrolls. Swipe on phones, or use the arrows: large arrows on the
 * sides on bigger screens, and an arrow bar with a "swipe for more" hint under the row on phones.
 * Works without JavaScript; the arrows appear once CarouselScript has run and there is more to see.
 * Give each child an <li> with a width, e.g. className="w-[16rem]".
 */
export function Carousel({ label, children, dark = false, className = "" }: { label: string; children: ReactNode; dark?: boolean; className?: string }) {
  const tone = dark
    ? "border-gold bg-gold text-navy hover:bg-gold-light"
    : "border-navy bg-navy text-white hover:bg-royal hover:border-royal";
  const side = `carousel-btn absolute top-[38%] z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 shadow-[0_8px_24px_rgba(11,31,58,0.28)] transition disabled:pointer-events-none disabled:opacity-0 md:flex ${tone}`;
  const small = `inline-flex h-10 w-10 items-center justify-center rounded-full border-2 transition disabled:opacity-30 ${tone}`;
  return (
    <div data-carousel className={`carousel relative ${dark ? "carousel-dark" : ""} ${className}`} role="region" aria-label={label}>
      <ul data-carousel-track className="carousel-track -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-4">
        {children}
      </ul>
      <button type="button" data-carousel-prev aria-label={`Scroll ${label} back`} className={`${side} -left-5`}>
        <ChevronLeft size={24} />
      </button>
      <button type="button" data-carousel-next aria-label={`Scroll ${label} forward`} className={`${side} -right-5`}>
        <ChevronRight size={24} />
      </button>
      <div className="carousel-bar items-center justify-between gap-3 md:hidden">
        <span className={`text-sm font-medium ${dark ? "text-pale" : "text-muted"}`}>Swipe or tap the arrows for more</span>
        <span className="flex gap-2">
          <button type="button" data-carousel-prev aria-label={`Scroll ${label} back`} className={small}>
            <ChevronLeft size={20} />
          </button>
          <button type="button" data-carousel-next aria-label={`Scroll ${label} forward`} className={small}>
            <ChevronRight size={20} />
          </button>
        </span>
      </div>
    </div>
  );
}
