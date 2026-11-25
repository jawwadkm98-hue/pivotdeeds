import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@brand";
import { CrownMark } from "@/components/CrownMark";
import { LISTING_TYPES, STATES } from "@/lib/constants";
import { formatMoney, queryValue } from "@/lib/format";
import { countPublished, photoList, searchPublished, type Listing } from "@/lib/inventory";

export const metadata: Metadata = {
  title: "Available deals",
  description: `Browse deals ${brand.name} has available. New inventory is posted as it is ready.`,
  alternates: { canonical: "/inventory" },
};

function moneyParam(value: string): number | null {
  if (!/^\d{1,9}$/.test(value)) return null;
  return Number(value);
}

function facts(listing: Listing): string {
  return [
    listing.beds != null ? `${listing.beds} bd` : "",
    listing.baths != null ? `${listing.baths} ba` : "",
    listing.sqft != null ? `${listing.sqft.toLocaleString("en-US")} sqft` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

export default async function InventoryPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const state = queryValue(params.state).toUpperCase();
  const type = queryValue(params.type);
  const filters = {
    state: STATES.some(([code]) => code === state) ? state : "",
    type: LISTING_TYPES.includes(type as (typeof LISTING_TYPES)[number]) ? type : "",
    min: moneyParam(queryValue(params.min)),
    max: moneyParam(queryValue(params.max)),
  };
  const [total, rows] = await Promise.all([countPublished(), searchPublished(filters)]);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="kicker">Inventory</p>
      <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl">Deals we can show you.</h1>
      <p className="mt-4 max-w-2xl text-moss">Published deals only. An asking price is not a promise, and a listing can be an assignment rather than a sale from the current owner.</p>

      {total === 0 ? (
        <div className="reveal mt-10 rounded-3xl border border-sand bg-paper px-6 py-16 text-center">
          <CrownMark className="mx-auto mb-4 h-16 w-16 text-brass" />
          <h2 className="font-serif text-3xl">New deals coming soon - join our buyers list</h2>
          <Link href="/buyers" className="btn btn-primary mt-6">
            Join the buyers list
          </Link>
        </div>
      ) : (
        <>
          <form action="/inventory" className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <select className="control mt-0" name="state" defaultValue={filters.state} aria-label="State">
              <option value="">All states</option>
              {STATES.map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
            <select className="control mt-0" name="type" defaultValue={filters.type} aria-label="Property type">
              <option value="">All types</option>
              {LISTING_TYPES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <input className="control mt-0" name="min" inputMode="numeric" placeholder="Min price" defaultValue={filters.min ?? ""} aria-label="Minimum price" />
            <input className="control mt-0" name="max" inputMode="numeric" placeholder="Max price" defaultValue={filters.max ?? ""} aria-label="Maximum price" />
            <button className="btn btn-secondary" type="submit">
              Filter
            </button>
          </form>
          {rows.length === 0 ? <p className="mt-8 text-moss">No deals match those filters.</p> : null}
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((listing) => {
              const photo = photoList(listing.photo_names)[0];
              return (
                <Link key={listing.id} href={`/inventory/${listing.id}`} className="lift reveal overflow-hidden rounded-3xl border border-sand bg-paper">
                  {photo ? (
                    <img src={`/inventory/photo?name=${encodeURIComponent(photo)}`} alt="" className="h-44 w-full object-cover" />
                  ) : (
                    <div className="flex h-44 items-center justify-center bg-pine text-sm text-moss">No photo</div>
                  )}
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-[0.16em] text-brass">{listing.status}</p>
                    <h2 className="mt-2 font-serif text-2xl">{listing.title}</h2>
                    <p className="mt-1 text-sm text-moss">
                      {listing.city}, {listing.state}
                      {listing.show_address && listing.address ? ` · ${listing.address}` : ""}
                    </p>
                    <p className="mt-3 text-lg">{formatMoney(listing.asking_price)}</p>
                    <p className="mt-1 text-sm text-moss">{listing.property_type}</p>
                    {facts(listing) ? <p className="mt-1 text-sm text-moss">{facts(listing)}</p> : null}
                    <p className="mt-2 text-sm text-moss">
                      ARV {formatMoney(listing.arv)} · Repairs {formatMoney(listing.estimated_repairs)}
                    </p>
                    {listing.description ? <p className="mt-3 line-clamp-3 text-sm">{listing.description}</p> : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
