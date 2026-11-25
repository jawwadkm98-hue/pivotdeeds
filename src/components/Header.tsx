"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand } from "@brand";
import { navIsActive, primaryNav, sellLinks } from "@/content/nav";
import { Logo } from "./Logo";

function NavLinks({ className }: { className: string }) {
  const pathname = usePathname();
  return (
    <nav className={className} aria-label="Primary">
      {primaryNav.map((link) => {
        const active = navIsActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3 py-2 text-sm font-medium ${active ? "bg-pine text-cream" : "text-ink hover:bg-paper"}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-sand/80 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <Link href="/" aria-label={`${brand.name} home`} className="rounded-md">
          <Logo />
        </Link>
        <NavLinks className="hidden items-center gap-1 xl:flex" />
        <div className="hidden items-center gap-2 xl:flex">
          <Link href="/sell" className="btn btn-primary">
            Get a cash offer
          </Link>
        </div>
        <details className="relative xl:hidden">
          <summary className="menu-summary btn btn-secondary cursor-pointer px-4">Menu</summary>
          <div className="absolute right-0 z-40 mt-2 max-h-[80vh] w-[min(22rem,calc(100vw-2.5rem))] overflow-auto rounded-3xl border border-sand bg-paper p-4 shadow-lg">
            <NavLinks className="flex flex-col gap-1" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-brass">Sell</p>
            <ul className="mt-2 space-y-1">
              {sellLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} aria-current={pathname === link.href ? "page" : undefined} className="block rounded-full px-3 py-2 text-sm hover:bg-cream">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid gap-2">
              <Link href="/faq" className="rounded-full px-3 py-2 text-sm font-medium hover:bg-cream">
                FAQ
              </Link>
              <Link href="/contact" className="rounded-full px-3 py-2 text-sm font-medium hover:bg-cream">
                Contact
              </Link>
              <Link href="/sell" className="btn btn-primary">
                Get a cash offer
              </Link>
              <Link href="/buyers" className="btn btn-secondary">
                Join our buyers list
              </Link>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
