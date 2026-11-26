// Checks every short course file. Run: node scripts/check-short.mjs [slug…]
import fs from "node:fs";
import path from "node:path";
import { bcv_parser } from "bible-passage-reference-parser/esm/bcv_parser.js";
import * as lang from "bible-passage-reference-parser/esm/lang/en.js";

const bcv = new bcv_parser(lang);
bcv.set_options({ versification_system: "kjv", osis_compaction_strategy: "bcv" });
const dir = path.resolve("src/content/short");
const only = process.argv.slice(2);
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && (!only.length || only.includes(f.replace(".json", ""))));
const original = new Set(fs.readFileSync("src/content/courses.ts", "utf8").match(/slug: "([^"]+)"/g).map((s) => s.slice(7, -1)));
const categories = ["bible", "theology", "living", "history", "evangelism", "writing", "music", "media", "leadership", "health", "skills"];
let problems = 0;
const say = (f, m) => { problems++; console.log(`✗ ${f}: ${m}`); };
const words = (s) => s.split(/\s+/).filter(Boolean).length;
const t = { courses: 0, modules: 0, lessons: 0, words: 0, questions: 0 };

function refs(f, where, s) {
  for (const part of s.split(";").map((x) => x.trim()).filter(Boolean)) {
    const osis = bcv.parse(part).osis();
    if (!osis) say(f, `${where}: unknown reference “${part}”`);
  }
}
function qs(f, where, list, min) {
  if (!(list?.length >= min)) say(f, `${where}: needs ${min}+ questions`);
  (list ?? []).forEach((q, i) => {
    t.questions++;
    if (!q.q || !Array.isArray(q.options) || q.options.length < 3) say(f, `${where} q${i + 1}: needs a question and 3+ options`);
    if (!(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < (q.options?.length ?? 0))) say(f, `${where} q${i + 1}: bad answer index`);
    if (new Set(q.options ?? []).size !== (q.options ?? []).length) say(f, `${where} q${i + 1}: duplicate options`);
  });
}

for (const file of files) {
  const f = file.replace(".json", "");
  let c;
  try { c = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")); } catch (e) { say(f, `invalid JSON: ${e.message}`); continue; }
  t.courses++;
  if (c.slug !== f) say(f, "slug does not match file name");
  if (!original.has(c.slug)) {
    for (const k of ["title", "category", "level", "summary", "about"]) if (!c[k]) say(f, `new course: missing ${k}`);
    if (c.category && !categories.includes(c.category)) say(f, `unknown category ${c.category}`);
    if (!(c.outcomes?.length >= 3)) say(f, "new course: needs 3+ outcomes");
  }
  if (!(c.objectives?.length >= 3)) say(f, "needs 3+ objectives");
  if (!(c.modules?.length >= 2 && c.modules.length <= 6)) say(f, `needs 2–6 modules (has ${c.modules?.length})`);
  (c.modules ?? []).forEach((m, i) => {
    const w = `module ${i + 1}`;
    t.modules++;
    if (!m.title || !m.summary) say(f, `${w}: missing title or summary`);
    if (!(m.lessons?.length >= 2 && m.lessons.length <= 4)) say(f, `${w}: needs 2–4 lessons`);
    (m.lessons ?? []).forEach((l, j) => {
      t.lessons++; t.words += words(l.body ?? "");
      if (!l.title || !l.body) say(f, `${w} lesson ${j + 1}: missing title/body`);
      if (words(l.body ?? "") < 90) say(f, `${w} lesson ${j + 1}: body too short (${words(l.body ?? "")} words)`);
      if (l.scripture) refs(f, `${w} lesson ${j + 1}`, l.scripture);
    });
    qs(f, `${w} quiz`, m.quiz, 4);
  });
  if (!c.assignment?.title || words(c.assignment?.body ?? "") < 40) say(f, "needs a practical assignment (40+ words)");
  qs(f, "final", c.final, 8);
}
console.log(`\n${t.courses} courses · ${t.modules} modules · ${t.lessons} lessons · ${t.words.toLocaleString()} lesson words · ${t.questions} questions`);
console.log(problems ? `${problems} problem(s).` : "All checks passed.");
process.exit(problems ? 1 : 0);
