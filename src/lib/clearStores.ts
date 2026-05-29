import AsyncStorage from "@react-native-async-storage/async-storage";

// Chiavi Zustand persist dei dati che NON devono sopravvivere al logout
// (privacy + multi-user device).
// L'auth Supabase session è già in SecureStore: viene pulita da supabase.auth.signOut().
const USER_BOUND_KEYS = [
  "nvmcars-cars",
  "nvmcars-bookings",
  "nvmcars-chat",
  "nvmcars-favorites",
  "nvmcars-notifications",
  "nvmcars-reviews",
  "nvmcars-quotes",
  "nvmcars-subscription",
  "nvmcars-diy",
  "nvmcars-services",
  "nvmcars-workshop",
  "nvmcars-service-log",
];

/**
 * Pulisce tutti gli store Zustand legati all'utente corrente.
 * Mantiene language e theme (preference indipendenti dall'utente).
 */
export async function clearAllUserStores(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(USER_BOUND_KEYS);
  } catch (e) {
    console.warn("clearAllUserStores AsyncStorage error:", e);
  }
}
