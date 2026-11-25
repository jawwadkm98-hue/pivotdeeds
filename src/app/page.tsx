import Link from "next/link";
import { brand } from "@brand";
import { Container } from "@/components/Container";
import { JsonLd } from "@/components/JsonLd";
import { STATES } from "@/lib/constants";
import { faq } from "@/content/faq";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: `${brand.name} | Nationwide cash home buyers` },
  description:
    `Get a no-obligation cash offer from ${brand.name} on a house, condo, townhome, multifamily, land, mobile home, or commercial property anywhere in the U.S. Or join the cash buyers list.`,
  alternates: { canonical: "/" },
};

const facts = [
  ["All 50 states", "Plus Washington, D.C. Send any U.S. address."],
  ["As-is", "No repairs and no clean-out required to ask for an offer."],
  ["Your closing date", "We work toward a date you can plan around."],
  ["No obligation", "Decline the offer. There is no fee for asking."],
];

const steps = [
  ["Tell us about the property", "Address, condition, and the timeline you have in mind. It takes a few minutes."],
  ["Review a cash offer", "We look at the property and local pricing, then send a number you can accept or turn down."],
  ["Close if you want to", "A title company handles the paperwork. You do not list the property or fix it for us first."],
];

const types: { name: string; text: string; icon: "house" | "condo" | "town" | "multi" | "land" | "store" | "mobile" | "other" }[] = [
  { name: "Houses", text: "Single-family homes, lived in or empty, tidy or not.", icon: "house" },
  { name: "Condos", text: "Units with association rules, assessments, or a slow market.", icon: "condo" },
  { name: "Townhomes", text: "Attached homes you would rather not prep for showings.", icon: "town" },
  { name: "Multifamily", text: "Small and larger rental buildings, occupied or vacant.", icon: "multi" },
  { name: "Land / lots", text: "Infill lots, acreage, and land you do not plan to build on.", icon: "land" },
  { name: "Commercial", text: "Small commercial buildings and mixed-use property.", icon: "store" },
  { name: "Mobile homes", text: "Manufactured homes, with or without the land.", icon: "mobile" },
  { name: "Other", text: "Unusual property still deserves a look. Send the address.", icon: "other" },
];

const situations = [
  ["Inherited", "An estate property you would rather not repair, list, or keep."],
  ["Needs work", "Repairs that cost more time or money than you want to spend."],
  ["Vacant", "A property sitting still while taxes, insurance, and utilities continue."],
  ["Tired landlord", "A rental you are done managing."],
  ["Relocation", "A move that needs a closing date you can count on."],
  ["Divorce", "A shared property that needs a straightforward exit."],
  ["Pre-foreclosure", "We can offer to buy the property. We do not provide foreclosure rescue."],
  ["Carrying costs", "Behind on taxes, or paying for a property you no longer use."],
];

function TypeIcon({ icon }: { icon: (typeof types)[number]["icon"] }) {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7 text-brass" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {icon === "house" ? <path d="M5 14.5 16 6l11 8.5V26H5Z" /> : null}
        {icon === "condo" ? (
          <>
            <path d="M8 26V8h16v18" />
            <path d="M12 12h2M18 12h2M12 17h2M18 17h2M12 22h2M18 22h2" />
          </>
        ) : null}
        {icon === "town" ? <path d="M4 26V15l6-4 6 4 6-4 6 4v11H4Z" /> : null}
        {icon === "multi" ? (
          <>
            <path d="M6 26V10h8v16M14 26V6h12v20" />
            <path d="M17 11h3M22 11h3M17 16h3M22 16h3" />
          </>
        ) : null}
        {icon === "land" ? (
          <>
            <path d="M4 22c4-6 8 2 12-3 3 4 6 1 12 3" />
            <path d="M20 12c0-3 2-5 2-5s2 2 2 5-2 4-2 4-2-1-2-4Z" />
          </>
        ) : null}
        {icon === "store" ? (
          <>
            <path d="M6 13 8 7h16l2 6" />
            <path d="M6 13h20v13H6Z" />
            <path d="M13 26v-6h6v6" />
          </>
        ) : null}
        {icon === "mobile" ? (
          <>
            <path d="M4 18h24v6H4Z" />
            <circle cx="10" cy="24" r="2" />
            <circle cx="22" cy="24" r="2" />
          </>
        ) : null}
        {icon === "other" ? <path d="M16 5 27 16 16 27 5 16Z" /> : null}
      </g>
    </svg>
  );
}

export default function HomePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <JsonLd data={faqSchema} />
      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="kicker">Nationwide cash buyer</p>
          <h1 className="mt-4 font-serif text-[clamp(2.7rem,6vw,4.8rem)] font-medium leading-[0.98] tracking-[-0.04em] text-ink">
            Sell the property.
            <span className="mt-1 block italic text-brass">Skip the listing.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-moss">
            {brand.name} makes straightforward cash offers on houses, condos, townhomes, multifamily, land, mobile homes, and commercial property. {brand.serviceArea}. Any condition.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/sell" className="btn btn-primary">
              Get a cash offer
            </Link>
            <Link href="/buyers" className="btn btn-secondary">
              Join our buyers list
            </Link>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-moss">
            No obligation to accept an offer. We are real estate investors, not agents, and we do not represent sellers.
          </p>
        </div>
        <aside className="relative" aria-label="How a cash offer works">
          <div className="absolute -left-4 top-8 hidden h-[86%] w-full rounded-[2rem] bg-pine/10 lg:block" aria-hidden="true" />
          <div className="relative rounded-[2rem] border border-sand bg-paper p-6 shadow-[0_24px_60px_-36px_rgba(16,36,28,0.55)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="kicker">Offer snapshot</p>
                <h2 className="mt-2 font-serif text-3xl font-medium tracking-[-0.03em]">Cash offer</h2>
              </div>
              <p className="rounded-full bg-cream px-3 py-1 text-xs font-semibold tracking-wide text-brass">NO OBLIGATION</p>
            </div>
            <dl className="mt-6 divide-y divide-sand">
              {[
                ["Condition", "As-is. Repairs stay with us if you accept."],
                ["Closing", "A date you choose, handled by a title company."],
                ["Listing", "No showings and no MLS listing with us."],
                ["Fee to ask", "$0. Declining costs you nothing."],
                ["Coverage", "All 50 states and Washington, D.C."],
              ].map(([term, detail]) => (
                <div key={term} className="grid grid-cols-[7rem_1fr] gap-3 py-3 text-sm">
                  <dt className="font-semibold text-ink">{term}</dt>
                  <dd className="text-moss">{detail}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-moss">
              This card explains the process. It is not a quote. A real number comes after we review the property.
            </p>
          </div>
        </aside>
      </section>

      <section className="bg-pine-deep text-cream" aria-label="What to expect">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-5 py-10 sm:px-8 md:grid-cols-4">
          {facts.map(([title, text]) => (
            <div key={title}>
              <h2 className="font-serif text-2xl font-medium tracking-[-0.03em] text-brass-bright">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="kicker">How it works</p>
        <h2 className="mt-3 max-w-xl font-serif text-4xl font-medium tracking-[-0.03em]">Three steps. Then you decide.</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map(([title, text], index) => (
            <li key={title} className="rounded-3xl border border-sand bg-paper p-6">
              <p className="font-serif text-3xl text-brass">0{index + 1}</p>
              <h3 className="mt-4 font-serif text-2xl font-medium tracking-[-0.03em]">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-moss">{text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-moss">
          We buy for our own account. We may assign the purchase contract to another buyer or resell the property for a profit, and we disclose that where state law requires it.
        </p>
      </section>

      <section className="bg-paper py-16 sm:py-24">
        <Container>
          <p className="kicker">Property types</p>
          <h2 className="mt-3 max-w-2xl font-serif text-4xl font-medium tracking-[-0.03em]">We buy the properties owners are ready to leave behind.</h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {types.map((type) => (
              <li key={type.name} className="rounded-3xl border border-sand bg-cream p-5">
                <TypeIcon icon={type.icon} />
                <h3 className="mt-4 font-serif text-2xl font-medium">{type.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-moss">{type.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="kicker">Situations</p>
        <h2 className="mt-3 max-w-2xl font-serif text-4xl font-medium tracking-[-0.03em]">A direct sale is useful when a listing is the long way around.</h2>
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {situations.map(([title, text]) => (
            <li key={title} className="border-l-2 border-brass-bright bg-paper px-5 py-4">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-moss">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-5 pb-4 sm:px-8">
        <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] md:grid-cols-2">
          <div className="bg-pine p-8 text-cream sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass-bright">For owners</p>
            <h2 className="mt-3 font-serif text-4xl font-medium tracking-[-0.03em]">Get a cash offer</h2>
            <p className="mt-4 max-w-md leading-relaxed">
              Tell us the address and the condition. We follow up with a no-obligation offer. You stay in control of the yes or the no.
            </p>
            <Link href="/sell" className="btn btn-inverse mt-8">
              Start the seller form
            </Link>
          </div>
          <div className="bg-sand/50 p-8 sm:p-12">
            <p className="kicker">For cash buyers</p>
            <h2 className="mt-3 font-serif text-4xl font-medium tracking-[-0.03em]">Join the buyers list</h2>
            <p className="mt-4 max-w-md leading-relaxed text-moss">
              Off-market houses, land, and small commercial deals. Tell us your markets and your buy box. Some opportunities are contract assignments.
            </p>
            <Link href="/buyers" className="btn btn-primary mt-8">
              Join our buyers list
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <p className="kicker">Service area</p>
        <h2 className="mt-3 font-serif text-4xl font-medium tracking-[-0.03em]">{brand.serviceArea}</h2>
        <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-moss">
          {STATES.map(([code, name]) => (
            <li key={code}>{name}</li>
          ))}
        </ul>
      </section>

      <section className="bg-paper py-16 sm:py-24">
        <Container className="max-w-3xl">
          <p className="kicker">Questions</p>
          <h2 className="mt-3 font-serif text-4xl font-medium tracking-[-0.03em]">Straight answers before you send anything.</h2>
          <div className="mt-8 divide-y divide-sand border-y border-sand">
            {faq.map((item) => (
              <details key={item.question} className="group py-4">
                <summary className="menu-summary flex cursor-pointer items-center justify-between gap-4 font-semibold">
                  {item.question}
                  <span aria-hidden="true" className="text-xl text-brass group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-moss">{item.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 text-center sm:px-8">
        <h2 className="font-serif text-4xl font-medium tracking-[-0.03em]">Ready when the property is.</h2>
        <p className="mx-auto mt-4 max-w-xl text-moss">Request an offer, or tell us what you want to buy. Either way, you can change your mind.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/sell" className="btn btn-primary">
            Get a cash offer
          </Link>
          <Link href="/contact" className="btn btn-secondary">
            Contact {brand.name}
          </Link>
        </div>
      </section>
    </>
  );
}
