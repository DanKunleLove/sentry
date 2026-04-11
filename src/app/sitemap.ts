import type { MetadataRoute } from "next";
import { allWorks } from "@/content/works";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const lastModified = new Date();

  const staticPages = [
    "",
    "/work",
    "/about",
    "/services",
    "/creative",
    "/now",
    "/resume",
    "/chat",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const workPages = allWorks.map((w) => ({
    url: `${base}/work/${w.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...workPages];
}
