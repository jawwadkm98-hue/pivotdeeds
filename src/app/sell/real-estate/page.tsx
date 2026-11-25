import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@brand";
import { SellerForm } from "@/components/SellerForm";

export const metadata: Metadata = {
  title: "Sell real estate",
  description: `Request a cash offer from ${brand.name} on a house, condo, townhome, multifamily, land, commercial property, or mobile home.`,
  alternates: { canonical: "/sell/real-estate" },
};

export default function SellRealEstatePage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:py-16">
      <div>
        <p className="kicker">Sell real estate</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl">A cash offer on the property, as-is.</h1>
        <p className="mt-4 leading-relaxed text-moss">
          Houses, condos, townhomes, multifamily, land, commercial property, and mobile homes. {brand.serviceArea}. Inherited, vacant, distressed, and pre-foreclosure situations are welcome. We are not a foreclosure consultant.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-moss">
          See <Link className="underline" href="/we-buy">what we buy</Link> and <Link className="underline" href="/situations">situations we see often</Link>. We may assign a purchase contract or resell for a profit, and we disclose that where state law requires it.
        </p>
      </div>
      <SellerForm defaultCategory="real_estate" />
    </div>
  );
}
