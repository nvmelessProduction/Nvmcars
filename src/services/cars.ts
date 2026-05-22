import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Car } from "@/types";

function rowToCar(row: any): Car {
  return {
    id: row.id,
    plate: row.plate,
    make: row.make,
    model: row.model,
    year: row.year,
    fuel: row.fuel,
    displacement: row.displacement ?? 0,
    category: row.category,
    nickname: row.nickname ?? undefined,
    km: row.km ?? undefined,
    lastServiceAt: row.last_service_at ? new Date(row.last_service_at).getTime() : undefined,
    nextRevisionAt: row.next_revision_at ? new Date(row.next_revision_at).getTime() : undefined,
    nextServiceKm: row.next_service_km ?? undefined,
  };
}

export async function listMyCars(userId: string): Promise<Car[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from("cars").select("*").eq("owner_id", userId);
  if (error || !data) return [];
  return data.map(rowToCar);
}

export async function createCar(
  userId: string,
  car: Omit<Car, "id">
): Promise<{ ok: boolean; id?: string; reason?: string }> {
  if (!isSupabaseConfigured) return { ok: true };
  const { data, error } = await supabase
    .from("cars")
    .insert({
      owner_id: userId,
      plate: car.plate,
      make: car.make,
      model: car.model,
      year: car.year,
      fuel: car.fuel,
      displacement: car.displacement,
      category: car.category,
      nickname: car.nickname ?? null,
      km: car.km ?? null,
      last_service_at: car.lastServiceAt ? new Date(car.lastServiceAt).toISOString() : null,
      next_revision_at: car.nextRevisionAt
        ? new Date(car.nextRevisionAt).toISOString()
        : null,
      next_service_km: car.nextServiceKm ?? null,
    })
    .select("id")
    .single();
  if (error) return { ok: false, reason: error.message };
  return { ok: true, id: data?.id };
}

export async function updateCar(id: string, patch: Partial<Car>) {
  if (!isSupabaseConfigured) return { ok: true };
  const updates: Record<string, unknown> = {};
  if (patch.plate !== undefined) updates.plate = patch.plate;
  if (patch.make !== undefined) updates.make = patch.make;
  if (patch.model !== undefined) updates.model = patch.model;
  if (patch.year !== undefined) updates.year = patch.year;
  if (patch.fuel !== undefined) updates.fuel = patch.fuel;
  if (patch.displacement !== undefined) updates.displacement = patch.displacement;
  if (patch.category !== undefined) updates.category = patch.category;
  if (patch.nickname !== undefined) updates.nickname = patch.nickname;
  if (patch.km !== undefined) updates.km = patch.km;
  if (patch.lastServiceAt !== undefined)
    updates.last_service_at = patch.lastServiceAt
      ? new Date(patch.lastServiceAt).toISOString()
      : null;
  if (patch.nextRevisionAt !== undefined)
    updates.next_revision_at = patch.nextRevisionAt
      ? new Date(patch.nextRevisionAt).toISOString()
      : null;
  if (patch.nextServiceKm !== undefined) updates.next_service_km = patch.nextServiceKm;
  const { error } = await supabase.from("cars").update(updates).eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function deleteCar(id: string) {
  if (!isSupabaseConfigured) return { ok: true };
  await supabase.from("cars").delete().eq("id", id);
  return { ok: true };
}
