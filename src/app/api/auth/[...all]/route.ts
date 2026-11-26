import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";
import { hasDatabase } from "@/lib/db";
import { ensureReady } from "@/lib/setup";

async function handle(req: Request) {
  if (!hasDatabase) return Response.json({ message: "The courses platform is not connected yet." }, { status: 503 });
  await ensureReady();
  const h = toNextJsHandler(getAuth());
  // The site adds a trailing slash to every address; the sign-in routes are defined without one.
  const url = new URL(req.url);
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
    req = new Request(url, { method: req.method, headers: req.headers, body: req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer() });
  }
  return req.method === "GET" ? h.GET(req) : h.POST(req);
}

export { handle as GET, handle as POST };
