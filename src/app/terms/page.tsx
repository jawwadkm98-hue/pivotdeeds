import type { Metadata } from "next";
import { brand } from "@brand";
import { legalUpdated } from "@/content/legal";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Terms for using the ${brand.name} website, requesting a cash offer, or joining the buyers list.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <article className="prose-legal mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="kicker">Terms</p>
      <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-0.03em] text-ink sm:text-5xl">Terms of Use</h1>
      <p>Effective {legalUpdated}. These terms cover your use of {brand.domain} and the forms on it. A written purchase contract, if you later sign one, controls that transaction.</p>

      <h2>Who we are</h2>
      <p>
        {brand.name} is a real estate investor and cash buyer. We are not a licensed real estate broker or agent, and we do not represent sellers or buyers as their agent. We buy properties for our own account. Contact: <a href={`mailto:${brand.email}`}>{brand.email}</a>. Service area: {brand.serviceArea}.
      </p>

      <h2>No obligation</h2>
      <p>
        Submitting a form is a request for us to review information. It is not an offer that either of us must accept, and it does not create a contract, a listing agreement, or an agency relationship. You may decline any offer. We may decline any property or any buyer. An offer is not binding until both sides sign a written contract.
      </p>

      <h2>Assignment and resale</h2>
      <p>
        We may assign our purchase contract to another buyer or resell a property for a profit. We disclose that before you are asked to sign, and we provide any additional written disclosure required by the state where the property is located. Maryland Real Property § 10-715 is one example. For certain owner-occupied residential property of one to four units, that statute requires a wholesale buyer to disclose in writing, before the contract is signed, that the contract may be assigned. It also requires a person assigning that kind of contract to tell the assignee, before the assignment, that the assignor holds an equitable interest and may not be able to convey title. If the required notice is missing and the contract is assigned, the statute gives cancellation rights before closing. This page is not that written disclosure and is not a complete statement of Maryland law or of any other state’s law.
      </p>

      <h2>Not a foreclosure consultant</h2>
      <p>
        We are not a foreclosure consultant. We do not offer foreclosure rescue, a promise to stop a foreclosure sale, loan modification, or credit repair. If you are in foreclosure, the only service we offer is a possible cash purchase of the property. Talk with a lawyer or a HUD-approved housing counselor about the foreclosure itself.
      </p>

      <h2>Buyers list</h2>
      <p>
        Joining the list does not reserve a property, guarantee that you will be contacted, or require you to buy. Properties may be offered as an assignment of our contract rather than a deed from the current owner. You are responsible for your own inspection, title review, funds, and decision. We may ask for proof of funds before sharing an address. We may remove anyone from the list.
      </p>

      <h2>Calls and texts</h2>
      <p>
        The seller and buyer forms require a checkbox. By checking it, you consent to calls and texts at the number you provided, including calls and texts made with an automatic telephone dialing system or a prerecorded or artificial voice, about your inquiry and related services. Message and data rates may apply. Message frequency varies. Reply STOP to opt out of texts and HELP for help. Consent is not a condition of any purchase, sale, or offer. The contact form only authorizes a reply about that message.
      </p>

      <h2>Your submissions</h2>
      <p>
        You agree that the information you submit is accurate to the best of your knowledge and that you have authority to inquire about the property or, for an estate or entity, that you are allowed to start that conversation. Do not submit information you are not permitted to share. You must be at least 18.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Do not misuse the site: no scraping of leads, no attempts to break into the admin area, no malware, and no submissions made only to harass someone. We may block or rate-limit traffic that looks automated.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The {brand.name} name, logo, and the text and design of this site belong to {brand.name} or its licensors. You may not copy the site for your own cash-buyer brand. You may link to public pages.
      </p>

      <h2>No professional advice</h2>
      <p>
        Content on this site is general information. It is not legal, tax, financial, or brokerage advice. Property, foreclosure, estate, and tax rules depend on the state and on your facts. Get advice from a qualified professional before you sign or rely on an offer.
      </p>

      <h2>Disclaimers and liability</h2>
      <p>
        The site is provided as-is. We do not warrant that it will be uninterrupted or error-free, or that a form submission will produce an offer. To the fullest extent allowed by law, {brand.name} is not liable for indirect, incidental, or consequential damages arising from your use of the site. Nothing in these terms limits liability that cannot be limited under applicable law.
      </p>

      <h2>Fair housing</h2>
      <p>
        We follow the federal Fair Housing Act. We do not discriminate based on race, color, religion, sex, disability, familial status, national origin, or any other characteristic protected by applicable law.
      </p>

      <h2>Governing law</h2>
      <p>
        These website terms are governed by the laws of the United States. A contract to buy or sell a specific property is also governed by the law of the state where that property is located, including that state’s disclosure rules. We do not require you to resolve a website dispute in a particular county.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms by posting a new version on this page and changing the effective date. A transaction is governed by the written contract for that transaction, not by a later edit to this page.</p>

      <h2>Contact</h2>
      <p>
        Questions about these terms: <a href={`mailto:${brand.email}`}>{brand.email}</a>.
      </p>
    </article>
  );
}
