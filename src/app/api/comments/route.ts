import { NextResponse, type NextRequest } from "next/server";
import { hasDatabase } from "@/lib/db";
import { ensureReady } from "@/lib/setup";
import { getUser } from "@/lib/session";
import { addComment, isArticle, isModerator, listComments, removeComment, reportComment } from "@/lib/comments";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

async function payload(article: string, extra: Record<string, unknown> = {}) {
  const user = await getUser();
  await ensureReady();
  const comments = await listComments(article, user);
  return NextResponse.json(
    { available: true, signedIn: !!user, name: user?.name ?? null, moderator: isModerator(user), comments, ...extra },
    { headers: noStore },
  );
}

/** Comments on one article. Anyone can read them. */
export async function GET(req: NextRequest) {
  const article = req.nextUrl.searchParams.get("article") ?? "";
  if (!isArticle(article)) return NextResponse.json({ error: "Unknown article" }, { status: 404 });
  if (!hasDatabase) return NextResponse.json({ available: false }, { headers: noStore });
  try {
    return await payload(article);
  } catch {
    return NextResponse.json({ available: false }, { headers: noStore });
  }
}

/** Post, delete or report a comment. Only for signed-in STRONGS accounts, from this site. */
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasDatabase) return NextResponse.json({ available: false }, { status: 503 });

  const data = (await req.json().catch(() => ({}))) as { action?: string; article?: string; body?: string; parent?: number; id?: number; reason?: string };
  const article = String(data.article ?? "");
  if (!isArticle(article)) return NextResponse.json({ error: "Unknown article" }, { status: 404 });

  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Please sign in to comment." }, { status: 401 });

  let error: string | null = null;
  if (data.action === "create") error = await addComment(article, user, String(data.body ?? ""), Number(data.parent) || null);
  else if (data.action === "delete") await removeComment(article, user, Number(data.id));
  else if (data.action === "report") await reportComment(article, user, Number(data.id), String(data.reason ?? ""));
  else return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  return payload(article, { error, reported: data.action === "report" });
}
