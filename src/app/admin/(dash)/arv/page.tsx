import { ArvCalculator, type ArvListingChoice } from "@/components/admin/ArvCalculator";
import { listInventory } from "@/lib/inventory";

export default async function ArvPage() {
  const listings = await listInventory();
  const choices: ArvListingChoice[] = listings.map((listing) => ({
    id: listing.id,
    title: listing.title,
    address: [listing.address, listing.city, listing.state].filter(Boolean).join(", "),
    sqft: listing.sqft,
    beds: listing.beds,
    baths: listing.baths,
  }));
  return <ArvCalculator listings={choices} />;
}
