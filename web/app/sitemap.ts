import type { MetadataRoute } from "next";
import { getAllActiveWorkshopsForSitemap } from "@/lib/supabase";

const BASE = "https://nvmcars.it";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const workshops = await getAllActiveWorkshopsForSitemap();
  const citySet = new Set<string>();
  for (const w of workshops) citySet.add(w.city.toLowerCase());

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, priority: 1, changeFrequency: "weekly" },
    { url: `${BASE}/per-le-officine`, priority: 0.9, changeFrequency: "monthly" },
    { url: `${BASE}/privacy`, priority: 0.3 },
    { url: `${BASE}/termini`, priority: 0.3 },
  ];

  const cityPages: MetadataRoute.Sitemap = Array.from(citySet).map((c) => ({
    url: `${BASE}/officine/${encodeURIComponent(c)}`,
    priority: 0.8,
    changeFrequency: "weekly",
  }));

  const workshopPages: MetadataRoute.Sitemap = workshops.map((w) => ({
    url: `${BASE}/officina/${w.id}`,
    priority: 0.7,
    changeFrequency: "weekly",
  }));

  return [...staticPages, ...cityPages, ...workshopPages];
}
