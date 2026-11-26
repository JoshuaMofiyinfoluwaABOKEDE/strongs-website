import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { site } from "@/content/site";

const navy = rgb(11 / 255, 31 / 255, 58 / 255);
const royal = rgb(22 / 255, 78 / 255, 138 / 255);
const gold = rgb(201 / 255, 162 / 255, 74 / 255);
const muted = rgb(75 / 255, 85 / 255, 99 / 255);

const asset = (f: string) => readFile(path.join(process.cwd(), "src/assets/certificate", f));

type Fonts = { regular: PDFFont; italic: PDFFont; semibold: PDFFont; bold: PDFFont; serif: PDFFont };

/** The certificate as a landscape A4 PDF in the STRONGS colours. */
export async function certificatePdf(c: { code: string; learnerName: string; courseTitle: string; issuedAt: Date; verifyUrl: string; school?: string }) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(`Certificate of Completion: ${c.courseTitle}`);
  doc.setAuthor("STRONGS · The Spiritual Intellectuals");
  doc.setSubject(`${c.learnerName} · ${c.code}`);

  const [regular, italic, semibold, bold, serif, logoBytes] = await Promise.all([
    asset("Poppins_400Regular.ttf"),
    asset("Poppins_400Regular_Italic.ttf"),
    asset("Poppins_600SemiBold.ttf"),
    asset("Poppins_700Bold.ttf"),
    asset("NotoSerif_600SemiBold.ttf"),
    asset("strongs-logo.png"),
  ]);
  const fonts: Fonts = {
    regular: await doc.embedFont(regular, { subset: true }),
    italic: await doc.embedFont(italic, { subset: false }),
    semibold: await doc.embedFont(semibold, { subset: true }),
    bold: await doc.embedFont(bold, { subset: true }),
    serif: await doc.embedFont(serif, { subset: false }),
  };
  const logo = await doc.embedPng(logoBytes);

  const W = 842;
  const H = 595;
  const page = doc.addPage([W, H]);

  // Frame: navy band, then a thin gold rule.
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: navy });
  page.drawRectangle({ x: 16, y: 16, width: W - 32, height: H - 32, color: rgb(1, 1, 1) });
  page.drawRectangle({ x: 28, y: 28, width: W - 56, height: H - 56, borderColor: gold, borderWidth: 1.2 });
  // Gold corner marks.
  for (const [x, y, dx, dy] of [
    [28, 28, 1, 1],
    [W - 28, 28, -1, 1],
    [28, H - 28, 1, -1],
    [W - 28, H - 28, -1, -1],
  ]) {
    page.drawLine({ start: { x, y: y + dy * 6 }, end: { x: x + dx * 46, y: y + dy * 6 }, thickness: 3, color: gold });
    page.drawLine({ start: { x: x + dx * 6, y }, end: { x: x + dx * 6, y: y + dy * 46 }, thickness: 3, color: gold });
  }

  const centre = (text: string, y: number, font: PDFFont, size: number, color = navy, spacing = 0, maxWidth = W - 160) => {
    let s = size;
    const width = (sz: number) => font.widthOfTextAtSize(text, sz) + spacing * Math.max(0, text.length - 1);
    while (width(s) > maxWidth && s > 10) s -= 0.5;
    drawSpaced(page, text, (W - width(s)) / 2, y, font, s, color, spacing);
    return s;
  };

  // Logo and name of the mission.
  const logoSize = 58;
  page.drawImage(logo, { x: (W - logoSize) / 2, y: H - 58 - logoSize, width: logoSize, height: logoSize });
  centre("STRONGS", H - 136, fonts.bold, 20, navy, 5);
  centre("THE SPIRITUAL INTELLECTUALS", H - 152, fonts.semibold, 8, gold, 2.6);

  centre("CERTIFICATE OF COMPLETION", H - 200, fonts.semibold, 15, royal, 3.2);
  centre("This is to certify that", H - 236, fonts.italic, 13, muted);

  const nameFont = coversAll(fonts.serif, c.learnerName) ? fonts.serif : fonts.bold;
  centre(c.learnerName, H - 288, nameFont, 40, navy, 0, W - 200);
  page.drawLine({ start: { x: W / 2 - 170, y: H - 304 }, end: { x: W / 2 + 170, y: H - 304 }, thickness: 1, color: gold });

  centre(c.school === "theology" ? "has successfully completed the STRONGS School of Theology course" : "has successfully completed the STRONGS course", H - 334, fonts.regular, 13, muted);
  const titleFont = coversAll(fonts.bold, c.courseTitle) ? fonts.bold : fonts.serif;
  centre(c.courseTitle, H - 372, titleFont, 26, navy, 0, W - 180);

  // Footer: date, seal line, signatory.
  const date = c.issuedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const col = (x: number, top: string, bottom: string) => {
    page.drawLine({ start: { x: x - 110, y: 128 }, end: { x: x + 110, y: 128 }, thickness: 0.8, color: navy });
    const tw = fonts.semibold.widthOfTextAtSize(top, 12);
    page.drawText(top, { x: x - tw / 2, y: 136, size: 12, font: fonts.semibold, color: navy });
    const bw = fonts.regular.widthOfTextAtSize(bottom, 9);
    page.drawText(bottom, { x: x - bw / 2, y: 114, size: 9, font: fonts.regular, color: muted });
  };
  col(210, date, "Date of completion");
  col(W - 210, "General Coordinator", "STRONGS · The Spiritual Intellectuals");

  // Seal in the middle.
  page.drawCircle({ x: W / 2, y: 134, size: 34, borderColor: gold, borderWidth: 2 });
  page.drawCircle({ x: W / 2, y: 134, size: 29, borderColor: gold, borderWidth: 0.6 });
  const seal = "STRONGS";
  page.drawText(seal, { x: W / 2 - fonts.bold.widthOfTextAtSize(seal, 9) / 2, y: 136, size: 9, font: fonts.bold, color: navy });
  const year = String(c.issuedAt.getFullYear());
  page.drawText(year, { x: W / 2 - fonts.semibold.widthOfTextAtSize(year, 8) / 2, y: 124, size: 8, font: fonts.semibold, color: gold });

  centre(site.motto.join(" "), 78, fonts.italic, 9.5, royal);
  centre(`Certificate no. ${c.code}  ·  Verify at ${c.verifyUrl}`, 54, fonts.regular, 8, muted, 0, W - 120);

  return doc.save();
}

function drawSpaced(page: PDFPage, text: string, x: number, y: number, font: PDFFont, size: number, color: ReturnType<typeof rgb>, spacing: number) {
  if (!spacing) {
    page.drawText(text, { x, y, size, font, color });
    return;
  }
  let cx = x;
  for (const ch of text) {
    page.drawText(ch, { x: cx, y, size, font, color });
    cx += font.widthOfTextAtSize(ch, size) + spacing;
  }
}

/** True if the font has a glyph for every character (so a name is never printed with empty boxes). */
function coversAll(font: PDFFont, text: string) {
  const set = new Set(font.getCharacterSet());
  return [...text].every((ch) => ch === " " || set.has(ch.codePointAt(0)!));
}
