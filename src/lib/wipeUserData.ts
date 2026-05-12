import AsyncStorage from "@react-native-async-storage/async-storage";

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

export async function wipeUserData() {
  await AsyncStorage.multiRemove(USER_DATA_KEYS);
}

export async function exportUserData(): Promise<Record<string, unknown>> {
  const entries = await AsyncStorage.multiGet(USER_DATA_KEYS);
  const out: Record<string, unknown> = {};
  for (const [key, value] of entries) {
    if (!value) continue;
    try {
      out[key] = JSON.parse(value);
    } catch {
      out[key] = value;
    }
  }
  return {
    exportedAt: new Date().toISOString(),
    appVersion: "0.2.0",
    data: out,
  };
}
