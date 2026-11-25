import type { Metadata, Viewport } from "next";
import "@fontsource-variable/outfit";
import "@fontsource-variable/fraunces/wght.css";
import "@fontsource-variable/fraunces/wght-italic.css";
import { brand, socialProfiles } from "@brand";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { SiteFrame } from "@/components/SiteFrame";
import { getSiteContact } from "@/lib/settings";
import "./globals.css";

export const dynamic = "force-dynamic";

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
  themeColor: "#070B12",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const contact = await getSiteContact();
  const sameAs = socialProfiles().map((item) => item.href);
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.name,
    url: brand.siteUrl,
    email: contact.email,
    logo: `${brand.siteUrl}/mark.svg`,
    description,
    areaServed: { "@type": "Country", "name": "United States" },
    ...(sameAs.length ? { sameAs } : {}),
  };

  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <JsonLd data={organization} />
        <SiteFrame header={<Header />} footer={<Footer />}>
          {children}
        </SiteFrame>
      </body>
    </html>
  );
}
