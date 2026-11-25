"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand } from "@brand";
import { Logo } from "./Logo";

const links = [
  { href: "/sell", label: "Sell your property" },
  { href: "/buyers", label: "Cash buyers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function NavLinks({ className }: { className: string }) {
  const pathname = usePathname();
  return (
    <nav className={className} aria-label="Primary">
      {links.map((link) => {
        const active = pathname === link.href;
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
  return (
    <header className="sticky top-0 z-30 border-b border-sand/80 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link href="/" aria-label={`${brand.name} home`} className="rounded-md">
          <Logo />
        </Link>
        <NavLinks className="hidden items-center gap-1 lg:flex" />
        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/buyers" className="btn btn-secondary">
            Join our buyers list
          </Link>
          <Link href="/sell" className="btn btn-primary">
            Get a cash offer
          </Link>
        </div>
        <details className="relative lg:hidden">
          <summary className="menu-summary btn btn-secondary cursor-pointer px-4">Menu</summary>
          <div className="absolute right-0 z-40 mt-2 w-[min(20rem,calc(100vw-2.5rem))] rounded-3xl border border-sand bg-paper p-4 shadow-lg">
            <NavLinks className="flex flex-col gap-1" />
            <div className="mt-4 grid gap-2">
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
