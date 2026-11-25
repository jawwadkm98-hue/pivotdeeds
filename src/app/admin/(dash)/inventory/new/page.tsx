import { InventoryForm } from "@/components/admin/InventoryForm";

export default function NewListingPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-8">
      <p className="kicker">Inventory</p>
      <h1 className="mt-2 font-serif text-4xl font-medium">New listing</h1>
      <div className="mt-6">
        <InventoryForm />
      </div>
    </div>
  );
}
