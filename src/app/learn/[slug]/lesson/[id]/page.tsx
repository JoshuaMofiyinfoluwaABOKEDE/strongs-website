import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadLearner } from "@/lib/learner";
import { assessmentHref, lessonHref, sequence, touchLesson } from "@/lib/lms";
import { renderMarkdown } from "@/lib/markdown";
import { completeLesson, submitAssignment } from "@/app/learn/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false } };

/** Turns a YouTube or Vimeo link into an embeddable address; other links are shown as a plain link. */
function embedUrl(url: string) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug, id } = await params;
  const { error } = await searchParams;
  const { user, outline, progress } = await loadLearner(slug);
  const items = sequence(outline);
  const idx = items.findIndex((i) => i.type === "lesson" && i.lesson.id === Number(id));
  if (idx < 0) notFound();
  const item = items[idx];
  if (item.type !== "lesson") notFound();
  const lesson = item.lesson;
  const mod = outline.modules.find((m) => m.id === lesson.module_id)!;
  const moduleNo = outline.modules.indexOf(mod) + 1;
  await touchLesson(user.id, outline.course.id, lesson.id);

  const prev = items[idx - 1];
  const next = items[idx + 1];
  const href = (i: (typeof items)[number]) => (i.type === "lesson" ? lessonHref(slug, i.lesson.id) : assessmentHref(slug, i.assessment.id));
  const title = (i: (typeof items)[number]) => (i.type === "lesson" ? i.lesson.title : i.assessment.title);
  const done = progress.doneLessons.has(lesson.id);
  const sub = progress.submissions.get(lesson.id);
  const video = lesson.video_url ? embedUrl(lesson.video_url) : null;

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-3 border-b border-line pb-6">
        <p className="eyebrow">Module {moduleNo} · {mod.title}</p>
        <h1 className="text-[clamp(1.9rem,3.6vw,2.8rem)] font-bold leading-[1.1] tracking-[-0.015em] text-navy">{lesson.title}</h1>
        <p className="text-sm text-muted">
          {lesson.kind === "assignment" ? "Practical assignment" : "Reading"} · about {lesson.minutes} minutes
          {done && <span className="font-semibold text-royal"> · Completed ✓</span>}
        </p>
      </header>

      {lesson.scripture && (
        <blockquote className="border-l-[3px] border-gold pl-5 text-lg font-medium italic leading-relaxed text-navy">{lesson.scripture}</blockquote>
      )}

      {lesson.video_url &&
        (video ? (
          <div className="aspect-video overflow-hidden rounded-2xl bg-navy">
            <iframe src={video} title={`Video: ${lesson.title}`} className="h-full w-full" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" loading="lazy" />
          </div>
        ) : (
          <p><a href={lesson.video_url} target="_blank" rel="noopener">Watch the video for this lesson</a></p>
        ))}

      {lesson.body && <div className="lesson-text max-w-3xl" dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson.body) }} />}

      {lesson.resources.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl bg-mist p-5">
          <h2 className="text-lg font-bold text-navy">Reading and resources</h2>
          <ul className="flex flex-col gap-1.5">
            {lesson.resources.map((r) => (
              <li key={r.url}><a href={r.url} target="_blank" rel="noopener">{r.label || r.url}</a></li>
            ))}
          </ul>
        </div>
      )}

      {lesson.kind === "assignment" ? (
        <section aria-labelledby="hand-in" className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-[clamp(1.25rem,3vw,2rem)]">
          <h2 id="hand-in" className="text-xl font-bold text-navy">Hand in your assignment</h2>
          {sub?.status === "approved" && <p className="rounded-xl bg-mist px-4 py-3 text-sm text-navy"><strong>Approved.</strong> {sub.feedback}</p>}
          {sub?.status === "pending" && <p className="rounded-xl bg-[#fbf5e6] px-4 py-3 text-sm text-navy"><strong>Received</strong> and waiting to be reviewed. You can keep studying meanwhile; you may also edit and re-send it.</p>}
          {sub?.status === "revise" && <p className="rounded-xl bg-[#fdecec] px-4 py-3 text-sm text-[#8a1c1c]"><strong>Please revise and send again.</strong> {sub.feedback}</p>}
          {error === "empty" && <p role="alert" className="text-sm text-[#8a1c1c]">Write your answer or add a link before sending.</p>}
          {error === "link" && <p role="alert" className="text-sm text-[#8a1c1c]">The link must start with http:// or https://</p>}
          {sub?.status !== "approved" && (
            <form action={submitAssignment} className="flex flex-col gap-4">
              <input type="hidden" name="lessonId" value={lesson.id} />
              <label className="label">
                Your work
                <textarea name="text" rows={9} defaultValue={sub?.text ?? ""} className="field py-3" />
              </label>
              <label className="label">
                Link (optional)
                <input name="link" type="url" defaultValue={sub?.link ?? ""} placeholder="https://" className="field" />
                <span className="text-xs font-normal text-muted">For a document, recording or video kept online (Google Drive, YouTube and so on).</span>
              </label>
              <button type="submit" className="btn btn-navy cursor-pointer self-start border-0 font-[inherit]">{sub ? "Send again" : "Send for review"}</button>
            </form>
          )}
        </section>
      ) : (
        <form action={completeLesson} className="flex flex-wrap items-center gap-4 rounded-2xl bg-mist p-5">
          <input type="hidden" name="lessonId" value={lesson.id} />
          <button type="submit" className="btn btn-navy cursor-pointer border-0 font-[inherit]">{done ? "Next" : "Mark as complete and continue"} →</button>
          <span className="text-sm text-muted">{done ? "You have completed this lesson." : "Your progress is saved as you go."}</span>
        </form>
      )}

      <nav aria-label="Lesson navigation" className="flex flex-wrap justify-between gap-4 border-t border-line pt-5 text-sm">
        {prev ? <Link href={href(prev)}>← {title(prev)}</Link> : <span />}
        {next ? <Link href={href(next)} className="text-right">{title(next)} →</Link> : <Link href={`/learn/${slug}/`}>Course overview →</Link>}
      </nav>
    </article>
  );
}
