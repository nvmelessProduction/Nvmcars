import { createClient } from "@supabase/supabase-js";
import { secureStorageAdapter } from "@/lib/secureStorage";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    "[Nvmcars] Supabase env vars missing. Set EXPO_PUBLIC_SUPABASE_URL and " +
      "EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file. The app will run in " +
      "offline/mock mode until configured."
  );
}

// Auth session salvata in expo-secure-store (Keychain iOS / Keystore Android),
// NON in AsyncStorage in chiaro. Vedi src/lib/secureStorage.ts.
export const supabase = createClient(url ?? "https://placeholder.supabase.co", anonKey ?? "placeholder", {
  auth: {
    storage: secureStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const isSupabaseConfigured = Boolean(url && anonKey);
