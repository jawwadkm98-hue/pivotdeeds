import type { Metadata } from "next";
import { brand } from "@brand";
import { legalUpdated } from "@/content/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${brand.name} collects, uses, and shares information from seller, buyer, and contact forms.`,
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <article className="prose-legal mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="kicker">Privacy</p>
      <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-0.03em] text-ink sm:text-5xl">Privacy Policy</h1>
      <p>Effective {legalUpdated}. This policy describes what {brand.name} ({brand.domain}) collects when you use this website.</p>

      <h2>Who we are</h2>
      <p>
        {brand.name} is a real estate investor and cash buyer, not a licensed real estate broker or agent. The contact email for privacy requests is{" "}
        <a href={`mailto:${brand.email}`}>{brand.email}</a>. Service area: {brand.serviceArea}.
      </p>

      <h2>Information you give us</h2>
      <ul>
        <li>Seller requests: name, phone, email, city, state, ZIP, asset category, timeline, and the details for that category. Real estate includes an address, property type, and condition. Metals and jewelry can include item type, weight, karat or carat, certification, quantity, a description, and optional photos.</li>
        <li>Buyer signups: name, phone, email, optional company, categories of interest, markets, property types when relevant, price range, buy box notes, and whether proof of funds is available.</li>
        <li>Contact messages: name, email, optional phone, and the message.</li>
        <li>Consent records: whether you checked the required consent box. Seller and buyer forms include consent to calls and texts, including autodialed or prerecorded messages. The contact form is only consent to a reply about that message.</li>
      </ul>

      <h2>Information collected automatically</h2>
      <p>
        When you submit a form, we store the date and time, your IP address, and your browser user agent. We use those to investigate spam and to keep a record of the submission. The admin sign-in sets one essential cookie that remembers the session. We do not use third-party advertising cookies or cross-site tracking pixels.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>To review a property or a buy box and to contact you about that request.</li>
        <li>To send cash buyers occasional opportunities that match the markets and property types they asked for.</li>
        <li>To keep required consent records and to honor STOP, HELP, and email opt-out requests.</li>
        <li>To prevent abuse, including rate limits on repeated submissions.</li>
        <li>To comply with law, a lawful request, or a dispute about a transaction.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        We do not sell personal information as a marketing list. To evaluate or complete a sale you asked about, we may share relevant property and contact details with a title or escrow company, a closing attorney, or a prospective cash buyer or assignee. We may also share information with a service provider who hosts this website or stores its database, only so they can operate the service, and with authorities when the law requires it.
      </p>
      <p>
        If you are a California resident, you can email {brand.email} to request access to or deletion of the personal information we have about you. We will not discriminate against you for making a request. Sharing details with a buyer or title company to pursue a transaction you inquired about is not a sale of a marketing list.
      </p>

      <h2>Calls and texts</h2>
      <p>
        If you check the seller or buyer consent box, you agree that we may call and text the number you provided, including with an automatic telephone dialing system or a prerecorded or artificial voice, about your inquiry and related property services. Message and data rates may apply. Message frequency varies. Reply STOP to opt out of texts and HELP for help. Consent is not a condition of any purchase, sale, or offer. You can also opt out by emailing {brand.email}.
      </p>

      <h2>Photos</h2>
      <p>
        Optional photos are stored on the same server as the lead database. They are available to the people who administer this site and are not published on the public pages. We do not ask you to upload a photo of a government ID.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep lead and consent records for as long as we need them to follow up, document consent, and meet legal, tax, or dispute needs. You may ask us to delete a message or a signup that we no longer need for those reasons.
      </p>

      <h2>Security</h2>
      <p>
        Submissions are stored in a database on the server that hosts this site. The admin area is password protected. No method of storage or transmission is perfectly secure. Do not send account passwords, full social security numbers, or bank account numbers through these forms.
      </p>

      <h2>Children</h2>
      <p>This site is not directed to anyone under 18. Do not submit information about a child.</p>

      <h2>Changes</h2>
      <p>If we change this policy, we will update the effective date on this page. Continued use of the site after a change means you have the new policy available to you here.</p>
    </article>
  );
}
