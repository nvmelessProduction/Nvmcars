import AsyncStorage from "@react-native-async-storage/async-storage";

// Adapter Supabase Auth → expo-secure-store con fallback AsyncStorage.
//
// Perché: il token di sessione Supabase contiene access/refresh token.
// In AsyncStorage è in chiaro nello storage app (estraibile su device root/jailbroken).
// In SecureStore va nel Keychain (iOS) / Keystore (Android) cifrati hardware.
//
// Limite SecureStore Android: 2048 byte per valore. Le session Supabase normali
// stanno sotto, ma se il token cresce facciamo chunking trasparente (suffisso __N).
// Su web o se la dep manca, fallback graceful ad AsyncStorage.

let SecureStore: typeof import("expo-secure-store") | null = null;
try {
  SecureStore = require("expo-secure-store");
} catch {
  SecureStore = null;
}

const CHUNK_SIZE = 1800; // < 2048 per stare comodi sotto al limite Android
const CHUNK_COUNT_SUFFIX = "__chunks";

async function setSecure(key: string, value: string): Promise<void> {
  if (!SecureStore) {
    await AsyncStorage.setItem(key, value);
    return;
  }
  if (value.length <= CHUNK_SIZE) {
    await SecureStore.setItemAsync(key, value);
    await SecureStore.deleteItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`).catch(() => {});
    return;
  }
  // chunking
  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += CHUNK_SIZE) {
    chunks.push(value.slice(i, i + CHUNK_SIZE));
  }
  await SecureStore.setItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`, String(chunks.length));
  await Promise.all(
    chunks.map((c, i) => SecureStore!.setItemAsync(`${key}__${i}`, c))
  );
  await SecureStore.deleteItemAsync(key).catch(() => {});
}

async function getSecure(key: string): Promise<string | null> {
  if (!SecureStore) {
    return AsyncStorage.getItem(key);
  }
  const direct = await SecureStore.getItemAsync(key);
  if (direct) return direct;
  const chunksRaw = await SecureStore.getItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`);
  if (!chunksRaw) return null;
  const n = parseInt(chunksRaw, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    const p = await SecureStore.getItemAsync(`${key}__${i}`);
    if (p == null) return null;
    parts.push(p);
  }
  return parts.join("");
}

async function deleteSecure(key: string): Promise<void> {
  if (!SecureStore) {
    await AsyncStorage.removeItem(key);
    return;
  }
  const chunksRaw = await SecureStore.getItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`);
  if (chunksRaw) {
    const n = parseInt(chunksRaw, 10);
    if (Number.isFinite(n) && n > 0) {
      await Promise.all(
        Array.from({ length: n }, (_, i) =>
          SecureStore!.deleteItemAsync(`${key}__${i}`).catch(() => {})
        )
      );
    }
    await SecureStore.deleteItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`).catch(() => {});
  }
  await SecureStore.deleteItemAsync(key).catch(() => {});
}

export const secureStorageAdapter = {
  getItem: (key: string) => getSecure(key),
  setItem: (key: string, value: string) => setSecure(key, value),
  removeItem: (key: string) => deleteSecure(key),
};

export const isSecureStoreAvailable = SecureStore != null;
