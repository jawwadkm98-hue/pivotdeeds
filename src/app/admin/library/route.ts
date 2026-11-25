import { isAuthed } from "@/lib/auth";
import { readLibraryFile } from "@/lib/inventory";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAuthed())) return new Response("Unauthorized", { status: 401 });
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id)) return new Response("Not found", { status: 404 });
  const file = await readLibraryFile(id);
  if (!file) return new Response("Not found", { status: 404 });
  const filename = file.file.name.replace(/["\r\n]/g, "");
  return new Response(file.body as BodyInit, {
    headers: {
      "Content-Type": file.file.content_type,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
