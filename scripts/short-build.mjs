// Turns the plain-text course sources in content-src/short/*.md into src/content/short/*.json.
// Format:
//   @slug x  @title x  @category x  @level x  @effort x  @featured  @summary x  @audience x  @prerequisites x
//   @about            (paragraph lines follow)
//   @objectives / @outcomes / @reading   ("- item" lines follow)
//   # Module title | module summary
//   ## Lesson title | KJV references
//   lesson body (markdown)...
//   ### Quiz          then questions:  ? question   * right answer   - wrong answer   > explanation
//   @assignment Title (body follows)
//   @final            (questions follow)
import fs from "node:fs";
const src = "content-src/short", out = "src/content/short";
const only = process.argv.slice(2);
for (const file of fs.readdirSync(src).filter((f) => f.endsWith(".md"))) {
  if (only.length && !only.includes(file.replace(".md", ""))) continue;
  const c = { objectives: [], modules: [], final: [] };
  let mode = null, list = null, mod = null, lesson = null, qs = null, q = null, buf = [];
  const flush = () => {
    const text = buf.join("\n").trim(); buf = [];
    if (mode === "about") c.about = text;
    else if (mode === "lesson" && lesson) lesson.body = text;
    else if (mode === "assignment") c.assignment.body = text;
  };
  for (const raw of fs.readFileSync(`${src}/${file}`, "utf8").split("\n")) {
    const line = raw.replace(/\s+$/, "");
    let m;
    if ((m = line.match(/^@(\w+)\s*(.*)$/))) {
      flush(); const [, k, v] = m;
      if (["objectives", "outcomes", "reading"].includes(k)) { mode = "list"; list = c[k] = c[k]?.length ? c[k] : []; }
      else if (k === "about") mode = "about";
      else if (k === "final") { mode = "quiz"; qs = c.final; }
      else if (k === "assignment") { mode = "assignment"; c.assignment = { title: v, body: "" }; }
      else if (k === "featured") c.featured = true;
      else { c[k] = v; mode = null; }
      continue;
    }
    if ((m = line.match(/^# (.+?)\s*\|\s*(.+)$/))) { flush(); mod = { title: m[1], summary: m[2], lessons: [], quiz: [] }; c.modules.push(mod); mode = null; continue; }
    if ((m = line.match(/^## (.+?)(?:\s*\|\s*(.+))?$/))) { flush(); lesson = { title: m[1], ...(m[2] ? { scripture: m[2] } : {}), body: "" }; mod.lessons.push(lesson); mode = "lesson"; continue; }
    if (/^### Quiz/.test(line)) { flush(); mode = "quiz"; qs = mod.quiz; continue; }
    if (mode === "list") { if ((m = line.match(/^- (.+)$/))) list.push(m[1]); continue; }
    if (mode === "quiz") {
      if ((m = line.match(/^\? (.+)$/))) { q = { q: m[1], options: [], answer: -1 }; qs.push(q); }
      else if ((m = line.match(/^\* (.+)$/))) { q.answer = q.options.length; q.options.push(m[1]); }
      else if ((m = line.match(/^- (.+)$/))) q.options.push(m[1]);
      else if ((m = line.match(/^> (.+)$/))) q.why = m[1];
      continue;
    }
    buf.push(line);
  }
  flush();
  const ordered = { slug: c.slug, ...c };
  fs.writeFileSync(`${out}/${c.slug}.json`, JSON.stringify(ordered, null, 1) + "\n");
}
