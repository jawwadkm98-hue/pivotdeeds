/**
 * Crown Wholesalers brand configuration.
 *
 * This is the place for the company name, default phone, default email, service area,
 * domain, and social links. The public phone and email can be overridden from
 * /admin/settings, which stores them in the database.
 *
 * TODO: Replace `phone` with the live business number before launch.
 * TODO: Set `phoneStatus` to "live" once that number can be called and texted.
 * Social URLs stay blank until real profiles exist. Only https links are shown.
 */

export const brand = {
  name: "Crown Wholesalers",
  domain: "crownwholesalers.com",
  siteUrl: "https://crownwholesalers.com",
  tagline: "Cash for property, gold, and fine jewelry.",
  email: "jawwad@wmbre.com",
  // TODO: Replace this placeholder with the real Crown Wholesalers phone number.
  phone: "(000) 000-0000",
  // TODO: Change to "live" after `phone` is a working number.
  phoneStatus: "placeholder" as "placeholder" | "live",
  serviceArea: "Nationwide — all 50 U.S. states and Washington, D.C.",
  social: {
    facebook: "",
    instagram: "",
    linkedin: "",
    youtube: "",
  },
};

const socialLabels = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
} as const;

export function socialProfiles(): { label: string; href: string }[] {
  return (Object.entries(brand.social) as [keyof typeof socialLabels, string][])
    .filter(([, href]) => /^https:\/\/\S+$/.test(href))
    .map(([key, href]) => ({ label: socialLabels[key], href }));
}

export function phoneIsLive(): boolean {
  return brand.phoneStatus === "live" && brand.phone.replace(/\D/g, "").length >= 10;
}

export function phoneHref(): string {
  const digits = brand.phone.replace(/\D/g, "");
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return `tel:+1${national}`;
}
