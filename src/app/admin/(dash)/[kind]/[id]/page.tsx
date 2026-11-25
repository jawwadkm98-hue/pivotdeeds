import { notFound } from "next/navigation";
import { RecordEditor } from "@/components/admin/RecordEditor";
import { queryValue } from "@/lib/format";
import { getInquiry, photoList } from "@/lib/inventory";
import { getBuyer, getMessage, getSeller } from "@/lib/leads";

function text(value: string | number | null | undefined): string {
  return value == null || value === "" ? "" : String(value);
}

export default async function RecordPage({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string; id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { kind, id } = await params;
  const recordId = Number(id);
  if (!Number.isInteger(recordId)) notFound();
  const saved = queryValue((await searchParams).saved) === "1";

  if (kind === "inquiries") {
    const row = await getInquiry(recordId);
    if (!row) notFound();
    return (
      <RecordEditor
        kind="inquiries"
        id={row.id}
        title={row.name}
        status={row.status}
        notes={row.notes}
        saved={saved}
        fields={[
          { label: "Listing", value: row.listing_title ? `${row.listing_title} (${row.listing_city}, ${row.listing_state})` : `Listing #${row.inventory_id}` },
          { label: "Phone", value: text(row.phone) },
          { label: "Email", value: text(row.email) },
          { label: "Message", value: text(row.message) },
          { label: "Received", value: row.created_at },
        ]}
      />
    );
  }

  if (kind === "sellers") {
    const row = await getSeller(recordId);
    if (!row) notFound();
    const photos = photoList(row.photo_names);
    return (
      <RecordEditor
        kind="sellers"
        id={row.id}
        title={row.name}
        status={row.status}
        notes={row.notes}
        saved={saved}
        fields={[
          { label: "Category", value: row.asset_category },
          { label: "Phone", value: row.phone },
          { label: "Email", value: row.email },
          { label: "Location", value: `${row.city}, ${row.state} ${row.zip}` },
          { label: "Address", value: text(row.address) },
          { label: "Timeline", value: row.timeline },
          { label: "Asking", value: text(row.asking_price) },
          { label: "Description", value: text(row.description) },
          { label: "Property", value: [row.property_type, row.condition, row.reason].filter(Boolean).join(" · ") },
          { label: "Item", value: [row.item_type, row.weight, row.purity, row.certification, row.quantity].filter(Boolean).join(" · ") },
        ]}
        extra={
          photos.length ? (
            <p className="mt-4 text-sm">
              {photos.map((name) => (
                <a key={name} className="mr-3 underline" href={`/admin/file?name=${encodeURIComponent(name)}`}>
                  {name}
                </a>
              ))}
            </p>
          ) : null
        }
      />
    );
  }

  if (kind === "buyers") {
    const row = await getBuyer(recordId);
    if (!row) notFound();
    return (
      <RecordEditor
        kind="buyers"
        id={row.id}
        title={row.name}
        status={row.status}
        notes={row.notes}
        saved={saved}
        fields={[
          { label: "Phone", value: row.phone },
          { label: "Email", value: row.email },
          { label: "Company", value: text(row.company) },
          { label: "Categories", value: row.categories },
          { label: "Markets", value: row.markets },
          { label: "Property types", value: row.property_types },
          { label: "Price range", value: row.price_range },
          { label: "Buy box", value: row.buy_box },
          { label: "Proof of funds", value: row.proof_of_funds },
        ]}
      />
    );
  }

  if (kind === "messages") {
    const row = await getMessage(recordId);
    if (!row) notFound();
    return (
      <RecordEditor
        kind="messages"
        id={row.id}
        title={row.name}
        status={row.status}
        notes={row.notes}
        saved={saved}
        fields={[
          { label: "Email", value: row.email },
          { label: "Phone", value: text(row.phone) },
          { label: "Message", value: row.message },
        ]}
      />
    );
  }

  notFound();
}
