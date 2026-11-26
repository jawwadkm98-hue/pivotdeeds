"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/lib/actions";
import { CrownMark } from "../CrownMark";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/arv", label: "ARV Calculator" },
  { href: "/admin/sellers", label: "Seller leads" },
  { href: "/admin/buyers", label: "Cash buyers" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/files", label: "Files" },
  { href: "/admin/settings", label: "Settings" },
] as const;

function active(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16.5rem_1fr]">
      <div className={`fixed inset-0 z-30 bg-black/60 lg:hidden ${open ? "" : "hidden"}`} onClick={() => setOpen(false)} />
      <aside className={`fixed inset-y-0 z-40 flex w-64 flex-col border-r border-sand bg-pine-deep p-5 transition lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <Link href="/" className="flex items-center gap-2 text-[#D4A93C]">
          <CrownMark className="h-9 w-9 shrink-0" />
          <span className="text-xs font-semibold uppercase leading-tight tracking-[0.14em]">
            Crown
            <br />
            Wholesalers
          </span>
        </Link>
        <p className="mt-4 text-xs uppercase tracking-[0.16em] text-brass">Admin</p>
        <nav className="mt-6 flex flex-1 flex-col gap-1" aria-label="Admin">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active(pathname, link.href) ? "page" : undefined}
              className={`rounded-2xl px-3 py-2 text-sm font-semibold ${active(pathname, link.href) ? "bg-brass text-navy" : "text-ivory hover:bg-paper"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="mt-4 text-sm text-moss hover:text-ivory">
          View the site
        </Link>
        <form action={logout} className="mt-3">
          <button className="btn btn-secondary w-full" type="submit">
            Log out
          </button>
        </form>
      </aside>
      <div className="min-w-0">
        <div className="flex items-center justify-between border-b border-sand px-4 py-3 lg:hidden">
          <button type="button" className="btn btn-secondary" onClick={() => setOpen(true)}>
            Menu
          </button>
          <p className="text-sm font-semibold text-brass">Admin</p>
        </div>
        {children}
      </div>
    </div>
  );
}
