import Link from "next/link";
import { formatMoney } from "@/lib/format";
import { listInventory } from "@/lib/inventory";

export default async function InventoryAdminPage() {
  const rows = await listInventory();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kicker">Inventory</p>
          <h1 className="mt-2 font-serif text-4xl font-medium">Listings</h1>
          <p className="mt-2 text-sm text-moss">Nothing is public until you mark it published. The public page starts empty.</p>
        </div>
        <Link className="btn btn-primary" href="/admin/inventory/new">
          New listing
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto rounded-3xl border border-sand">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-paper text-moss">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Place</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Public</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-moss">
                  No listings yet.
                </td>
              </tr>
            ) : null}
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-sand">
                <td className="px-4 py-3">
                  <Link className="font-semibold underline decoration-brass/70" href={`/admin/inventory/${row.id}`}>
                    {row.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {row.city}, {row.state}
                </td>
                <td className="px-4 py-3">{formatMoney(row.asking_price)}</td>
                <td className="px-4 py-3 capitalize">{row.status}</td>
                <td className="px-4 py-3">{row.published ? "Published" : "Hidden"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
