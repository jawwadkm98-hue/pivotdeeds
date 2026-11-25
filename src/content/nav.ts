export const primaryNav = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/we-buy", label: "We buy" },
  { href: "/sell", label: "Sell" },
  { href: "/situations", label: "Situations" },
  { href: "/buyers", label: "Buyers" },
  { href: "/about", label: "About" },
] as const;

export const sellLinks = [
  { href: "/sell/real-estate", label: "Sell real estate" },
  { href: "/sell/gold", label: "Sell gold & precious metals" },
  { href: "/sell/jewelry", label: "Sell diamonds & jewelry" },
  { href: "/sell", label: "Sell another asset" },
] as const;

export const companyLinks = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/we-buy", label: "We buy" },
  { href: "/situations", label: "Situations" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

export function navIsActive(pathname: string, href: string): boolean {
  if (href === "/sell") return pathname === "/sell" || pathname.startsWith("/sell/");
  return pathname === href;
}
