"use client";

import { useState } from "react";

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 2500);
        } catch {
          /* clipboard unavailable: the number is on screen to copy by hand */
        }
      }}
      className="btn btn-line min-h-11 cursor-pointer justify-self-start px-5 text-sm font-[inherit]"
    >
      {done ? "Copied" : label}
    </button>
  );
}
