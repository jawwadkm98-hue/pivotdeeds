import type { Metadata } from "next";
import { brand } from "@brand";
import { BuyerForm } from "@/components/BuyerForm";

export const metadata: Metadata = {
  title: "Cash buyers list",
  description: `Join the ${brand.name} buyers list for real estate, precious metals, jewelry, and the categories you actually buy.`,
  alternates: { canonical: "/buyers" },
  openGraph: {
    title: `Cash buyers list | ${brand.name}`,
    description: `Tell ${brand.name} your markets, property types, price range, and buy box.`,
    url: "/buyers",
  },
};

export default function BuyersPage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:py-16">
      <div>
        <p className="kicker">Cash buyers</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl">Get deals that fit your buy box.</h1>
        <p className="mt-4 leading-relaxed text-moss">
          {brand.name} buys real estate, and sometimes assigns the purchase contract, and we also buy metals and jewelry. The list is how we know which category and market to call.
        </p>
        <ul className="mt-8 space-y-4 text-sm leading-relaxed text-moss">
          <li>Tell us the states, property types, and prices you actually close on.</li>
          <li>We may ask for proof of funds before we share an address.</li>
          <li>A deal may be an assignment. Where required, we disclose that we hold an equitable interest and may not be able to convey title before you commit.</li>
          <li>Joining is free and is not a promise that a property will be offered to you.</li>
        </ul>
      </div>
      <div>
        <BuyerForm />
      </div>
    </div>
  );
}
