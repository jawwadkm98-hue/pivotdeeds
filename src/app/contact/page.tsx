import type { Metadata } from "next";
import { brand } from "@brand";
import { ContactForm } from "@/components/ContactForm";
import { JsonLd } from "@/components/JsonLd";
import { getSiteContact, phoneTel } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const contact = await getSiteContact();
  return {
    title: "Contact",
    description: `Contact ${brand.name} at ${contact.email}. We buy property nationwide and reply to questions about cash offers and the buyers list.`,
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactPage() {
  const contact = await getSiteContact();
  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: `${brand.siteUrl}/contact`,
    mainEntity: {
      "@type": "Organization",
      name: brand.name,
      email: contact.email,
      url: brand.siteUrl,
      areaServed: { "@type": "Country", "name": "United States" },
    },
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:py-16">
      <JsonLd data={schema} />
      <div>
        <p className="kicker">Contact</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl">Talk with {brand.name}.</h1>
        <p className="mt-4 leading-relaxed text-moss">
          We work nationwide and do not publish a walk-in office. Email is the reliable way to reach us. Seller offers and buyer signups have their own forms so the details do not get lost in a general message.
        </p>
        <dl className="mt-8 space-y-5">
          <div>
            <dt className="text-sm font-semibold">Email</dt>
            <dd className="mt-1">
              <a className="text-lg underline decoration-brass underline-offset-4" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold">Phone</dt>
            <dd className="mt-1 text-lg">
              {contact.phoneIsLive ? <a href={phoneTel(contact.phone)}>{contact.phone}</a> : contact.phone}
              {!contact.phoneIsLive ? <p className="mt-1 text-sm text-brass">Phone line coming soon. Please email us.</p> : null}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold">Service area</dt>
            <dd className="mt-1 text-moss">{brand.serviceArea}</dd>
          </div>
        </dl>
      </div>
      <ContactForm />
    </div>
  );
}
