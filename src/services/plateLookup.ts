import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Car, CarCategory, FuelType } from "@/types";
import { lookupPlate as mockLookup } from "@/data/plateLookup";

export type PlateLookupResult = {
  ok: true;
  data: {
    plate: string;
    make: string;
    model: string;
    year: number;
    fuel: FuelType;
    displacement: number;
    category: CarCategory;
  };
} | {
  ok: false;
  reason: string;
};

export async function lookupPlate(plate: string): Promise<PlateLookupResult> {
  if (!isSupabaseConfigured) {
    const r = mockLookup(plate);
    if (!r) return { ok: false, reason: "Targa non trovata nei dati di test" };
    return { ok: true, data: r };
  }
  try {
    const { data, error } = await supabase.functions.invoke("plate-lookup", {
      body: { plate },
    });
    if (error) return { ok: false, reason: error.message };
    if (!data?.ok) return { ok: false, reason: data?.reason ?? "Lookup fallito" };
    return { ok: true, data: data.data };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "Errore di rete" };
  }
}
