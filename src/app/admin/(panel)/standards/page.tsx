import { AdminTitle, Card } from "@/components/admin/ui";
import { standards } from "@/lib/lms";
import { requireAdmin } from "@/lib/session";

export default async function Standards() {
  await requireAdmin();
  return (
    <>
      <AdminTitle
        title="Course standards"
        intro="Every STRONGS course is checked against these standards before it opens for enrolment. Tick them on each course's page once a reviewer has read every lesson and quiz."
      />
      <ol className="flex flex-col gap-3">
        {standards.map((s, i) => (
          <li key={s.key} className="flex gap-4 rounded-2xl border border-line bg-white p-5">
            <span className="text-2xl font-extrabold text-royal">{i + 1}</span>
            <span className="flex flex-col gap-1"><span className="text-lg font-bold text-navy">{s.label}</span><span className="text-muted">{s.help}</span></span>
          </li>
        ))}
      </ol>
      <Card title="Writing lessons">
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[0.9375rem]">
          <li>Write each lesson yourself or with a named contributor, from Scripture and sound, credited sources. Do not paste in text you have not checked.</li>
          <li>Quote the Bible exactly from a named translation, with the reference, and read each verse in its context.</li>
          <li>Teach the core truths of the faith clearly. Where Christians differ on secondary matters, say so fairly and do not require one view.</li>
          <li>End each module with something to do: a practical assignment, a reflection or a short quiz.</li>
          <li>Quizzes should test understanding, not trivia. Give an explanation for each answer.</li>
          <li>Have a second person read every lesson before it is published.</li>
        </ul>
      </Card>
    </>
  );
}
