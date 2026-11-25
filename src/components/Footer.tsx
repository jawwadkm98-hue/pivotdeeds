import Link from "next/link";
import { brand, phoneHref, phoneIsLive, socialProfiles } from "@brand";
import { Disclosure } from "./Disclosure";
import { Logo } from "./Logo";

const explore = [
  { href: "/sell", label: "Sell your property" },
  { href: "/buyers", label: "Cash buyers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const legal = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/admin", label: "Admin" },
];

export function Footer() {
  const social = socialProfiles();
  return (
    <footer className="bg-pine-deep text-cream">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream">{brand.tagline}</p>
          <p className="mt-4 text-sm leading-relaxed text-cream">{brand.serviceArea}</p>
          <p className="mt-4 text-sm">
            <a className="underline decoration-brass-bright/70 underline-offset-4" href={`mailto:${brand.email}`}>
              {brand.email}
            </a>
          </p>
          <p className="mt-2 text-sm">
            {phoneIsLive() ? (
              <a className="underline decoration-brass-bright/70 underline-offset-4" href={phoneHref()}>
                {brand.phone}
              </a>
            ) : (
              <>
                <span>{brand.phone}</span>
                <span className="mt-1 block text-brass-bright">Phone line coming soon</span>
              </>
            )}
          </p>
          {social.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-3 text-sm">
              {social.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="underline underline-offset-4" rel="noopener noreferrer" target="_blank">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div>
          <h2 className="font-serif text-xl text-brass-bright">Explore</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {explore.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-serif text-xl text-brass-bright">Legal</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {legal.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
          <Disclosure className="text-cream" />
          <p className="mt-8 text-xs text-cream">
            © {new Date().getFullYear()} {brand.name}. {brand.domain}
          </p>
        </div>
      </div>
    </footer>
  );
}
