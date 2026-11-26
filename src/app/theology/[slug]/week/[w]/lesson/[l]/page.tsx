import { notFound } from "next/navigation";
import { Ref } from "@/components/theology/Ref";
import { q } from "@/lib/db";
import { lessonKey } from "@/lib/theology/content";
import { loadTheology } from "@/lib/theology/learner";
import { UnitShell } from "@/components/theology/Units";
import { renderMarkdown } from "@/lib/markdown";
import { completeTheologyLesson } from "@/app/theology/actions";

export const dynamic = "force-dynamic";

export default async function TheologyLesson({ params }: { params: Promise<{ slug: string; w: string; l: string }> }) {
  const { slug, w, l } = await params;
  const week = Number(w);
  const n = Number(l);
  const { user, c, row, g } = await loadTheology(slug);
  const m = c.modules[week - 1];
  const lesson = m?.lessons[n - 1];
  if (!lesson) notFound();
  await q(`UPDATE lms_enrolment SET last_key = $3, last_active_at = now() WHERE user_id = $1 AND course_id = $2`, [user.id, row.id, lessonKey(week, n)]);
  const done = g.lessonsDone.has(lessonKey(week, n));

  return (
    <UnitShell c={c} g={g} current={`w${week}l${n}`}>
    <article className="flex flex-col gap-6 sm:gap-8">
      <header className="flex flex-col gap-3 border-b border-line pb-4 sm:pb-6">
        <p className="eyebrow">Week {week} · {m.title} · Lesson {n} of {m.lessons.length}</p>
        <h1 className="text-[clamp(1.5rem,3.6vw,2.8rem)] font-bold leading-[1.1] tracking-[-0.015em] text-navy">{lesson.title}</h1>
        {done && <p className="text-sm font-semibold text-royal">Completed ✓</p>}
      </header>
      <div className="lesson-text max-w-3xl" dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson.body) }} />
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-2xl bg-mist p-4 text-sm sm:p-5 sm:text-[0.9375rem]">
        <span className="font-semibold text-navy">Read in the KJV:</span>
        {lesson.refs.map((r, i) => <span key={r}><Ref r={r} />{i < lesson.refs.length - 1 && ";"}</span>)}
      </div>
      <form action={completeTheologyLesson} className="flex flex-wrap items-center gap-4">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="week" value={week} />
        <input type="hidden" name="lesson" value={n} />
        <button type="submit" className="btn btn-navy cursor-pointer border-0 font-[inherit]">{done ? "Next" : "Mark as read and continue"} →</button>
        {n === m.lessons.length && <span className="text-sm text-muted">Then review the key terms and summary, and take the week&rsquo;s quiz.</span>}
      </form>
    </article>
    </UnitShell>
  );
}
