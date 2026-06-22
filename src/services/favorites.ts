import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Ritorna gli id officina preferiti, oppure `null` se la lettura remota fallisce.
 * Distinguere "nessun preferito" (`[]`) da "errore" (`null`) evita che un errore
 * di rete azzeri i preferiti già presenti in locale durante l'hydrate.
 */
export async function listMyFavorites(userId: string): Promise<string[] | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("favorites")
    .select("workshop_id")
    .eq("user_id", userId);
  if (error || !data) return null;
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
