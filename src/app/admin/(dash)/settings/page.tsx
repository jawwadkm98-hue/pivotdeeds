import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";
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
      <section id="password" className="mt-12 border-t border-sand pt-8">
        <h2 className="font-serif text-3xl font-medium">Change password</h2>
        <p className="mt-2 max-w-xl text-sm text-moss">
          Enter your current password, then a new one. Other devices signed in to this dashboard will be signed out. The Cloudflare ADMIN_PASSWORD secret is left unchanged and is only used until you set a dashboard password here.
        </p>
        <div className="mt-6">
          <ChangePasswordForm />
        </div>
      </section>
    </div>
  );
}
