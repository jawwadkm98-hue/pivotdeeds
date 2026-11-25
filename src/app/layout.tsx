import type { Metadata, Viewport } from "next";
import "@fontsource-variable/outfit";
import "@fontsource-variable/fraunces/wght.css";
import "@fontsource-variable/fraunces/wght-italic.css";
import { brand, socialProfiles } from "@brand";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import "./globals.css";

const description = `${brand.name} is a nationwide cash buyer of real estate, gold, diamonds, jewelry, and other high-value assets. Request a no-obligation offer or join the buyers list.`;

export const metadata: Metadata = {
  metadataBase: new URL(brand.siteUrl),
  title: {
    default: `${brand.name} | Nationwide cash buyers`,
    template: `%s | ${brand.name}`,
  },
  description,
  applicationName: brand.name,
  authors: [{ name: brand.name, url: brand.siteUrl }],
  creator: brand.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: brand.name,
    title: `${brand.name} | Nationwide cash buyers`,
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} | Nationwide cash buyers`,
    description,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#162033",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const sameAs = socialProfiles().map((item) => item.href);
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.name,
    url: brand.siteUrl,
    email: brand.email,
    logo: `${brand.siteUrl}/mark.svg`,
    description,
    areaServed: { "@type": "Country", "name": "United States" },
    ...(sameAs.length ? { sameAs } : {}),
  };

  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <JsonLd data={organization} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-paper focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
