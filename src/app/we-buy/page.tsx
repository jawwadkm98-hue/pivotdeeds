import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@brand";
import { PROPERTY_TYPES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "What we buy",
  description: `${brand.name} buys houses, condos, townhomes, multifamily, land, commercial property, mobile homes, gold, diamonds, and jewelry nationwide.`,
  alternates: { canonical: "/we-buy" },
};

const propertyCopy: Record<string, string> = {
  House: "Single-family homes, lived in or empty.",
  Condo: "Units with associations, assessments, or a slow resale.",
  Townhome: "Attached homes you would rather not list.",
  Multifamily: "Small and larger rental buildings.",
  "Land / lot": "Infill lots, acreage, and land you will not build on.",
  Commercial: "Small commercial and mixed-use property.",
  "Mobile home": "Manufactured homes, with or without the land.",
  Other: "If it is not on the list, send the address anyway.",
};

export default function WeBuyPage() {
  return (
    <article className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="kicker">We buy</p>
      <h1 className="mt-3 max-w-3xl font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl">Property types, metals, and jewelry.</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-moss">{brand.serviceArea}. Pick a category when you are ready to ask for an offer.</p>

      <h2 className="mt-12 font-serif text-3xl font-medium">Real estate</h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PROPERTY_TYPES.map((type) => (
          <li key={type} className="lift rounded-3xl border border-sand bg-paper p-5">
            <h3 className="font-serif text-2xl font-medium">{type}</h3>
            <p className="mt-2 text-sm leading-relaxed text-moss">{propertyCopy[type]}</p>
          </li>
        ))}
      </ul>
      <Link href="/sell/real-estate" className="btn btn-primary mt-8">Sell real estate</Link>

      <div className="mt-16 grid gap-4 md:grid-cols-2">
        <section className="rounded-[2rem] bg-pine p-8 text-ivory">
          <h2 className="font-serif text-3xl font-medium">Gold and precious metals</h2>
          <p className="mt-3 leading-relaxed">Gold coins and bars, scrap gold, silver, and platinum. Purity and weight make a tighter offer.</p>
          <Link href="/sell/gold" className="btn btn-inverse mt-6">Sell metals</Link>
        </section>
        <section className="rounded-[2rem] border border-sand bg-paper p-8">
          <h2 className="font-serif text-3xl font-medium">Diamonds and jewelry</h2>
          <p className="mt-3 leading-relaxed text-moss">Loose diamonds, jewelry, and watches. Lab reports such as GIA are useful and optional.</p>
          <Link href="/sell/jewelry" className="btn btn-primary mt-6">Sell jewelry</Link>
        </section>
      </div>
      <p className="mt-8 text-sm text-moss">
        Something else of real value? <Link className="underline" href="/sell">Use the other-asset option</Link>. Categories can be added without a new company.
      </p>
    </article>
  );
}
