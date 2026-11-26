# Writing a School of Theology course

One JSON file per course in `courses/<slug>.json` (shape: `types.ts`). After adding or editing a file:

    node scripts/theology-index.mjs      # bundles every course file
    node scripts/check-theology.mjs      # checks structure, counts and every Bible reference

## Standards
- Plain English for believers who are not theologians. Short sentences. Explain every technical word.
- Original wording. Seminary curricula, Deeper Life doctrines and textbooks (Grudem, Erickson, Berkhof) guide the scope and order only; never copy their text.
- Scripture from the King James Version. Give references (e.g. "John 3:16"); quote only short phrases, exactly.
- Where Bible-believing traditions differ (eternal security, sanctification, Spirit baptism, healing, end times, church order, ordinances), present each view fairly, with its main Scriptures and strongest reasons, without the course taking a side. Name the traditions plainly (for example "Baptist", "Holiness/Deeper Life", "Pentecostal", "Reformed", "Wesleyan").
- Keep the core truths of the faith clear: the Trinity, the deity and humanity of Christ, His atoning death and bodily resurrection, salvation by grace through faith, and the authority of Scripture.

## Each course
- 4–6 modules (one per week), each with: `intro`, 3 lessons (about 100–150 words each, 2–4 KJV refs), 6 key terms (unique across the course), 5 key texts (`teaches` is one short sentence), 3–4 summary points, 4 multiple-choice questions.
- The quiz bank per week = 4 own questions + 2 per key term + 2 per key text (about 26). Learners get 10 at random.
- `written`: 6 short-answer questions (2–3 keyword groups each, plus a model answer) and 3 list questions.
- 2 assignments with a clear prompt and word range. `examMinutes`: 60 (75 for six-week courses).
- `reading`: 2–4 titles with authors (no quotations).

## Presentation (edX and UniAthena style, in STRONGS colours)
- Catalogue cards: course code, "Free certificate" badge, self-paced duration and hours, level, "Start now".
- Course page: highlights strip (hours, self-paced, free learning, certificate), About, What you'll learn, Key highlights, Syllabus by week, Who this course is for (`audience`, optional), How you are assessed, FAQs; sidebar with Course details, Enrol, Sample certificate, Further reading.
- Inside a course: Course and Progress tabs; the Course tab is an outline with Resume; each unit has a breadcrumb, a step bar for the week's units, and Previous/Next; Progress is a report card with a grade bar, pass line and grading breakdown.
