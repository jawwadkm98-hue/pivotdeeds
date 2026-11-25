import type { MetadataRoute } from "next";
import { brand } from "@brand";

const paths = [
  "/",
  "/how-it-works",
  "/sell",
  "/sell/real-estate",
  "/sell/gold",
  "/sell/jewelry",
  "/we-buy",
  "/situations",
  "/buyers",
  "/inventory",
  "/about",
  "/faq",
  "/contact",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return paths.map((path) => ({
    url: new URL(path, brand.siteUrl).toString(),
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/sell") || path === "/buyers" ? 0.9 : 0.6,
  }));
}
