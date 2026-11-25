import type { MetadataRoute } from "next";
import { brand } from "@brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/"],
    },
    sitemap: new URL("/sitemap.xml", brand.siteUrl).toString(),
    host: brand.siteUrl,
  };
}
