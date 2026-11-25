import { publishedPhoto, readListingPhoto } from "@/lib/inventory";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const name = new URL(request.url).searchParams.get("name") ?? "";
  if (!(await publishedPhoto(name))) return new Response("Not found", { status: 404 });
  const photo = await readListingPhoto(name);
  if (!photo) return new Response("Not found", { status: 404 });
  return new Response(photo.body as BodyInit, {
    headers: {
      "Content-Type": photo.contentType,
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
