import type { MetadataRoute } from "next";
import { getAllActiveWorkshopsForSitemap, getAllPublishedDiyGuides } from "@/lib/supabase";

const BASE = "https://nvmcars.it";
const SERVICES = ["tagliando", "cambio-gomme", "freni", "revisione", "carrozzeria", "diagnosi"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [workshops, diyGuides] = await Promise.all([
    getAllActiveWorkshopsForSitemap(),
    getAllPublishedDiyGuides(),
  ]);
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

  const servicePages: MetadataRoute.Sitemap = SERVICES.map((s) => ({
    url: `${BASE}/servizi/${s}`,
    priority: 0.7,
    changeFrequency: "monthly",
  }));

  const diyPages: MetadataRoute.Sitemap = diyGuides.map((g) => ({
    url: `${BASE}/diy/${g.slug}`,
    priority: 0.6,
    changeFrequency: "monthly",
  }));

  return [...staticPages, ...cityPages, ...workshopPages, ...servicePages, ...diyPages];
}
