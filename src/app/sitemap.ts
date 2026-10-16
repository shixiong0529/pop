import type { MetadataRoute } from "next";
import { fetchedAt, getAllProducts, getAllSeries, getIPs } from "@/lib/data";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = fetchedAt ? new Date(fetchedAt) : undefined;
  const u = (path: string) => `${SITE.url}${path}`;
  return [
    { url: u("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: u("/ips"), lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: u("/series"), lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: u("/about"), lastModified, changeFrequency: "monthly", priority: 0.3 },
    ...getIPs().flatMap((ip) => [
      { url: u(`/ips/${ip.slug}`), lastModified, changeFrequency: "monthly" as const, priority: 0.8 },
      { url: u(`/ips/${ip.slug}/collection`), lastModified, changeFrequency: "weekly" as const, priority: 0.7 },
    ]),
    ...getAllSeries().map((s) => ({ url: u(`/series/${s.slug}`), lastModified, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...getAllProducts().map((p) => ({ url: u(`/products/${p.slug}`), lastModified, changeFrequency: "yearly" as const, priority: 0.4 })),
  ];
}
