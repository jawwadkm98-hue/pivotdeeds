import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { brand } from "@brand";
import { InterestForm } from "@/components/InterestForm";
import { ListingGallery } from "@/components/ListingGallery";
import { formatMoney } from "@/lib/format";
import { getPublishedListing, photoList } from "@/lib/inventory";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const listing = await getPublishedListing(Number((await params).id));
  if (!listing) return { title: "Listing" };
  return {
    title: `${listing.title} in ${listing.city}, ${listing.state}`,
    description: listing.description ?? `${listing.property_type} listed by ${brand.name}.`,
    alternates: { canonical: `/inventory/${listing.id}` },
  };
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const listing = await getPublishedListing(Number((await params).id));
  if (!listing) notFound();
  const photos = photoList(listing.photo_names);
  const facts = [
    listing.beds != null ? `${listing.beds} beds` : "",
    listing.baths != null ? `${listing.baths} baths` : "",
    listing.sqft != null ? `${listing.sqft.toLocaleString("en-US")} sqft` : "",
  ].filter(Boolean);

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
      <div>
        <Link href="/inventory" className="text-sm text-brass">
          All deals
        </Link>
        <p className="kicker mt-4 capitalize">{listing.status}</p>
        <h1 className="mt-2 font-serif text-4xl font-medium sm:text-5xl">{listing.title}</h1>
        <p className="mt-3 text-lg text-moss">
          {listing.city}, {listing.state}
          {listing.show_address && listing.address ? ` · ${listing.address}` : ""}
        </p>
        <div className="mt-6">
          <ListingGallery names={photos} alt={listing.title} />
        </div>
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            ["Type", listing.property_type],
            ["Asking", formatMoney(listing.asking_price)],
            ["ARV", formatMoney(listing.arv)],
            ["Estimated repairs", formatMoney(listing.estimated_repairs)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-sand bg-paper px-4 py-3">
              <dt className="text-xs uppercase tracking-[0.14em] text-moss">{label}</dt>
              <dd className="mt-1">{value}</dd>
            </div>
          ))}
        </dl>
        {facts.length ? <p className="mt-4 text-moss">{facts.join(" · ")}</p> : null}
        {listing.description ? <p className="mt-4 leading-relaxed">{listing.description}</p> : null}
      </div>
      <InterestForm inventoryId={listing.id} />
    </div>
  );
}
