import { SettingsForm } from "@/components/admin/SettingsForm";
import { queryValue } from "@/lib/format";
import { getSiteContact } from "@/lib/settings";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const contact = await getSiteContact();
  const saved = queryValue((await searchParams).saved) === "1";
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-8">
      <p className="kicker">Settings</p>
      <h1 className="mt-2 font-serif text-4xl font-medium">Business contact</h1>
      <p className="mt-2 max-w-xl text-sm text-moss">
        These replace the placeholder phone and the contact email everywhere on the public site. The name, domain, and disclosures stay in the brand file.
      </p>
      <div className="mt-6">
        <SettingsForm email={contact.email} phone={contact.phone} saved={saved} />
      </div>
    </div>
  );
}
