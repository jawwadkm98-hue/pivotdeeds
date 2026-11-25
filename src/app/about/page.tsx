import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@brand";
import { Disclosure } from "@/components/Disclosure";

export const metadata: Metadata = {
  title: "About",
  description: `${brand.name} is a nationwide cash buyer of real estate, gold, diamonds, and jewelry. We are not a broker, and we do not claim a professional license on this site.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="kicker">About</p>
      <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl">A cash buyer with room to add categories.</h1>
      <p className="mt-6 text-lg leading-relaxed text-moss">
        {brand.name} buys real estate directly from owners, and we buy gold, diamonds, jewelry, and other high-value assets. Some people are settling an estate that includes a house and a ring. Some want one desk for both. The offer is optional either way.
      </p>
      <p className="mt-4 leading-relaxed text-moss">{brand.serviceArea}. If we cannot make an offer, we will say so.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <section className="rounded-3xl bg-paper p-6">
          <h2 className="font-serif text-2xl font-medium">What we are</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-moss">
            <li>A cash buyer of property and of precious metals and jewelry.</li>
            <li>A buyer that closes real estate through a title or escrow company.</li>
            <li>A source of off-market property for other cash buyers.</li>
          </ul>
        </section>
        <section className="rounded-3xl bg-paper p-6">
          <h2 className="font-serif text-2xl font-medium">What we are not</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-moss">
            <li>A licensed real estate broker or agent.</li>
            <li>Your representative in a sale.</li>
            <li>A lender, foreclosure consultant, or credit-repair service.</li>
            <li>A claimed pawn, dealer, or other license. The page does not assert one.</li>
          </ul>
        </section>
      </div>
      <h2 className="mt-12 font-serif text-3xl font-medium tracking-[-0.03em]">How a property purchase can be structured</h2>
      <p className="mt-4 leading-relaxed text-moss">
        We may buy a property ourselves, assign our purchase contract, or resell after we take title. Maryland Real Property § 10-715 is one example of a state that requires a written assignment disclosure for certain owner-occupied residential property. The website notice is not that disclosure.
      </p>
      <h2 className="mt-12 font-serif text-3xl font-medium tracking-[-0.03em]">Metals and jewelry</h2>
      <p className="mt-4 leading-relaxed text-moss">
        Those purchases follow applicable state and local secondhand-dealer and precious-metals laws. You may need a valid government-issued photo ID when the purchase is completed. We do not collect that ID on this form.
      </p>
      <div className="mt-10">
        <Disclosure />
      </div>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/sell" className="btn btn-primary">Get a cash offer</Link>
        <Link href="/how-it-works" className="btn btn-secondary">How it works</Link>
      </div>
    </article>
  );
}
