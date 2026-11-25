import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@brand";
import { SellerForm } from "@/components/SellerForm";

export const metadata: Metadata = {
  title: "Sell diamonds and jewelry",
  description: `Request a cash offer from ${brand.name} on diamonds, jewelry, and watches. GIA and other lab reports are welcome. Nationwide.`,
  alternates: { canonical: "/sell/jewelry" },
};

export default function SellJewelryPage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:py-16">
      <div>
        <p className="kicker">Sell diamonds and jewelry</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl">Stones, pieces, and watches.</h1>
        <p className="mt-4 leading-relaxed text-moss">
          Loose diamonds, diamond jewelry, gold jewelry, watches, and other gemstones. A lab report such as GIA, AGS, or IGI makes the review clearer. You can still ask without one.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-moss">
          Photos are optional and stay on our server. A completed purchase may require a valid government ID under secondhand-dealer rules. We do not claim a dealer license here. Gold that is mostly scrap metal can go through <Link className="underline" href="/sell/gold">sell gold and precious metals</Link>.
        </p>
      </div>
      <SellerForm defaultCategory="jewelry" />
    </div>
  );
}
