import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabasePublic = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder"
);

export const isConfigured = !!(url && anonKey);

export type PublicWorkshop = {
  id: string;
  name: string;
  city: string;
  address: string;
  cap?: string | null;
  province?: string | null;
  rating: number;
  reviews_count: number;
  photo_url?: string | null;
  description?: string | null;
};

export async function getWorkshopsByCity(city: string): Promise<PublicWorkshop[]> {
  if (!isConfigured) return [];
  const { data } = await supabasePublic
    .from("workshops")
    .select("id, name, city, address, cap, province, rating, reviews_count, photo_url, description")
    .ilike("city", city)
    .eq("status", "active")
    .order("rating", { ascending: false })
    .limit(50);
  return data ?? [];
}

export async function getWorkshopById(id: string): Promise<PublicWorkshop | null> {
  if (!isConfigured) return null;
  const { data } = await supabasePublic
    .from("workshops")
    .select("id, name, city, address, cap, province, rating, reviews_count, photo_url, description")
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();
  return data ?? null;
}

export async function getAllActiveWorkshopsForSitemap(): Promise<Pick<PublicWorkshop, "id" | "city">[]> {
  if (!isConfigured) return [];
  const { data } = await supabasePublic
    .from("workshops")
    .select("id, city")
    .eq("status", "active")
    .limit(5000);
  return data ?? [];
}
