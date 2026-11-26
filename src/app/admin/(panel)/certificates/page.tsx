import Link from "next/link";
import { AdminTitle, Badge, Notice, btnGhost, date } from "@/components/admin/ui";
import { q } from "@/lib/db";
import type { CertificateRow } from "@/lib/lms";
import { correctCertificateName, setCertificateRevoked } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/session";

export default async function Certificates({ searchParams }: { searchParams: Promise<{ q?: string; saved?: string; error?: string }> }) {
  await requireAdmin();
  const { q: search = "", saved, error } = await searchParams;
  const rows = await q<CertificateRow & { email: string }>(
    `SELECT ce.*, u.email FROM lms_certificate ce JOIN "user" u ON u.id=ce.user_id
     ${search ? "WHERE lower(ce.learner_name) LIKE $1 OR lower(u.email) LIKE $1 OR upper(ce.code) LIKE upper($1) OR lower(ce.course_title) LIKE $1" : ""}
     ORDER BY ce.issued_at DESC LIMIT 300`,
    search ? [`%${search.toLowerCase()}%`] : [],
  );
  return (
    <>
      <AdminTitle title="Certificates" intro="Every certificate issued. Anyone can check a certificate number at /certificates/verify/." />
      {saved && <Notice>Certificate updated.</Notice>}
      {error && <Notice kind="error">Enter the full name.</Notice>}
      <form className="flex gap-2"><input name="q" defaultValue={search} placeholder="Name, email, course or number" className="field max-w-sm" /><button type="submit" className={btnGhost}>Search</button></form>
      {rows.length === 0 && <p className="text-muted">No certificates yet.</p>}
      <ul className="flex flex-col gap-3">
        {rows.map((c) => (
          <li key={c.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Link href={`/certificates/${c.code}/`} className="font-semibold">{c.code}</Link>
              <span className="text-navy">{c.learner_name}</span>
              <span className="text-sm text-muted">{c.course_title} · {date(c.issued_at)}</span>
              <span className="flex-1" />
              {c.revoked ? <Badge tone="warn">Withdrawn</Badge> : <Badge tone="ok">Valid</Badge>}
            </div>
            <details className="text-sm">
              <summary className="cursor-pointer text-royal">Manage</summary>
              <div className="flex flex-wrap gap-6 pt-3">
                <form action={correctCertificateName} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="id" value={c.id} />
                  <label className="label">Correct the name<input name="name" defaultValue={c.learner_name} className="field min-h-9 py-1" /></label>
                  <button type="submit" className={btnGhost}>Save</button>
                </form>
                <form action={setCertificateRevoked} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="revoke" value={c.revoked ? "false" : "true"} />
                  {!c.revoked && <label className="label">Reason<input name="reason" className="field min-h-9 py-1" /></label>}
                  <button type="submit" className={btnGhost}>{c.revoked ? "Restore" : "Withdraw"}</button>
                </form>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </>
  );
}
