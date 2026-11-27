import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AutoRefresh } from "@/components/forum/AutoRefresh";
import { NotConnected } from "@/components/learn/NotConnected";
import { hasDatabase, one } from "@/lib/db";
import { courseHome, forumAccess, getClassmates, getThreads, phoneDigits, type Post } from "@/lib/forum";
import { getUser } from "@/lib/session";
import { createPost, deletePost, reportPost } from "@/app/forum/actions";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = hasDatabase ? await one<{ title: string }>(`SELECT title FROM lms_course WHERE slug = $1`, [slug]).catch(() => null) : null;
  return { title: c ? `Forum: ${c.title}` : "Course forum", robots: { index: false } };
}

function ago(d: string) {
  const s = Math.max(1, Math.round((Date.now() - new Date(d).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  if (s < 7 * 86400) return `${Math.round(s / 86400)} d ago`;
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

const errors: Record<string, string> = {
  empty: "Please write something before posting.",
  slow: "You have posted a lot in the last hour. Please wait a little before posting again.",
  enrol: "Enrol in this course to join its discussion.",
};

function Contact({ phone, name }: { phone: string | null; name: string }) {
  if (!phone) return null;
  const d = phoneDigits(phone);
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold">
      <a href={`https://wa.me/${d}`} target="_blank" rel="noopener" className="no-underline" aria-label={`Message ${name} on WhatsApp`}>WhatsApp</a>
      <a href={`tel:+${d}`} className="no-underline" aria-label={`Call ${name}`}>Call</a>
    </span>
  );
}

function PostView({ p, slug, me, moderator, canPost, reply }: { p: Post; slug: string; me: string | null; moderator: boolean; canPost: boolean; reply?: boolean }) {
  const staff = p.role === "admin" || p.role === "instructor";
  return (
    <article id={`post-${p.id}`} className={`flex gap-3 ${reply ? "" : "scroll-mt-24"}`}>
      <span aria-hidden="true" className={`flex flex-none items-center justify-center rounded-full font-bold ${reply ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm"} ${staff ? "bg-navy text-gold" : "bg-mist text-navy"}`}>
        {initials(p.name) || "?"}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
          <strong className="text-navy">{p.name}</strong>
          {staff && <span className="rounded bg-gold/20 px-1.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wide text-navy">STRONGS team</span>}
          {p.location && <span className="text-muted">{p.location}</span>}
          <span className="text-muted">· {ago(p.created_at)}</span>
        </p>
        {p.deleted ? (
          <p className="text-sm italic text-muted">This post was removed.</p>
        ) : (
          <p className="whitespace-pre-wrap break-words text-[0.9375rem] leading-relaxed text-ink">{p.body}</p>
        )}
        {!p.deleted && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-muted">
            <Contact phone={p.user_id === me ? null : p.phone} name={p.name} />
            {canPost && !reply && <a href={`#reply-${p.id}`} className="no-underline">Reply</a>}
            {(p.user_id === me || moderator) && (
              <form action={deletePost}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className="cursor-pointer border-0 bg-transparent p-0 font-[inherit] text-xs font-semibold text-muted hover:text-[#8a1c1c]">Delete</button>
              </form>
            )}
            {canPost && p.user_id !== me && (
              <details className="group">
                <summary className="cursor-pointer list-none hover:text-royal">Report</summary>
                <form action={reportPost} className="mt-2 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="id" value={p.id} />
                  <input name="reason" maxLength={300} placeholder="What is wrong with this post?" className="field min-h-9 flex-1 py-1 text-sm" aria-label="Reason" />
                  <button type="submit" className="btn btn-navy min-h-9 cursor-pointer border-0 px-3 font-[inherit] text-xs">Send</button>
                </form>
              </details>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default async function ForumPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ tab?: string; error?: string; reported?: string }> }) {
  if (!hasDatabase) return <NotConnected />;
  const { slug } = await params;
  const sp = await searchParams;
  const user = await getUser();
  const access = await forumAccess(slug, user);
  if (!access) notFound();
  const { course, canPost, moderator, enrolled } = access;
  const tab = sp.tab === "classmates" ? "classmates" : "discussions";
  const threads = canPost && tab === "discussions" ? await getThreads(course.id) : [];
  const classmates = canPost && tab === "classmates" ? await getClassmates(course.id) : [];
  const home = courseHome(course, enrolled);

  return (
    <div className="edx bg-mist">
      {canPost && <AutoRefresh />}
      <section className="bg-navy text-white">
        <div className="container-site flex flex-col gap-3 py-[clamp(1.75rem,4vw,3rem)]">
          <p className="eyebrow-dark">Course forum</p>
          <h1 className="text-[clamp(1.238rem,3.28vw,1.968rem)] font-bold leading-tight">{course.title}</h1>
          <p className="text-sm text-pale">Discuss the lessons, ask questions, introduce yourself and connect with others taking this course.</p>
          <Link href={home} className="self-start text-sm font-semibold text-gold no-underline">← Back to the course</Link>
        </div>
      </section>

      {!canPost ? (
        <section className="container-site flex flex-col gap-4 py-10">
          <div className="flex max-w-xl flex-col gap-3 rounded-3xl border border-line bg-white p-6">
            <h2 className="text-lg font-bold text-navy">Join the conversation</h2>
            <p className="text-muted">{user ? "Enrol in this course to read and join its discussion." : "Sign in and enrol in this course to read and join its discussion."}</p>
            <Link href={user ? home : `/sign-in/?next=${encodeURIComponent(`/forum/${slug}/`)}`} className="btn btn-navy self-start">{user ? "Go to the course" : "Sign in"}</Link>
          </div>
        </section>
      ) : (
        <section className="container-site flex flex-col gap-5 py-6 sm:py-8">
          <nav aria-label="Forum" className="flex gap-2">
            {[
              { id: "discussions", label: "Discussions", href: `/forum/${slug}/` },
              { id: "classmates", label: "Classmates", href: `/forum/${slug}/?tab=classmates` },
            ].map((t) => (
              <Link key={t.id} href={t.href} aria-current={tab === t.id ? "page" : undefined} className={`rounded-full px-4 py-2 text-sm font-semibold no-underline ${tab === t.id ? "bg-navy text-white" : "border border-line bg-white text-navy"}`}>
                {t.label}
              </Link>
            ))}
          </nav>

          {sp.error && errors[sp.error] && <p role="alert" className="rounded-xl bg-white p-3 text-sm text-[#8a1c1c]">{errors[sp.error]}</p>}
          {sp.reported && <p role="status" className="rounded-xl bg-white p-3 text-sm text-royal">Thank you. The STRONGS team will look at that post.</p>}

          {tab === "discussions" ? (
            <>
              <form action={createPost} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:p-5">
                <input type="hidden" name="slug" value={slug} />
                <label htmlFor="new-post" className="font-semibold text-navy">Start a discussion</label>
                <textarea id="new-post" name="body" required minLength={2} maxLength={2000} rows={3} className="field" placeholder="Ask a question, share what you learned, or introduce yourself: your name, where you are and why you are taking this course." />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-muted">Be kind and keep to the course. Only share your phone number if you are comfortable doing so; if you are under 18, please don&apos;t.</p>
                  <button type="submit" className="btn btn-navy cursor-pointer border-0 font-[inherit]">Post</button>
                </div>
              </form>

              {threads.length === 0 ? (
                <p className="rounded-2xl bg-white p-6 text-center text-muted">No discussions yet. Be the first to say hello.</p>
              ) : (
                <ol className="flex flex-col gap-4">
                  {threads.map(({ thread, replies }) => (
                    <li key={thread.id} className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 sm:p-5">
                      <PostView p={thread} slug={slug} me={user?.id ?? null} moderator={moderator} canPost={canPost} />
                      {replies.length > 0 && (
                        <ol className="ml-5 flex flex-col gap-4 border-l-2 border-line pl-4 sm:ml-12">
                          {replies.map((r) => (
                            <li key={r.id}><PostView p={r} slug={slug} me={user?.id ?? null} moderator={moderator} canPost={canPost} reply /></li>
                          ))}
                        </ol>
                      )}
                      {!thread.deleted && (
                        <form id={`reply-${thread.id}`} action={createPost} className="ml-5 flex scroll-mt-24 items-end gap-2 sm:ml-12">
                          <input type="hidden" name="slug" value={slug} />
                          <input type="hidden" name="parent" value={thread.id} />
                          <textarea name="body" required minLength={2} maxLength={2000} rows={1} className="field min-h-11 flex-1 resize-y py-2 text-sm" placeholder="Write a reply" aria-label={`Reply to ${thread.name}`} />
                          <button type="submit" className="btn btn-navy min-h-11 cursor-pointer border-0 px-4 font-[inherit] text-sm">Reply</button>
                        </form>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4 text-sm">
                <p className="text-muted"><strong className="text-navy">{classmates.length}</strong> {classmates.length === 1 ? "person is" : "people are"} taking this course. Phone numbers appear only for people who chose to share theirs.</p>
                <Link href="/profile/" className="font-semibold no-underline">Edit my profile →</Link>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {classmates.map((c) => (
                  <li key={c.user_id} className="flex gap-3 rounded-2xl border border-line bg-white p-4">
                    <span aria-hidden="true" className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-mist text-sm font-bold text-navy">{initials(c.name) || "?"}</span>
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="font-semibold text-navy">{c.name}{c.user_id === user?.id && <span className="font-normal text-muted"> (you)</span>}</p>
                      {(c.location || c.languages) && <p className="text-xs text-muted">{[c.location, c.languages].filter(Boolean).join(" · ")}</p>}
                      {c.about && <p className="line-clamp-3 text-sm text-ink">{c.about}</p>}
                      {c.user_id !== user?.id && <Contact phone={c.phone} name={c.name} />}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </div>
  );
}
