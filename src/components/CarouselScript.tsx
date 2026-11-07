"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { carouselScript } from "@/lib/carouselScript";

/** Runs the carousel wiring on first load and after every page change. */
export function CarouselScript() {
  const pathname = usePathname();
  useEffect(() => {
    const w = window as unknown as { strongsCarousels?: () => void };
    if (!w.strongsCarousels) new Function(carouselScript)();
    else w.strongsCarousels();
  }, [pathname]);
  return null;
}
