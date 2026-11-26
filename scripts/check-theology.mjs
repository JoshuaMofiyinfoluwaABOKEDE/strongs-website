// Checks every theology course file. Run: node scripts/check-theology.mjs [slug…]
// Structure, counts, answer keys, and that every Bible reference exists (KJV versification).
import fs from "node:fs";
import path from "node:path";
import { bcv_parser } from "bible-passage-reference-parser/esm/bcv_parser.js";
import * as lang from "bible-passage-reference-parser/esm/lang/en.js";

const bcv = new bcv_parser(lang);
bcv.set_options({ versification_system: "kjv", osis_compaction_strategy: "bcv" });
const dir = path.resolve("src/content/theology/courses");
const only = process.argv.slice(2);
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && (!only.length || only.includes(f.replace(".json", ""))));
let problems = 0;
const say = (f, m) => { problems++; console.log(`✗ ${f}: ${m}`); };

function checkRef(f, where, ref) {
  // Allow several references separated by semicolons.
  for (const part of ref.split(";").map((s) => s.trim()).filter(Boolean)) {
    const osis = bcv.parse(part).osis();
    if (!osis) { say(f, `${where}: unknown reference “${part}”`); continue; }
    const end = part.match(/[-–](\d+)\s*$/);
    if (end && !osis.endsWith(`.${end[1]}`) && !osis.endsWith(`${end[1]}`)) say(f, `${where}: range end not valid in “${part}” (${osis})`);
    const single = part.match(/:(\d+)\s*$/);
    if (single && !end && !osis.endsWith(`.${single[1]}`)) say(f, `${where}: verse not valid in “${part}” (${osis})`);
  }
}

const words = (s) => s.split(/\s+/).filter(Boolean).length;
let totals = { courses: 0, modules: 0, lessons: 0, words: 0, questions: 0 };

for (const file of files) {
  const f = file.replace(".json", "");
  let c;
  try { c = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")); } catch (e) { say(f, `invalid JSON: ${e.message}`); continue; }
  totals.courses++;
  if (c.slug !== f) say(f, `slug “${c.slug}” does not match file name`);
  for (const k of ["title", "track", "level", "summary", "description"]) if (!c[k]) say(f, `missing ${k}`);
  if (!(c.objectives?.length >= 3)) say(f, "needs 3+ objectives");
  if (!(c.outcomes?.length >= 3)) say(f, "needs 3+ outcomes");
  if (!(c.modules?.length >= 4 && c.modules.length <= 6)) say(f, `needs 4–6 modules (has ${c.modules?.length})`);
  const allTerms = new Set();
  (c.modules ?? []).forEach((m, i) => {
    const w = `week ${i + 1}`;
    totals.modules++;
    if (!m.title || !m.intro) say(f, `${w}: missing title or intro`);
    if (!(m.lessons?.length >= 2 && m.lessons.length <= 4)) say(f, `${w}: needs 2–4 lessons`);
    (m.lessons ?? []).forEach((l, j) => {
      totals.lessons++; totals.words += words(l.body ?? "");
      if (!l.title || !l.body) say(f, `${w} lesson ${j + 1}: missing title/body`);
      if (words(l.body ?? "") < 70) say(f, `${w} lesson ${j + 1}: body too short (${words(l.body ?? "")} words)`);
      if (!(l.refs?.length >= 1)) say(f, `${w} lesson ${j + 1}: needs at least one KJV reference`);
      (l.refs ?? []).forEach((r) => checkRef(f, `${w} lesson ${j + 1}`, r));
    });
    if (!(m.terms?.length >= 5)) say(f, `${w}: needs 5+ key terms`);
    (m.terms ?? []).forEach((t) => { if (allTerms.has(t.term.toLowerCase())) say(f, `${w}: term “${t.term}” repeated`); allTerms.add(t.term.toLowerCase()); });
    if (!(m.texts?.length >= 4)) say(f, `${w}: needs 4+ key texts`);
    (m.texts ?? []).forEach((t) => checkRef(f, `${w} key text`, t.ref));
    if (!(m.summary?.length >= 3)) say(f, `${w}: needs 3+ summary points`);
    if (!(m.questions?.length >= 4)) say(f, `${w}: needs 4+ own quiz questions`);
    (m.questions ?? []).forEach((q, j) => {
      if (!(q.options?.length >= 3) || !(q.answer >= 0 && q.answer < q.options.length)) say(f, `${w} question ${j + 1}: bad options/answer`);
      if (new Set(q.options?.map((o) => o.toLowerCase())).size !== q.options?.length) say(f, `${w} question ${j + 1}: duplicate options`);
    });
    const bank = (m.questions?.length ?? 0) + 2 * (m.terms?.length ?? 0) + 2 * (m.texts?.length ?? 0);
    totals.questions += bank;
    if (bank < 20) say(f, `${w}: quiz bank only ${bank} questions`);
  });
  if (!(c.written?.short?.length >= 6)) say(f, "needs 6+ short-answer questions");
  (c.written?.short ?? []).forEach((s, j) => { if (!(s.keywords?.length >= 2) || !s.model) say(f, `short ${j + 1}: needs 2+ keyword groups and a model answer`); });
  if (!(c.written?.lists?.length >= 3)) say(f, "needs 3+ list questions");
  (c.written?.lists ?? []).forEach((l, j) => { if (!(l.items?.length >= l.need) || !(l.need >= 2)) say(f, `list ${j + 1}: items fewer than need`); });
  if (!(c.assignments?.length >= 2)) say(f, "needs 2+ assignments");
  if (!(c.examMinutes >= 30)) say(f, "examMinutes missing");
}
console.log(`\n${totals.courses} courses · ${totals.modules} weeks · ${totals.lessons} lessons · ${totals.words.toLocaleString()} lesson words · ${totals.questions} quiz-bank questions`);
console.log(problems ? `${problems} problem(s).` : "All checks passed.");
process.exit(problems ? 1 : 0);
