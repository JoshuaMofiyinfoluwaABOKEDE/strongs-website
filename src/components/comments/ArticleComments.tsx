"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Chat, Flag, Reply, Send, Trash } from "@/components/icons";

type Comment = { id: number; parentId: number | null; name: string; staff: boolean; body: string; createdAt: string; deleted: boolean; mine: boolean };
type State = { available: boolean; signedIn?: boolean; name?: string | null; moderator?: boolean; comments?: Comment[]; error?: string | null; reported?: boolean };

function ago(d: string) {
  const s = Math.max(1, Math.round((Date.now() - new Date(d).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  if (s < 7 * 86400) return `${Math.round(s / 86400)} d ago`;
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

const iconBtn = "inline-flex h-9 min-w-9 cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 bg-transparent px-2 font-[inherit] text-xs font-semibold text-muted hover:bg-mist hover:text-royal";

function Composer({ onSend, busy, placeholder, autoFocus, onCancel }: { onSend: (text: string) => Promise<boolean>; busy: boolean; placeholder: string; autoFocus?: boolean; onCancel?: () => void }) {
  const [text, setText] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (await onSend(text)) setText("");
      }}
      className="flex items-end gap-2 rounded-2xl border border-line bg-white p-2 focus-within:border-navy"
    >
      <label className="sr-only" htmlFor={autoFocus ? "reply-box" : "comment-box"}>{placeholder}</label>
      <textarea
        id={autoFocus ? "reply-box" : "comment-box"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
        minLength={2}
        maxLength={1500}
        rows={autoFocus ? 2 : 3}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="min-h-12 flex-1 resize-y border-0 bg-transparent px-2 py-1.5 text-[0.9375rem] outline-none placeholder:text-muted"
      />
      {onCancel && (
        <button type="button" onClick={onCancel} className={iconBtn} aria-label="Cancel">✕</button>
      )}
      <button type="submit" disabled={busy || text.trim().length < 2} aria-label="Post" title="Post" className="inline-flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-full border-0 bg-navy text-white hover:bg-royal disabled:cursor-default disabled:opacity-40">
        <Send size={18} />
      </button>
    </form>
  );
}

export function ArticleComments({ article }: { article: string }) {
  const [state, setState] = useState<State | null>(null);
  const [busy, setBusy] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [reporting, setReporting] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/comments/?article=${encodeURIComponent(article)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: State) => setState(d))
      .catch(() => setState({ available: false }));
  }, [article]);

  const act = useCallback(
    async (body: Record<string, unknown>) => {
      setBusy(true);
      setNotice(null);
      try {
        const r = await fetch("/api/comments/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ article, ...body }) });
        const d = (await r.json()) as State & { error?: string };
        if (!r.ok) {
          setNotice(d.error ?? "Something went wrong. Please try again.");
          return false;
        }
        setState(d);
        if (d.error) {
          setNotice(d.error);
          return false;
        }
        if (d.reported) setNotice("Thank you. The STRONGS team will look at that comment.");
        return true;
      } catch {
        setNotice("Could not reach the site. Check your connection and try again.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [article],
  );

  if (state && !state.available) return null;

  const all = state?.comments ?? [];
  const top = all.filter((c) => !c.parentId).reverse(); // newest first
  const repliesOf = (id: number) => all.filter((c) => c.parentId === id);
  const count = all.filter((c) => !c.deleted).length;
  const next = encodeURIComponent(`/resources/${article}/#comments`);

  const view = (c: Comment, reply = false) => (
    <article id={`comment-${c.id}`} className="flex gap-3">
      <span aria-hidden="true" className={`flex flex-none items-center justify-center rounded-full font-bold ${reply ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm"} ${c.staff ? "bg-navy text-gold" : "bg-mist text-navy"}`}>
        {c.deleted ? "–" : initials(c.name) || "?"}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {c.deleted ? (
          <p className="py-2 text-sm italic text-muted">This comment was removed.</p>
        ) : (
          <>
            <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
              <strong className="text-navy">{c.name}</strong>
              {c.staff && <span className="rounded bg-gold/20 px-1.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wide text-navy">STRONGS</span>}
              <span className="text-muted">· {ago(c.createdAt)}</span>
            </p>
            <p className="whitespace-pre-wrap break-words text-[0.9375rem] leading-relaxed text-ink">{c.body}</p>
            {state?.signedIn && (
              <div className="-ml-2 flex flex-wrap items-center">
                {!reply && (
                  <button type="button" className={iconBtn} onClick={() => setReplyTo(replyTo === c.id ? null : c.id)} aria-label={`Reply to ${c.name}`} title="Reply">
                    <Reply size={16} /> <span>Reply</span>
                  </button>
                )}
                {(c.mine || state.moderator) && (
                  <button type="button" className={`${iconBtn} hover:text-[#8a1c1c]`} disabled={busy} onClick={() => confirm("Delete this comment?") && act({ action: "delete", id: c.id })} aria-label="Delete comment" title="Delete">
                    <Trash size={16} />
                  </button>
                )}
                {!c.mine && (
                  <button type="button" className={iconBtn} onClick={() => setReporting(reporting === c.id ? null : c.id)} aria-label="Report comment" title="Report">
                    <Flag size={16} />
                  </button>
                )}
              </div>
            )}
            {reporting === c.id && (
              <form
                className="flex flex-wrap items-center gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const reason = String(new FormData(e.currentTarget).get("reason") ?? "");
                  if (await act({ action: "report", id: c.id, reason })) setReporting(null);
                }}
              >
                <input name="reason" maxLength={300} placeholder="What is wrong with this comment?" aria-label="Reason" className="field min-h-9 flex-1 py-1 text-sm" />
                <button type="submit" disabled={busy} className="btn btn-navy min-h-9 cursor-pointer border-0 px-3 font-[inherit] text-xs">Send</button>
              </form>
            )}
          </>
        )}
      </div>
    </article>
  );

  return (
    <section id="comments" aria-labelledby="comments-title" className="scroll-mt-28 border-t border-line pt-10">
      <h2 id="comments-title" className="mb-5 flex items-center gap-2.5 text-2xl font-bold text-navy">
        <span className="text-royal"><Chat size={26} /></span>
        Comments
        {count > 0 && <span className="rounded-full bg-mist px-2.5 py-0.5 text-sm font-bold text-royal">{count}</span>}
      </h2>

      {!state ? (
        <p className="text-sm text-muted">Loading comments…</p>
      ) : (
        <div className="flex flex-col gap-6">
          {state.signedIn ? (
            <Composer busy={busy} placeholder={`Share a thought, ${state.name?.split(" ")[0] ?? "friend"}…`} onSend={(text) => act({ action: "create", body: text })} />
          ) : (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-mist p-4">
              <span className="text-royal"><Chat size={22} /></span>
              <span className="flex-1 font-medium text-navy">Join the conversation</span>
              <Link href={`/sign-in/?next=${next}`} className="btn btn-navy min-h-10 px-5 text-sm">Sign in</Link>
              <Link href={`/sign-up/?next=${next}`} className="btn btn-line min-h-10 px-5 text-sm">Join free</Link>
            </div>
          )}

          {notice && <p role="status" className="rounded-xl bg-mist p-3 text-sm text-royal">{notice}</p>}

          {top.length === 0 ? (
            <p className="text-sm text-muted">Be the first to comment.</p>
          ) : (
            <ul className="flex flex-col gap-6">
              {top.map((c) => (
                <li key={c.id} className="flex flex-col gap-3">
                  {view(c)}
                  {(repliesOf(c.id).length > 0 || replyTo === c.id) && (
                    <div className="ml-5 flex flex-col gap-3 border-l-2 border-line pl-4 sm:ml-12">
                      {repliesOf(c.id).map((r) => <div key={r.id}>{view(r, true)}</div>)}
                      {replyTo === c.id && (
                        <Composer
                          autoFocus
                          busy={busy}
                          placeholder={`Reply to ${c.name}`}
                          onCancel={() => setReplyTo(null)}
                          onSend={async (text) => {
                            const ok = await act({ action: "create", body: text, parent: c.id });
                            if (ok) setReplyTo(null);
                            return ok;
                          }}
                        />
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          {state.signedIn && <p className="text-xs text-muted">Be kind and edifying. Please don&apos;t share phone numbers or private details here.</p>}
        </div>
      )}
    </section>
  );
}
