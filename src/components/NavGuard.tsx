"use client";

import { useEffect } from "react";

/**
 * Makes the phone's Back button behave as people expect:
 * - Back always goes to the previous page, and from the first page of a visit it goes to the home page
 *   (instead of leaving the site), so someone who opens a shared link can still find their way around.
 * - Back closes the phone menu when it is open, instead of leaving the page.
 * - Links to a section of the same page (#…) scroll there without adding steps to Back.
 */
export function NavGuard() {
  useEffect(() => {
    const h = window.history;
    const state = () => (h.state && typeof h.state === "object" ? h.state : {});

    // First page of a visit (not the home page, not reached from another STRONGS page):
    // put a "go home" step underneath it.
    try {
      const fromSite = document.referrer && new URL(document.referrer).origin === window.location.origin;
      if (!sessionStorage.getItem("strongs-visit") && window.location.pathname !== "/" && !fromSite && !state().strongsRoot) {
        const s = state();
        h.replaceState({ ...s, strongsRoot: 1 }, "");
        h.pushState({ ...s }, "");
      }
      sessionStorage.setItem("strongs-visit", "1");
    } catch {
      /* storage blocked: Back keeps its normal behaviour */
    }

    const openMenu = () => document.querySelector<HTMLDetailsElement>("details[data-menu][open]");

    // Runs before the router's own handler (capture phase, registered first).
    const onPop = (e: PopStateEvent) => {
      const menu = openMenu();
      if (menu) {
        menu.removeAttribute("open");
        e.stopImmediatePropagation();
        return;
      }
      const st = e.state && typeof e.state === "object" ? e.state : {};
      if (st.strongsRoot) {
        e.stopImmediatePropagation();
        window.location.replace("/");
        return;
      }
      if (st.strongsMenu) {
        // A step left behind by the menu: skip over it.
        e.stopImmediatePropagation();
        h.back();
      }
    };
    window.addEventListener("popstate", onPop, true);

    // Opening the phone menu adds a step, so Back closes it; closing it without choosing a page removes the step.
    // (When a page is chosen from the menu, the step stays and Back skips over it later.)
    let menuNav = 0;
    const onMenuLink = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest?.("details[data-menu] a[href]")) menuNav = Date.now();
    };
    document.addEventListener("click", onMenuLink, true);
    const onToggle = (e: Event) => {
      const d = e.target as HTMLElement;
      if (!(d instanceof HTMLDetailsElement) || !d.matches("[data-menu]")) return;
      if (d.open && !state().strongsMenu) h.pushState({ ...state(), strongsMenu: 1 }, "");
      else if (!d.open && state().strongsMenu && Date.now() - menuNav > 1500) h.back();
    };
    document.addEventListener("toggle", onToggle, true);

    // Same-page section links scroll without adding steps to Back.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target) return;
      const url = new URL(a.href, window.location.href);
      if (!url.hash || url.origin !== window.location.origin || url.pathname !== window.location.pathname || url.search !== window.location.search) return;
      const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      h.replaceState(state(), "", url.hash);
    };
    document.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("popstate", onPop, true);
      document.removeEventListener("toggle", onToggle, true);
      document.removeEventListener("click", onMenuLink, true);
      document.removeEventListener("click", onClick);
    };
  }, []);
  return null;
}

/** A small Back button for phones: the previous page, or the home page if there is none. */
export function BackButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      aria-label="Back"
      onClick={() => {
        if (window.history.length > 1) window.history.back();
        else window.location.assign("/");
      }}
      className={`inline-flex h-10 w-10 flex-none cursor-pointer items-center justify-center rounded-full border border-line text-xl leading-none text-navy hover:bg-mist ${className}`}
    >
      <span aria-hidden="true">‹</span>
    </button>
  );
}
