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
// Avvia la cancellazione lato Supabase (edge function delete-user-data) e pulisce
// SEMPRE lo storage locale. La chiamata remota è best-effort e NON deve bloccare
// la cancellazione/uscita: se la rete è lenta o assente, l'utente esce comunque
// e i dati locali vengono rimossi (la cancellazione server viene comunque
// tentata). Diversamente, un errore di rete lasciava l'utente "bloccato" e ancora
// loggato — stesso difetto del vecchio logout.
export async function wipeUserData(): Promise<void> {
  // 1) Tenta la cancellazione remota (best-effort, non blocca in caso di errore).
  if (isSupabaseConfigured) {
    try {
      await supabase.functions.invoke("delete-user-data", { body: {} });
    } catch (e) {
      console.warn("delete-user-data failed (local wipe proceeds):", e);
    }
  }
  // 2) Pulizia locale: avviene SEMPRE.
  try {
    await AsyncStorage.multiRemove(USER_DATA_KEYS);
  } catch (e) {
    console.warn("local wipe error:", e);
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
