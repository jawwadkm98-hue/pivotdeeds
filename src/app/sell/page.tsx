import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@brand";
import { SellerForm } from "@/components/SellerForm";
import { sellLinks } from "@/content/nav";

export const metadata: Metadata = {
  title: "Get a cash offer",
  description: `Request a no-obligation cash offer from ${brand.name} on real estate, gold, diamonds, jewelry, or another high-value asset.`,
  alternates: { canonical: "/sell" },
};

export default function SellPage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:py-16">
      <div>
        <p className="kicker">Sell</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl">Request a no-obligation cash offer.</h1>
        <p className="mt-4 leading-relaxed text-moss">
          Choose a category and send the details. {brand.serviceArea}. The same form covers real estate, precious metals, jewelry, and other assets we may add later.
        </p>
        <ul className="mt-6 space-y-2 text-sm font-semibold">
          {sellLinks.slice(0, 3).map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="underline decoration-brass underline-offset-4">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <SellerForm />
    </div>
  );
}
