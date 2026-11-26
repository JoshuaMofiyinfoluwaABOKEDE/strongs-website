import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { LineCapStyle, PDFDocument, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { certificateSigner } from "@/content/certificate";

/* The STRONGS certificate: three rounded panels on warm paper, with a blue band behind them. */

const ink = rgb(17 / 255, 17 / 255, 17 / 255);
const navy = rgb(11 / 255, 31 / 255, 58 / 255);
const blue = rgb(52 / 255, 84 / 255, 170 / 255);
const paper = rgb(238 / 255, 236 / 255, 230 / 255);
const sky = rgb(214 / 255, 234 / 255, 240 / 255);
const muted = rgb(85 / 255, 85 / 255, 85 / 255);

const asset = (f: string) => readFile(path.join(process.cwd(), "src/assets/certificate", f));

type Fonts = { regular: PDFFont; semibold: PDFFont; bold: PDFFont; heavy: PDFFont; display: PDFFont; serif: PDFFont };

export async function certificatePdf(c: { code: string; learnerName: string; courseTitle: string; issuedAt: Date; verifyUrl: string; school?: string }) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(`Certificate of Completion: ${c.courseTitle}`);
  doc.setAuthor("STRONGS · The Spiritual Intellectuals");
  doc.setSubject(`${c.learnerName} · ${c.code}`);

  const [regular, semibold, bold, heavy, display, serif, logoBytes, signatureBytes] = await Promise.all([
    asset("Poppins_400Regular.ttf"),
    asset("Poppins_600SemiBold.ttf"),
    asset("Poppins_700Bold.ttf"),
    asset("Poppins-ExtraBold.ttf"),
    asset("ArchivoBlack-Regular.ttf"),
    asset("NotoSerif_600SemiBold.ttf"),
    asset("strongs-logo.png"),
    asset("signature.png").catch(() => null),
  ]);
  const fonts: Fonts = {
    regular: await doc.embedFont(regular, { subset: true }),
    semibold: await doc.embedFont(semibold, { subset: true }),
    bold: await doc.embedFont(bold, { subset: true }),
    heavy: await doc.embedFont(heavy, { subset: false }),
    display: await doc.embedFont(display, { subset: true }),
    serif: await doc.embedFont(serif, { subset: false }),
  };
  const logo = await doc.embedPng(logoBytes);
  const signature = signatureBytes ? await doc.embedPng(signatureBytes) : null;

  const W = 842;
  const H = 595;
  const page = doc.addPage([W, H]);
  const M = 38; // outer margin
  const gap = 18;
  const topH = 150;

  // Paper and the blue band across the lower part of the page.
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: paper });
  page.drawRectangle({ x: 0, y: 0, width: W, height: 222, color: blue });

  // Panel 1: the motto.
  const p1 = { x: M, top: H - M, w: 236, h: topH };
  panel(page, p1.x, p1.top, p1.w, p1.h, paper);
  page.drawText("Resolute. Resilient.", { x: p1.x + 22, y: p1.top - 44, size: 14, font: fonts.bold, color: ink });
  page.drawText("Relentless.", { x: p1.x + 22, y: p1.top - 63, size: 14, font: fonts.bold, color: ink });
  asterisk(page, p1.x + p1.w - 58, p1.top - p1.h + 44, 22, blue);

  // Panel 2: the title.
  const p2 = { x: M + p1.w + gap, top: H - M, w: W - 2 * M - p1.w - gap, h: topH };
  panel(page, p2.x, p2.top, p2.w, p2.h, sky);
  page.drawImage(logo, { x: p2.x + 26, y: p2.top - 44, width: 20, height: 20 });
  page.drawText("STRONGS · The Spiritual Intellectuals", { x: p2.x + 54, y: p2.top - 38, size: 10.5, font: fonts.bold, color: ink });
  page.drawText("CERTIFICATE", { x: p2.x + 26, y: p2.top - 96, size: fit(fonts.display, "CERTIFICATE", 50, p2.w - 52), font: fonts.display, color: ink });
  page.drawText("of Completion", { x: p2.x + 27, y: p2.top - 122, size: 17, font: fonts.bold, color: ink });

  // Panel 3: the award.
  const p3 = { x: M, top: H - M - topH - gap, w: W - 2 * M, h: H - 2 * M - topH - gap };
  panel(page, p3.x, p3.top, p3.w, p3.h, paper);
  const split = p3.x + p3.w * 0.67;
  page.drawLine({ start: { x: split, y: p3.top - 40 }, end: { x: split, y: p3.top - p3.h + 40 }, thickness: 0.6, color: rgb(0.78, 0.78, 0.76) });

  const lx = p3.x + 34;
  const lw = split - lx - 34;
  page.drawText("Proudly awarded to", { x: lx, y: p3.top - 84, size: 13, font: fonts.semibold, color: ink });
  const nameFont = coversAll(fonts.heavy, c.learnerName) ? fonts.heavy : fonts.serif;
  page.drawText(c.learnerName, { x: lx, y: p3.top - 132, size: fit(nameFont, c.learnerName, 40, lw), font: nameFont, color: ink });

  const what = c.school === "theology" ? "For completing the STRONGS School of Theology course" : "For completing the STRONGS course";
  const date = c.issuedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  page.drawLine({ start: { x: lx, y: p3.top - 168 }, end: { x: lx + 18, y: p3.top - 168 }, thickness: 1, color: blue });
  let y = p3.top - 172;
  page.drawText(what, { x: lx + 30, y, size: 11, font: fonts.semibold, color: ink });
  y -= 22;
  const titleFont = coversAll(fonts.bold, c.courseTitle) ? fonts.bold : fonts.serif;
  for (const line of wrap(titleFont, c.courseTitle, 16, lw - 30)) {
    page.drawText(line, { x: lx + 30, y, size: 16, font: titleFont, color: ink });
    y -= 21;
  }
  page.drawText(`Completed on ${date}.`, { x: lx + 30, y: y + 1, size: 11, font: fonts.semibold, color: ink });
  y -= 30;
  for (const line of wrap(fonts.regular, `Certificate no. ${c.code}. Anyone can confirm this certificate at ${c.verifyUrl}`, 9, lw)) {
    page.drawText(line, { x: lx, y, size: 9, font: fonts.regular, color: muted });
    y -= 13;
  }

  // Right column: wave mark, signature, signatory.
  const rx = split + 34;
  const rw = p3.x + p3.w - 34 - rx;
  waves(page, rx + rw - 82, p3.top - 84, 82, blue);
  const lineY = p3.top - p3.h + 96;
  if (signature) {
    const sh = 46;
    const sw = Math.min(rw, (signature.width / signature.height) * sh);
    page.drawImage(signature as PDFImage, { x: rx, y: lineY + 6, width: sw, height: sh });
  }
  page.drawLine({ start: { x: rx, y: lineY }, end: { x: rx + Math.min(rw, 170), y: lineY }, thickness: 0.8, color: ink });
  page.drawText(certificateSigner.name, { x: rx, y: lineY - 18, size: fit(fonts.bold, certificateSigner.name, 10.5, rw), font: fonts.bold, color: ink });
  page.drawText(certificateSigner.role, { x: rx, y: lineY - 32, size: 9.5, font: fonts.regular, color: ink });

  return doc.save();
}

/** A rounded panel with a thin dark outline. (x, top) is its top-left corner. */
function panel(page: PDFPage, x: number, top: number, w: number, h: number, fill: ReturnType<typeof rgb>) {
  const r = 16;
  const d = `M ${r} 0 H ${w - r} Q ${w} 0 ${w} ${r} V ${h - r} Q ${w} ${h} ${w - r} ${h} H ${r} Q 0 ${h} 0 ${h - r} V ${r} Q 0 0 ${r} 0 Z`;
  page.drawSvgPath(d, { x, y: top, color: fill, borderColor: ink, borderWidth: 1.1 });
}

/** An eight-armed asterisk, the mark in the motto panel. */
function asterisk(page: PDFPage, cx: number, cy: number, r: number, color: ReturnType<typeof rgb>) {
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 4 + Math.PI / 2;
    const dx = Math.cos(a) * r;
    const dy = Math.sin(a) * r;
    page.drawLine({ start: { x: cx - dx, y: cy - dy }, end: { x: cx + dx, y: cy + dy }, thickness: 7.5, color, lineCap: LineCapStyle.Butt });
  }
}

/** Three wavy lines, as in the reference design. */
function waves(page: PDFPage, x: number, top: number, w: number, color: ReturnType<typeof rgb>) {
  const seg = w / 8;
  for (let k = 0; k < 3; k++) {
    let d = `M 0 ${k * 7}`;
    for (let i = 0; i < 8; i++) d += ` q ${seg / 2} ${i % 2 ? 4 : -4} ${seg} 0`;
    page.drawSvgPath(d, { x, y: top, borderColor: color, borderWidth: 1.8 });
  }
}

function fit(font: PDFFont, text: string, size: number, maxWidth: number) {
  let s = size;
  while (font.widthOfTextAtSize(text, s) > maxWidth && s > 9) s -= 0.5;
  return s;
}

function wrap(font: PDFFont, text: string, size: number, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** True if the font has a glyph for every character (so a name is never printed with empty boxes). */
function coversAll(font: PDFFont, text: string) {
  const set = new Set(font.getCharacterSet());
  return [...text].every((ch) => ch === " " || set.has(ch.codePointAt(0)!));
}
