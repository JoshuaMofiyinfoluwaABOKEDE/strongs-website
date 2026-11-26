import { one } from "@/lib/db";
import { getUser, isInstructor } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Downloads an assignment file: only for the learner who handed it in, or an instructor. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return new Response("Please sign in.", { status: 401 });
  const f = await one<{ user_id: string; file_name: string | null; file_type: string | null; file_data: Buffer | null }>(
    `SELECT user_id, file_name, file_type, file_data FROM th_submission WHERE id = $1`,
    [Number(id)],
  );
  if (!f?.file_data) return new Response("Not found", { status: 404 });
  if (f.user_id !== user.id && !isInstructor(user)) return new Response("Not allowed", { status: 403 });
  return new Response(new Uint8Array(f.file_data), {
    headers: {
      "Content-Type": f.file_type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${(f.file_name || "assignment").replace(/[^\w.\- ]+/g, "_")}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
