import { notFound } from "next/navigation";
import { RecordBrowser } from "@/components/admin/RecordBrowser";
import { pageValue, queryValue } from "@/lib/format";
import { searchInquiries } from "@/lib/inventory";
import { leadRows, type LeadKind } from "@/lib/leads";

const titles: Record<string, string> = {
  sellers: "Seller leads",
  buyers: "Cash buyers",
  messages: "Messages",
  inquiries: "Inventory inquiries",
};

export default async function KindPage({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { kind } = await params;
  if (!titles[kind]) notFound();
  const queryParams = await searchParams;
  const query = queryValue(queryParams.q);
  const status = queryValue(queryParams.status);
  const page = pageValue(queryParams.page);
  if (kind === "inquiries") {
    const result = await searchInquiries(query, page, status);
    return (
      <RecordBrowser
        kind={kind}
        title={titles[kind]}
        query={query}
        status={status}
        page={result.page}
        pages={result.pages}
        total={result.total}
        rows={result.rows.map((row) => ({
          id: row.id,
          created_at: row.created_at,
          name: row.name,
          email: row.email,
          status: row.status,
          detail: row.listing_title ? `${row.listing_title}` : `Listing #${row.inventory_id}`,
        }))}
      />
    );
  }
  const result = await leadRows(kind as LeadKind, query, page, status);
  return <RecordBrowser kind={kind} title={titles[kind]} query={query} status={status} page={result.page} pages={result.pages} total={result.total} rows={result.rows} />;
}
