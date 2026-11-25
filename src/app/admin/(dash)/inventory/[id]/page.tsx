import { notFound } from "next/navigation";
import { ConfirmForm } from "@/components/admin/ConfirmForm";
import { InventoryForm } from "@/components/admin/InventoryForm";
import { removeInventory } from "@/lib/admin-actions";
import { getListing, photoList } from "@/lib/inventory";

export default async function EditListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const listing = await getListing(Number(id));
  if (!listing) notFound();
  const query = await searchParams;
  const saved = query.saved === "1";
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-8">
      <p className="kicker">Inventory</p>
      <h1 className="mt-2 font-serif text-4xl font-medium">Edit listing</h1>
      {saved ? <p role="status" className="mt-4 text-sm text-brass">Saved.</p> : null}
      <div className="mt-6">
        <InventoryForm listing={listing} photos={photoList(listing.photo_names)} />
      </div>
      <ConfirmForm className="mt-8" action={removeInventory} message="Delete this listing and its inquiries?" label="Delete listing">
        <input type="hidden" name="id" value={listing.id} />
      </ConfirmForm>
    </div>
  );
}
