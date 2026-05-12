import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export type PickedMedia = {
  uri: string;
  isVideo: boolean;
  width?: number;
  height?: number;
};

async function ensurePermission(
  fn: () => Promise<ImagePicker.PermissionResponse>
): Promise<boolean> {
  const res = await fn();
  if (res.status === "granted") return true;
  Alert.alert(
    "Permesso negato",
    "Concedi accesso a fotocamera/foto nelle impostazioni del telefono per inviare media."
  );
  return false;
}

export async function pickFromGallery(): Promise<PickedMedia | null> {
  const ok = await ensurePermission(ImagePicker.requestMediaLibraryPermissionsAsync);
  if (!ok) return null;
  const r = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images", "videos"],
    quality: 0.85,
    allowsMultipleSelection: false,
    videoMaxDuration: 60,
  });
  if (r.canceled || r.assets.length === 0) return null;
  const a = r.assets[0];
  return {
    uri: a.uri,
    isVideo: a.type === "video",
    width: a.width,
    height: a.height,
  };
}

export async function takePhoto(): Promise<PickedMedia | null> {
  const ok = await ensurePermission(ImagePicker.requestCameraPermissionsAsync);
  if (!ok) return null;
  const r = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    quality: 0.85,
  });
  if (r.canceled || r.assets.length === 0) return null;
  const a = r.assets[0];
  return { uri: a.uri, isVideo: false, width: a.width, height: a.height };
}

export async function recordVideo(): Promise<PickedMedia | null> {
  const ok = await ensurePermission(ImagePicker.requestCameraPermissionsAsync);
  if (!ok) return null;
  const r = await ImagePicker.launchCameraAsync({
    mediaTypes: ["videos"],
    videoMaxDuration: 60,
    quality: 0.85,
  });
  if (r.canceled || r.assets.length === 0) return null;
  const a = r.assets[0];
  return { uri: a.uri, isVideo: true, width: a.width, height: a.height };
}
