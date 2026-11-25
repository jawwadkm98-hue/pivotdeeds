import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@brand";
import { JsonLd } from "@/components/JsonLd";
import { faq } from "@/content/faq";
import { getSiteContact } from "@/lib/settings";

export const metadata: Metadata = {
  title: "FAQ",
  description: `Answers about cash offers from ${brand.name} on real estate, gold, diamonds, and jewelry, and about joining the buyers list.`,
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const contact = await getSiteContact();
  const items = faq.map((item) => ({ ...item, answer: item.answer.replaceAll(brand.email, contact.email) }));
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <JsonLd data={schema} />
      <p className="kicker">FAQ</p>
      <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl">Straight answers.</h1>
      <div className="mt-8 divide-y divide-sand border-y border-sand">
        {items.map((item) => (
          <details key={item.question} className="group py-4" open={false}>
            <summary className="menu-summary flex cursor-pointer items-center justify-between gap-4 font-semibold">
              {item.question}
              <span aria-hidden="true" className="text-xl text-brass group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-moss">{item.answer}</p>
          </details>
        ))}
      </div>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/sell" className="btn btn-primary">Get a cash offer</Link>
        <Link href="/contact" className="btn btn-secondary">Contact {brand.name}</Link>
      </div>
    </article>
  );
}
