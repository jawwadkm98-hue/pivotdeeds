import { isAuthed } from "@/lib/auth";
import { readSellerPhoto } from "@/lib/leads";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const site = request.headers.get("sec-fetch-site");
  if (site === "cross-site") return new Response("Forbidden", { status: 403 });
  if (!(await isAuthed())) return new Response("Unauthorized", { status: 401 });

  const filename = new URL(request.url).searchParams.get("name") ?? "";
  const photo = await readSellerPhoto(filename);
  if (!photo) return new Response("Not found", { status: 404 });

  return new Response(photo.body as BodyInit, {
    headers: {
      "Content-Type": photo.contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
