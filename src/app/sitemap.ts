import type { MetadataRoute } from "next";
import { brand } from "@brand";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = ["/", "/sell", "/buyers", "/about", "/contact", "/privacy", "/terms"];
  return paths.map((path) => ({
    url: new URL(path, brand.siteUrl).toString(),
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/sell" || path === "/buyers" ? 0.9 : 0.5,
  }));
}
