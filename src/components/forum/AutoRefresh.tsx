"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Refreshes the page's server data every few seconds while it is visible and nobody is typing, so new posts appear. */
export function AutoRefresh({ seconds = 20 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => {
      const el = document.activeElement;
      const typing = (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) && el.value.trim() !== "";
      if (document.visibilityState === "visible" && !typing) router.refresh();
    }, seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);
  return null;
}
