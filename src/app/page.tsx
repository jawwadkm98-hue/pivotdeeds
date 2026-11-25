import Link from "next/link";
import type { Metadata } from "next";
import { brand } from "@brand";
import { Container } from "@/components/Container";
import { CrownMark } from "@/components/CrownMark";
import { JsonLd } from "@/components/JsonLd";
import { faq } from "@/content/faq";
import { sellLinks } from "@/content/nav";

export const metadata: Metadata = {
  title: { absolute: `${brand.name} | Cash for property, gold, and jewelry` },
  description: `Get a no-obligation cash offer from ${brand.name} on real estate, gold, diamonds, jewelry, or another high-value asset anywhere in the U.S.`,
  alternates: { canonical: "/" },
};

const facts = [
  ["All 50 states", "Real estate and high-value assets, including Washington, D.C."],
  ["As-is property", "No repairs required to ask for an offer on a building or lot."],
  ["Metals and stones", "Gold, silver, platinum, diamonds, and jewelry."],
  ["No obligation", "Decline any offer. Asking does not lock you in."],
];

const steps = [
  ["Tell us the category", "Real estate, precious metals, jewelry, or something else. The form asks only for that category."],
  ["Review a cash offer", "We look at what you sent and reply with a number you can accept or turn down."],
  ["Close if you want to", "Property closes with a title company. Metals and jewelry follow the dealer rules where the deal happens."],
];

export default function HomePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.slice(0, 6).map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <JsonLd data={faqSchema} />
      <section className="hero-glow mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <CrownMark draw className="mb-5 h-16 w-16 text-[#D4A93C]" />
          <p className="kicker">Nationwide wholesaler</p>
          <h1 className="mt-4 font-serif text-[clamp(2.6rem,6vw,4.6rem)] font-medium leading-[0.98] tracking-[-0.04em] text-ink">
            Cash for what
            <span className="mt-1 block italic text-brass">you are ready to sell.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-moss">
            {brand.name} buys houses, land, and commercial property, and we buy gold, diamonds, jewelry, and other high-value assets. {brand.serviceArea}.
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
            No obligation to accept an offer. For real estate we are investors, not agents, and we do not represent sellers.
          </p>
        </div>
        <aside className="relative" aria-label="What an offer covers">
          <div className="absolute -left-4 top-8 hidden h-[86%] w-full rounded-[2rem] bg-pine/10 lg:block" aria-hidden="true" />
          <div className="lift relative rounded-[2rem] border border-sand bg-paper p-6 shadow-[0_24px_60px_-36px_rgba(212,169,60,0.25)] sm:p-8">
            <p className="kicker">One desk</p>
            <h2 className="mt-2 font-serif text-3xl font-medium tracking-[-0.03em]">What we buy</h2>
            <ul className="mt-6 space-y-3 text-sm">
              {sellLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="lift flex items-center justify-between rounded-2xl border border-sand px-4 py-3 font-semibold">
                    {link.label}
                    <span aria-hidden="true" className="text-brass">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-moss">A category can be added later without rebuilding the offer form.</p>
          </div>
        </aside>
      </section>

      <section className="bg-pine-deep text-ivory" aria-label="What to expect">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-5 py-10 sm:px-8 md:grid-cols-4">
          {facts.map(([title, text]) => (
            <div key={title}>
              <h2 className="font-serif text-2xl font-medium tracking-[-0.03em] text-brass-bright">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="reveal mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="kicker">How it works</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-xl font-serif text-4xl font-medium tracking-[-0.03em]">Three steps. Then you decide.</h2>
          <Link href="/how-it-works" className="text-sm font-semibold underline decoration-brass underline-offset-4">
            Read the full process
          </Link>
        </div>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map(([title, text], index) => (
            <li key={title} className="lift rounded-3xl border border-sand bg-paper p-6">
              <p className="font-serif text-3xl text-brass">0{index + 1}</p>
              <h3 className="mt-4 font-serif text-2xl font-medium tracking-[-0.03em]">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-moss">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="reveal bg-paper py-16 sm:py-24">
        <Container>
          <p className="kicker">Real estate</p>
          <h2 className="mt-3 max-w-2xl font-serif text-4xl font-medium tracking-[-0.03em]">Houses, land, and buildings, in any condition.</h2>
          <ul className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
            {["Houses", "Condos and townhomes", "Multifamily", "Land", "Commercial", "Mobile homes"].map((item) => (
              <li key={item}>
                <Link href="/we-buy" className="inline-block rounded-full border border-sand bg-cream px-4 py-2 hover:border-pine">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/sell/real-estate" className="btn btn-primary">
              Sell real estate
            </Link>
            <Link href="/situations" className="btn btn-secondary">
              Situations we help with
            </Link>
          </div>
        </Container>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-2">
          <Link href="/sell/gold" className="lift rounded-[2rem] bg-pine p-8 text-ivory sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass-bright">Precious metals</p>
            <h2 className="mt-3 font-serif text-4xl font-medium tracking-[-0.03em]">Gold, silver, and platinum</h2>
            <p className="mt-4 max-w-md leading-relaxed">Coins, bars, scrap, and bullion. Tell us the weight and purity if you know them.</p>
            <span className="btn btn-inverse mt-8">Sell gold and metals</span>
          </Link>
          <Link href="/sell/jewelry" className="lift rounded-[2rem] border border-sand bg-paper p-8 sm:p-10">
            <p className="kicker">Diamonds and jewelry</p>
            <h2 className="mt-3 font-serif text-4xl font-medium tracking-[-0.03em]">Stones, watches, and pieces</h2>
            <p className="mt-4 max-w-md leading-relaxed text-moss">Loose diamonds, finished jewelry, and watches. A GIA report helps. It is not required to ask.</p>
            <span className="btn btn-primary mt-8">Sell diamonds and jewelry</span>
          </Link>
        </div>
      </section>

      <section className="reveal bg-paper py-16 sm:py-20">
        <Container className="max-w-3xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="kicker">Questions</p>
              <h2 className="mt-3 font-serif text-4xl font-medium tracking-[-0.03em]">Before you send anything.</h2>
            </div>
            <Link href="/faq" className="text-sm font-semibold underline decoration-brass underline-offset-4">
              All questions
            </Link>
          </div>
          <div className="mt-8 divide-y divide-sand border-y border-sand">
            {faq.slice(0, 6).map((item) => (
              <details key={item.question} className="group py-4">
                <summary className="menu-summary flex cursor-pointer items-center justify-between gap-4 font-semibold">
                  {item.question}
                  <span aria-hidden="true" className="text-xl text-brass group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-moss">{item.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
