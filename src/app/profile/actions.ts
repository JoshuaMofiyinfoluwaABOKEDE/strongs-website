"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { q } from "@/lib/db";
import { requireUser } from "@/lib/session";

const str = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export async function updateProfile(form: FormData) {
  const user = await requireUser("/profile/");
  const name = str(form, "name", 80);
  if (name.length < 2) redirect("/profile/?error=name");
  const phone = str(form, "phone", 24);
  if (phone && !/^\+?[\d\s()-]{7,24}$/.test(phone)) redirect("/profile/?error=phone");
  const about = String(form.get("about") ?? "").replace(/\r\n/g, "\n").trim().slice(0, 500);
  await q(`UPDATE "user" SET name = $2, "updatedAt" = now() WHERE id = $1`, [user.id, name]);
  await q(
    `INSERT INTO lms_profile (user_id, location, languages, about, phone, share_phone, updated_at) VALUES ($1,$2,$3,$4,$5,$6,now())
     ON CONFLICT (user_id) DO UPDATE SET location=EXCLUDED.location, languages=EXCLUDED.languages, about=EXCLUDED.about,
       phone=EXCLUDED.phone, share_phone=EXCLUDED.share_phone, updated_at=now()`,
    [user.id, str(form, "location", 80), str(form, "languages", 80), about, phone, !!phone && form.get("share_phone") === "on"],
  );
  revalidatePath("/profile/");
  redirect("/profile/?saved=1");
}
