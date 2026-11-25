import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@brand";
import { SellerForm } from "@/components/SellerForm";

export const metadata: Metadata = {
  title: "Sell gold and precious metals",
  description: `Request a cash offer from ${brand.name} on gold, silver, platinum, coins, bars, and scrap. Nationwide, no obligation.`,
  alternates: { canonical: "/sell/gold" },
};

export default function SellGoldPage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:py-16">
      <div>
        <p className="kicker">Sell gold and precious metals</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl">Coins, bars, scrap, and bullion.</h1>
        <p className="mt-4 leading-relaxed text-moss">
          {brand.name} buys gold, silver, platinum, and related metals. {brand.serviceArea}. Weight and karat help us price the offer. If you do not know them, describe the pieces and add a photo if you have one.
        </p>
        <ul className="mt-6 list-disc space-y-2 pl-5 text-sm leading-relaxed text-moss">
          <li>Gold coins, bars, rounds, and scrap jewelry that is mainly metal.</li>
          <li>Silver and platinum.</li>
          <li>A finished purchase may require a valid government-issued photo ID under state and local precious-metals laws.</li>
        </ul>
        <p className="mt-4 text-sm text-moss">
          Diamonds and finished jewelry have their own page: <Link className="underline" href="/sell/jewelry">sell diamonds and jewelry</Link>.
        </p>
      </div>
      <SellerForm defaultCategory="precious_metals" />
    </div>
  );
}
