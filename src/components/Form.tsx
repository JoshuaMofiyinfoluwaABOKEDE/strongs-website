"use client";

import { useState, type FormEvent } from "react";
import { formEndpoint, site } from "@/content/site";

export type Field =
  | { name: string; label: string; type: "text" | "email" | "tel"; required?: boolean; placeholder?: string; wide?: boolean }
  | { name: string; label: string; type: "select"; options: string[]; required?: boolean; wide?: boolean }
  | { name: string; label: string; type: "textarea"; required?: boolean; wide?: boolean };

const inputClass =
  "min-h-12 w-full min-w-0 rounded-xl border-[1.5px] border-steel bg-white px-4 text-base font-normal text-ink focus:border-royal";

/**
 * A form that posts to the form service in NEXT_PUBLIC_FORM_ENDPOINT (Formspree or similar).
 * Until one is connected, it tells the visitor to email the office instead of losing the message.
 */
export function StrongsForm({
  formName,
  fields,
  submitLabel,
  labelledBy,
  className = "",
}: {
  formName: string;
  fields: Field[];
  submitLabel: string;
  labelledBy?: string;
  className?: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "offline">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formEndpoint) {
      setStatus("offline");
      return;
    }
    setStatus("sending");
    try {
      const data = new FormData(e.currentTarget);
      data.append("form", formName);
      const res = await fetch(formEndpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(String(res.status));
      e.currentTarget.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      aria-labelledby={labelledBy}
      onSubmit={onSubmit}
      data-strongs-form={formName}
      className={`grid gap-x-5 gap-y-4.5 sm:grid-cols-2 ${className}`}
    >
      {fields.map((f) => (
        <label key={f.name} className={`flex flex-col gap-1.5 text-sm font-semibold text-navy ${f.wide || f.type === "textarea" ? "sm:col-span-2" : ""}`}>
          {f.label}
          {f.type === "select" ? (
            <select name={f.name} required={f.required} className={inputClass}>
              {f.options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          ) : f.type === "textarea" ? (
            <textarea name={f.name} rows={5} required={f.required} className={`${inputClass} py-3.5`} />
          ) : (
            <input
              name={f.name}
              type={f.type}
              required={f.required}
              placeholder={"placeholder" in f ? f.placeholder : undefined}
              autoComplete={f.type === "email" ? "email" : f.type === "tel" ? "tel" : f.name === "name" ? "name" : undefined}
              className={inputClass}
            />
          )}
        </label>
      ))}
      <div className="flex flex-col gap-3 sm:col-span-2">
        <button type="submit" disabled={status === "sending"} className="btn btn-navy cursor-pointer justify-self-start self-start border-0 font-[inherit]">
          {status === "sending" ? "Sending…" : submitLabel}
        </button>
        <p role="status" data-form-status className="text-sm text-muted" hidden={status === "idle" || status === "sending"}>
          {status === "sent" && "Thank you. Your message has reached the STRONGS office."}
          {status === "error" && (
            <>
              Something went wrong. Please email <a href={`mailto:${site.email}`}>{site.email}</a>.
            </>
          )}
          {status === "offline" && (
            <>
              Online forms are not connected yet. Please email <a href={`mailto:${site.email}`}>{site.email}</a> or call{" "}
              <a href={site.phoneHref}>{site.phone}</a>.
            </>
          )}
        </p>
      </div>
    </form>
  );
}
