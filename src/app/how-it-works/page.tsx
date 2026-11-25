import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@brand";

export const metadata: Metadata = {
  title: "How it works",
  description: `How a cash sale to ${brand.name} works for real estate, gold, diamonds, and jewelry. No obligation to accept an offer.`,
  alternates: { canonical: "/how-it-works" },
};

const steps = [
  {
    title: "Send the category and the facts",
    text: "Real estate needs an address and condition. Metals need a type, and weight or purity if you know them. Jewelry can include carat weight and a lab report such as GIA. Photos are optional.",
  },
  {
    title: "We review and make an offer",
    text: "Property offers look at location, condition, and resale. Metal offers look at weight, purity, and the spot market. Jewelry offers look at the stone, the setting, and any certificate. You can say no.",
  },
  {
    title: "You choose whether to close",
    text: "A property sale closes with a title or escrow company on a date you can plan around. A metal or jewelry purchase follows the state and local rules for that kind of dealer transaction, which can include showing a government ID.",
  },
];

export default function HowItWorksPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="kicker">How it works</p>
      <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl">The same idea for every category.</h1>
      <p className="mt-6 text-lg leading-relaxed text-moss">
        {brand.name} makes a cash offer. You decide. Nothing on the form is a contract, and declining is free.
      </p>
      <ol className="mt-10 space-y-6">
        {steps.map((step, index) => (
          <li key={step.title} className="rounded-3xl border border-sand bg-paper p-6">
            <p className="font-serif text-3xl text-brass">0{index + 1}</p>
            <h2 className="mt-3 font-serif text-2xl font-medium">{step.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-moss">{step.text}</p>
          </li>
        ))}
      </ol>
      <h2 className="mt-12 font-serif text-3xl font-medium">Real estate can be assigned</h2>
      <p className="mt-4 leading-relaxed text-moss">
        We may buy a property ourselves, assign the purchase contract, or resell after we take title. Where a state requires a written disclosure, including Maryland Real Property § 10-715 for certain owner-occupied homes, that notice is given with the contract. The footer on this site does not replace it.
      </p>
      <h2 className="mt-12 font-serif text-3xl font-medium">Metals and jewelry follow dealer rules</h2>
      <p className="mt-4 leading-relaxed text-moss">
        Precious-metal and jewelry purchases comply with applicable state and local secondhand and precious-metals laws. A transaction may require a valid government-issued photo ID. We do not claim any license on this website.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/sell" className="btn btn-primary">Get a cash offer</Link>
        <Link href="/we-buy" className="btn btn-secondary">See what we buy</Link>
      </div>
    </article>
  );
}
