import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const USER_DATA_KEYS = [
  "nvmcars-auth",
  "nvmcars-cars",
  "nvmcars-bookings",
  "nvmcars-chat",
  "nvmcars-favorites",
  "nvmcars-notifications",
  "nvmcars-reviews",
  "nvmcars-quotes",
];

// GDPR Art. 17 (right to erasure).
// Cancella prima i dati lato Supabase (edge function delete-user-data),
// poi pulisce lo storage locale. Se il backend non è configurato o fallisce,
// procediamo comunque con la pulizia locale e propaghiamo l'errore.
export async function wipeUserData(): Promise<void> {
  let serverError: Error | null = null;
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.functions.invoke("delete-user-data", {
        body: {},
      });
      if (error) serverError = new Error(error.message || "delete_failed");
    } catch (e) {
      serverError = e instanceof Error ? e : new Error(String(e));
    }
  }

  await AsyncStorage.multiRemove(USER_DATA_KEYS);

  if (serverError) {
    throw serverError;
  }
}

// GDPR Art. 20 (data portability).
// Combina i dati lato server (edge function export-user-data) con quelli locali.
export async function exportUserData(): Promise<Record<string, unknown>> {
  const local: Record<string, unknown> = {};
  const entries = await AsyncStorage.multiGet(USER_DATA_KEYS);
  for (const [key, value] of entries) {
    if (!value) continue;
    try {
      local[key] = JSON.parse(value);
    } catch {
      local[key] = value;
    }
  }

  let server: unknown = null;
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.functions.invoke("export-user-data", {
        body: {},
      });
      if (!error) server = data;
    } catch {
      // non blocchiamo l'export locale se il server fallisce
    }
  }

  return {
    exportedAt: new Date().toISOString(),
    appVersion: "1.0.0",
    local,
    server,
  };
}
