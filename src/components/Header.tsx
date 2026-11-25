"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { brand } from "@brand";
import { navIsActive, primaryNav, sellLinks } from "@/content/nav";
import { Logo } from "./Logo";

function NavLinks({ className, onNavigate }: { className: string; onNavigate?: () => void }) {
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
            onClick={onNavigate}
            className={`rounded-full px-3 py-2 text-sm font-medium ${active ? "bg-ember text-navy" : "text-ivory hover:bg-paper"}`}
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
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className={`site-header ${compact ? "is-compact" : ""}`}>
      <div className="header-bar mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
        <Link href="/" aria-label={`${brand.name} home`} className="min-w-0 rounded-md">
          <Logo surface="dark" />
        </Link>
        <NavLinks className="hidden items-center gap-1 xl:flex" />
        <div className="hidden items-center gap-2 xl:flex">
          <Link href="/sell" className="btn btn-primary">
            Get a cash offer
          </Link>
        </div>
        <button
          type="button"
          className="btn btn-secondary px-4 xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      <div id="mobile-menu" className={`menu-panel absolute inset-x-0 top-full z-40 px-5 xl:hidden ${open ? "is-open" : ""}`}>
        <div className="max-h-[80vh] overflow-auto rounded-3xl border border-sand bg-paper p-4 shadow-lg">
          <NavLinks className="flex flex-col gap-1" onNavigate={() => setOpen(false)} />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-brass">Sell</p>
          <ul className="mt-2 space-y-1">
            {sellLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className="block rounded-full px-3 py-2 text-sm hover:bg-cream"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-2">
            <Link href="/faq" onClick={() => setOpen(false)} className="rounded-full px-3 py-2 text-sm font-medium hover:bg-cream">
              FAQ
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="rounded-full px-3 py-2 text-sm font-medium hover:bg-cream">
              Contact
            </Link>
            <Link href="/sell" onClick={() => setOpen(false)} className="btn btn-primary">
              Get a cash offer
            </Link>
            <Link href="/buyers" onClick={() => setOpen(false)} className="btn btn-secondary">
              Join our buyers list
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
