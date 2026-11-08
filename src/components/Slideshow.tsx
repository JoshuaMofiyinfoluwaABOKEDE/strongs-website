import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "@/components/icons";

/**
 * A slideshow that changes by itself (every `interval` ms), with arrows, dots and a pause button.
 * It pauses while the mouse is over it, and can be swiped on phones. Wired by CarouselScript.
 * Slides are stacked in one grid cell, so the tallest slide sets the height.
 */
export function Slideshow({
  label,
  slides,
  interval = 6000,
  kenburns = false,
  dark = true,
  className = "",
  slideClassName = "",
  controlsClassName = "",
  arrows = "bar",
}: {
  label: string;
  slides: ReactNode[];
  interval?: number;
  kenburns?: boolean;
  dark?: boolean;
  className?: string;
  slideClassName?: string;
  controlsClassName?: string;
  /** "bar": arrows beside the dots. "overlay": round arrows over the middle of the slide, dots below. */
  arrows?: "bar" | "overlay";
}) {
  const overlay = arrows === "overlay";
  const ov = "absolute top-4 z-10 inline-flex h-11 w-11 items-center md:top-1/2 md:-translate-y-1/2 justify-center rounded-full border border-white/30 bg-navy/55 text-white backdrop-blur-sm transition hover:bg-navy/85";
  const btn = `inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition ${
    dark ? "border-gold bg-gold text-navy hover:bg-gold-light" : "border-navy bg-navy text-white hover:bg-royal"
  }`;
  return (
    <div
      data-slideshow
      data-interval={interval}
      role="region"
      aria-roledescription="slideshow"
      aria-label={label}
      className={`${kenburns ? "kenburns" : ""} flex flex-col gap-4 ${className}`}
    >
      <div className="relative grid">
        {overlay && (
          <>
            <button type="button" data-slide-prev aria-label="Previous" className={`${ov} left-3`}><ChevronLeft size={22} /></button>
            <button type="button" data-slide-next aria-label="Next" className={`${ov} right-3`}><ChevronRight size={22} /></button>
          </>
        )}
        {slides.map((s, i) => (
          <div
            key={i}
            data-slide
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            className={`[grid-area:1/1] ${slideClassName}`}
          >
            {s}
          </div>
        ))}
      </div>
      <div className={`flex items-center gap-3 ${controlsClassName}`}>
        {!overlay && (
          <button type="button" data-slide-prev aria-label="Previous" className={btn}>
            <ChevronLeft size={20} />
          </button>
        )}
        {overlay && <span className="w-10 shrink-0" aria-hidden="true" />}
        <div className="flex flex-1 flex-wrap items-center justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              data-slide-dot
              aria-label={`Show ${i + 1} of ${slides.length}`}
              className={`h-2.5 w-2.5 rounded-full transition-all ${dark ? "bg-white/35 hover:bg-white/70" : "bg-navy/25 hover:bg-navy/60"}`}
            />
          ))}
        </div>
        <button
          type="button"
          data-slide-pause
          aria-pressed="false"
          aria-label="Pause or play the slideshow"
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
            dark ? "border-white/40 text-white hover:border-gold hover:text-gold" : "border-navy/30 text-navy hover:border-royal hover:text-royal"
          }`}
        >
          <span data-pause-icon="pause" aria-hidden="true">❚❚</span>
          <span data-pause-icon="play" aria-hidden="true">▶</span>
        </button>
        {!overlay && (
          <button type="button" data-slide-next aria-label="Next" className={btn}>
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
