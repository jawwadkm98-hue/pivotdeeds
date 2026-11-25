import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@brand";
import { Disclosure } from "@/components/Disclosure";

export const metadata: Metadata = {
  title: "About",
  description: `${brand.name} is a nationwide real estate investor and cash buyer. We are not a broker, and we do not represent sellers.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="kicker">About</p>
      <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl">A cash buyer for owners who want a clean exit.</h1>
      <p className="mt-6 text-lg leading-relaxed text-moss">
        {brand.name} buys property directly from owners across the United States. Some are settling an estate. Some are finished with a house that needs more work than it is worth. Some need a closing date they can plan around. The offer is a direct option: cash, as-is, with no listing and no obligation.
      </p>
      <p className="mt-4 leading-relaxed text-moss">{brand.serviceArea}. If we cannot make an offer on an address, we will say so.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <section className="rounded-3xl bg-paper p-6">
          <h2 className="font-serif text-2xl font-medium">What we are</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-moss">
            <li>A real estate investment company and cash buyer.</li>
            <li>A buyer that closes through a title or escrow company.</li>
            <li>A source of off-market property for other cash buyers.</li>
          </ul>
        </section>
        <section className="rounded-3xl bg-paper p-6">
          <h2 className="font-serif text-2xl font-medium">What we are not</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-moss">
            <li>A licensed real estate broker or agent.</li>
            <li>Your representative in the sale.</li>
            <li>A lender, a foreclosure consultant, or a credit-repair service.</li>
            <li>A guarantee of any particular price.</li>
          </ul>
        </section>
      </div>

      <h2 className="mt-12 font-serif text-3xl font-medium tracking-[-0.03em]">How a purchase can be structured</h2>
      <p className="mt-4 leading-relaxed text-moss">
        We may buy the property ourselves, assign our purchase contract to another buyer, or resell after we take title. If we assign or resell for a profit, that is part of this business, and we say so before you are asked to sign. Some states require a specific written disclosure in the contract. Maryland Real Property § 10-715 is one example for certain owner-occupied residential property. The disclosure on this website does not replace the written notice a state requires at contract time.
      </p>
      <h2 className="mt-12 font-serif text-3xl font-medium tracking-[-0.03em]">Get your own advice</h2>
      <p className="mt-4 leading-relaxed text-moss">
        A cash offer is a business proposal. It is not legal, tax, or financial advice. An estate, a divorce, a tax lien, or a foreclosure can have consequences this website will not catch. Consider a real estate attorney, a tax advisor, or a HUD-approved housing counselor before you sign.
      </p>
      <div className="mt-10">
        <Disclosure level={2} />
      </div>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/sell" className="btn btn-primary">
          Get a cash offer
        </Link>
        <Link href="/contact" className="btn btn-secondary">
          Contact us
        </Link>
      </div>
    </article>
  );
}
