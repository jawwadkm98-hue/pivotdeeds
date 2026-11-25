import { isAuthed } from "@/lib/auth";
import { inquiriesCsv } from "@/lib/inventory";
import { buyersCsv, messagesCsv, sellersCsv } from "@/lib/leads";

export const dynamic = "force-dynamic";

const files = {
  sellers: sellersCsv,
  buyers: buyersCsv,
  messages: messagesCsv,
  inquiries: inquiriesCsv,
} as const;

export async function GET(request: Request) {
  const site = request.headers.get("sec-fetch-site");
  if (site === "cross-site") return new Response("Forbidden", { status: 403 });
  if (!(await isAuthed())) return new Response("Unauthorized", { status: 401 });

  const type = new URL(request.url).searchParams.get("type");
  if (type !== "sellers" && type !== "buyers" && type !== "messages" && type !== "inquiries") {
    return new Response("Unknown export", { status: 400 });
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(await files[type](), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="crownwholesalers-${type}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
