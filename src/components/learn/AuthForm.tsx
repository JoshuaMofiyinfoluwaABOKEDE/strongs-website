"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

/** Sign-in and registration form. */
export function AuthForm({ mode, next }: { mode: "sign-in" | "sign-up"; next: string }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard/";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || "").trim();
    const password = String(f.get("password") || "");
    const res =
      mode === "sign-up"
        ? await authClient.signUp.email({ name: String(f.get("name") || "").trim().replace(/\s+/g, " "), email, password })
        : await authClient.signIn.email({ email, password });
    setBusy(false);
    if (res.error) {
      const m = res.error.message || "";
      setError(
        /exist/i.test(m)
          ? "An account with this email already exists. Sign in instead."
          : /invalid/i.test(m)
            ? "That email and password do not match. Check them and try again."
            : /password.*(short|least)/i.test(m)
              ? "Use a password of at least 8 characters."
              : m || "Something went wrong. Please try again.",
      );
      return;
    }
    window.location.assign(safeNext);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4.5">
      {mode === "sign-up" && (
        <label className="label">
          Full name
          <input name="name" required minLength={2} maxLength={80} autoComplete="name" className="field" />
          <span className="text-xs font-normal text-muted">Written exactly as it should appear on your certificates.</span>
        </label>
      )}
      <label className="label">
        Email address
        <input name="email" type="email" required autoComplete="email" className="field" />
      </label>
      <label className="label">
        Password
        <input name="password" type="password" required minLength={8} autoComplete={mode === "sign-up" ? "new-password" : "current-password"} className="field" />
        {mode === "sign-up" && <span className="text-xs font-normal text-muted">At least 8 characters.</span>}
      </label>
      {error && <p role="alert" className="rounded-xl bg-[#fdecec] px-4 py-3 text-sm text-[#8a1c1c]">{error}</p>}
      <button type="submit" disabled={busy} className="btn btn-navy cursor-pointer border-0 font-[inherit] disabled:opacity-60">
        {busy ? "Please wait…" : mode === "sign-up" ? "Create my account" : "Sign in"}
      </button>
      <p className="text-sm text-muted">
        {mode === "sign-up" ? (
          <>Already have an account? <Link href={`/sign-in/?next=${encodeURIComponent(safeNext)}`}>Sign in</Link></>
        ) : (
          <>New here? <Link href={`/sign-up/?next=${encodeURIComponent(safeNext)}`}>Create a free account</Link></>
        )}
      </p>
      {mode === "sign-in" && (
        <p className="text-sm text-muted">Forgotten your password? Contact STRONGS and an administrator will set a new one for you.</p>
      )}
    </form>
  );
}
