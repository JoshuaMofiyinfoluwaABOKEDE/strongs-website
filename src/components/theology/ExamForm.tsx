"use client";

import { useEffect, useRef, useState } from "react";
import { saveExamAnswers } from "@/app/theology/actions";

/**
 * Wraps the exam paper: shows the time left, saves answers every few seconds,
 * and submits automatically when time runs out.
 */
export function ExamForm({ slug, attemptId, deadline, children, action }: { slug: string; attemptId: number; deadline: string; children: React.ReactNode; action: (f: FormData) => void }) {
  const form = useRef<HTMLFormElement>(null);
  const end = new Date(deadline).getTime();
  const [left, setLeft] = useState(() => Math.max(0, end - Date.now()));
  const [saved, setSaved] = useState<string>("");
  const submitted = useRef(false);

  useEffect(() => {
    const collect = () => {
      const data = new FormData(form.current!);
      const out: Record<string, string> = {};
      for (const [k, v] of data.entries()) if (k.startsWith("a_")) out[k.slice(2)] = String(v);
      return out;
    };
    const tick = setInterval(() => {
      const ms = Math.max(0, end - Date.now());
      setLeft(ms);
      if (ms === 0 && !submitted.current) {
        submitted.current = true;
        form.current?.requestSubmit();
      }
    }, 1000);
    const save = setInterval(async () => {
      if (submitted.current) return;
      const r = await saveExamAnswers(slug, attemptId, collect()).catch(() => ({ ok: false }));
      setSaved(r.ok ? `Saved ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Not saved: check your connection");
    }, 15000);
    const warn = (e: BeforeUnloadEvent) => { if (!submitted.current) e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => { clearInterval(tick); clearInterval(save); window.removeEventListener("beforeunload", warn); };
  }, [end, slug, attemptId]);

  const mins = Math.floor(left / 60000);
  const secs = Math.floor((left % 60000) / 1000);
  return (
    <form ref={form} action={action} onSubmit={() => (submitted.current = true)} className="flex flex-col gap-5">
      <div className="sticky top-[73px] z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-navy px-5 py-3 text-white shadow-lg">
        <span className="text-sm text-pale">Time left</span>
        <span className={`font-mono text-2xl font-bold ${left < 5 * 60000 ? "text-gold" : "text-white"}`} aria-live="polite">{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</span>
        <span className="text-xs text-pale">{saved}</span>
      </div>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="attempt" value={attemptId} />
      {children}
      <button type="submit" className="btn btn-navy cursor-pointer self-start border-0 font-[inherit]">Submit the exam</button>
    </form>
  );
}
