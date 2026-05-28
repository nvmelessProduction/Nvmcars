import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function listMyFavorites(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("favorites")
    .select("workshop_id")
    .eq("user_id", userId);
  if (error || !data) return [];
  return data.map((r) => r.workshop_id);
}

export async function addFavoriteRemote(userId: string, workshopId: string) {
  if (!isSupabaseConfigured) return;
  await supabase
    .from("favorites")
    .insert({ user_id: userId, workshop_id: workshopId })
    .select()
    .single();
}

export async function removeFavoriteRemote(userId: string, workshopId: string) {
  if (!isSupabaseConfigured) return;
  await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("workshop_id", workshopId);
}
