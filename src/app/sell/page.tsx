import type { Metadata } from "next";
import { brand } from "@brand";
import { SellerForm } from "@/components/SellerForm";

export const metadata: Metadata = {
  title: "Sell your property for cash",
  description: `Request a no-obligation cash offer from ${brand.name}. Houses, condos, townhomes, multifamily, land, mobile homes, and commercial property in all 50 states.`,
  alternates: { canonical: "/sell" },
  openGraph: {
    title: `Sell your property for cash | ${brand.name}`,
    description: `Tell ${brand.name} about a property and request a no-obligation cash offer anywhere in the United States.`,
    url: "/sell",
  },
};

const nextSteps = [
  "We read what you sent and may call or text the number you provided.",
  "If we can make an offer, we send it with the basic terms. You can say no.",
  "If you accept, a title company handles closing. You do not have to repair the property first.",
];

export default function SellPage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:py-16">
      <div>
        <p className="kicker">Sell your property</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl">Request a no-obligation cash offer.</h1>
        <p className="mt-4 leading-relaxed text-moss">
          {brand.serviceArea}. Use this form for houses, condos, townhomes, multifamily, land, mobile homes, and commercial property. Inherited, vacant, distressed, and pre-foreclosure situations are welcome. We are not a foreclosure consultant.
        </p>
        <ol className="mt-8 space-y-4">
          {nextSteps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm leading-relaxed text-moss">
              <span className="font-serif text-xl text-brass">0{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-sm leading-relaxed text-moss">
          Questions first? Email <a className="underline" href={`mailto:${brand.email}`}>{brand.email}</a>.
        </p>
      </div>
      <div>
        <SellerForm />
      </div>
    </div>
  );
}
