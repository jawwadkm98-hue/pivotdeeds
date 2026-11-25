import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@brand";

export const metadata: Metadata = {
  title: "Situations",
  description: `${brand.name} buys property in foreclosure, probate, divorce, vacancy, and other situations where a listing is the long way around.`,
  alternates: { canonical: "/situations" },
};

const situations = [
  ["Foreclosure", "We can offer to buy the property. We are not a foreclosure consultant and we do not offer rescue, loan modification, or a promise to stop a sale."],
  ["Inherited or probate", "An estate property the heirs would rather not repair or list. You should have authority to start the conversation."],
  ["Divorce", "A shared property that needs a date and a clean exit. The offer is not legal advice."],
  ["Tired landlord", "A rental you are done managing, occupied or vacant."],
  ["Vacant", "A house or building sitting still while taxes, insurance, and utilities continue."],
  ["Major repairs", "Work that costs more than you want to manage. We buy as-is."],
  ["Relocation", "A move that needs a closing date you can plan around."],
];

export default function SituationsPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="kicker">Situations</p>
      <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl">When a direct sale is the simpler path.</h1>
      <p className="mt-6 leading-relaxed text-moss">
        These are the property situations we hear most often. None of them obligates you to sell. If the asset is gold or jewelry instead, start at <Link className="underline" href="/sell/gold">precious metals</Link> or <Link className="underline" href="/sell/jewelry">diamonds and jewelry</Link>.
      </p>
      <ul className="mt-10 space-y-4">
        {situations.map(([title, text]) => (
          <li key={title} className="border-l-2 border-brass-bright bg-paper px-5 py-4">
            <h2 className="font-serif text-2xl font-medium">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-moss">{text}</p>
          </li>
        ))}
      </ul>
      <Link href="/sell/real-estate" className="btn btn-primary mt-10">Get a property offer</Link>
    </article>
  );
}
