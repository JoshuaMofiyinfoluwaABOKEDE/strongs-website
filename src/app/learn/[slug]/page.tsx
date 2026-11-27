import type { Metadata } from "next";
import Link from "next/link";
import { ForumCard } from "@/components/forum/ForumCard";
import { one } from "@/lib/db";
import { loadLearner } from "@/lib/learner";
import { assessmentHref, lessonHref, nextStep, sequence } from "@/lib/lms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false } };

export default async function CourseHome({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { user, outline, progress } = await loadLearner(slug);
  const items = sequence(outline);
  const next = nextStep(outline, progress);
  const last = progress.enrolment?.last_lesson_id;
  const resume = last && !progress.doneLessons.has(last) && items.some((i) => i.type === "lesson" && i.lesson.id === last) ? lessonHref(slug, last) : null;
  const nextHref = resume ?? (next ? (next.type === "lesson" ? lessonHref(slug, next.lesson.id) : assessmentHref(slug, next.assessment.id)) : null);
  const resumeItem = resume ? items.find((i) => i.type === "lesson" && i.lesson.id === last) : null;
  const nextTitle =
    resumeItem?.type === "lesson" ? resumeItem.lesson.title : next ? (next.type === "lesson" ? next.lesson.title : next.assessment.title) : "";
  const cert = progress.finished ? await one<{ code: string; revoked: boolean }>(`SELECT code, revoked FROM lms_certificate WHERE user_id = $1 AND course_id = $2`, [user.id, outline.course.id]) : null;
  const waiting = [...progress.submissions.values()].filter((s) => s.status === "pending").length;
  const revise = [...progress.submissions.entries()].filter(([, s]) => s.status === "revise");

  return (
    <div className="flex flex-col gap-8">
      {items.length === 0 ? (
        <div className="flex flex-col gap-3 rounded-3xl bg-mist p-8">
          <h1 className="h2 text-navy">Lessons are on the way</h1>
          <p className="lead text-muted">You are enrolled. The lessons for this course are still being prepared; they will appear here as soon as they are published.</p>
        </div>
      ) : progress.finished ? (
        <div className="flex flex-col gap-4 rounded-3xl bg-navy p-[clamp(1.5rem,4vw,2.5rem)] text-white">
          <p className="eyebrow-dark">Course complete</p>
          <h1 className="text-[clamp(1.62rem,2.788vw,2.132rem)] font-bold leading-tight">Well done, {user.name.split(" ")[0]}.</h1>
          <p className="lead text-pale">You have finished every lesson and passed every assessment in {outline.course.title}.</p>
          {cert && !cert.revoked && (
            <div className="flex flex-wrap gap-3">
              <a href={`/certificates/${cert.code}/pdf/`} className="btn btn-gold">Download your certificate</a>
              <Link href={`/certificates/${cert.code}/`} className="btn btn-line-light">View and share</Link>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-3xl bg-navy p-[clamp(1.5rem,4vw,2.5rem)] text-white">
          <p className="eyebrow-dark">{progress.complete === 0 ? "Ready when you are" : "Welcome back"}</p>
          <h1 className="text-[clamp(1.62rem,2.788vw,2.132rem)] font-bold leading-tight">{progress.complete === 0 ? "Start the course" : "Pick up where you stopped"}</h1>
          {nextHref ? (
            <>
              <p className="lead text-pale">Next: <strong className="text-white">{nextTitle}</strong></p>
              <Link href={nextHref} className="btn btn-gold self-start">{progress.complete === 0 ? "Start the first lesson" : "Continue"}</Link>
            </>
          ) : (
            <p className="lead text-pale">
              {waiting > 0 ? "Everything else is done. Your assignment is waiting to be reviewed; your certificate will be issued once it is approved." : "You are up to date with every published lesson."}
            </p>
          )}
        </div>
      )}

      <ForumCard slug={slug} />

      {revise.length > 0 && (
        <div className="rounded-2xl border border-gold bg-[#fbf5e6] p-5">
          <p className="font-semibold text-navy">An assignment needs another look</p>
          <ul className="pt-1">
            {revise.map(([id]) => {
              const l = items.find((i) => i.type === "lesson" && i.lesson.id === id);
              return l?.type === "lesson" ? <li key={id}><Link href={lessonHref(slug, id)}>{l.lesson.title}</Link></li> : null;
            })}
          </ul>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          [String(progress.complete), `of ${progress.total} steps done`],
          [`${progress.percent}%`, "complete"],
          [waiting ? String(waiting) : "–", waiting === 1 ? "assignment awaiting review" : "assignments awaiting review"],
        ].map(([big, small]) => (
          <div key={small} className="flex flex-col gap-1 rounded-2xl border border-line bg-white p-5">
            <span className="text-3xl font-extrabold text-navy">{big}</span>
            <span className="text-sm text-muted">{small}</span>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted">
        To finish the course and receive your certificate: complete every lesson, pass every quiz (you may retake them) and have each practical assignment approved.
      </p>
    </div>
  );
}
