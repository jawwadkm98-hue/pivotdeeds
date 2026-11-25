import fs from "node:fs";
import path from "node:path";
import { isAuthed } from "@/lib/auth";
import { resolveUpload } from "@/lib/leads";

export const dynamic = "force-dynamic";

const types: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(request: Request) {
  const site = request.headers.get("sec-fetch-site");
  if (site === "cross-site") return new Response("Forbidden", { status: 403 });
  if (!(await isAuthed())) return new Response("Unauthorized", { status: 401 });

  const filename = new URL(request.url).searchParams.get("name") ?? "";
  const full = resolveUpload(filename);
  if (!full) return new Response("Not found", { status: 404 });

  const body = fs.readFileSync(full);
  return new Response(body, {
    headers: {
      "Content-Type": types[path.extname(full)] ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
