import { certificatePdf } from "@/lib/certificate-pdf";
import { getCertificate } from "@/lib/lms";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const cert = await getCertificate(code);
  if (!cert) return new Response("Certificate not found", { status: 404 });
  if (cert.revoked) return new Response("This certificate has been withdrawn.", { status: 410 });
  const url = new URL(req.url);
  const host = req.headers.get("x-forwarded-host") ?? url.host;
  const bytes = await certificatePdf({
    code: cert.code,
    learnerName: cert.learner_name,
    courseTitle: cert.course_title,
    issuedAt: new Date(cert.issued_at),
    verifyUrl: `${host}/certificates/${cert.code}`,
  });
  const file = `STRONGS-certificate-${cert.course_title.replace(/[^\w]+/g, "-")}-${cert.code}.pdf`;
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${file}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
