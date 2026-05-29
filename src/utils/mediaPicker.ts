import * as ImagePicker from "expo-image-picker";
import { Alert, Linking } from "react-native";

export type PickedMedia = {
  uri: string;
  isVideo: boolean;
  width?: number;
  height?: number;
};

async function ensurePermission(
  request: () => Promise<ImagePicker.PermissionResponse>,
  label: "fotocamera" | "libreria foto" | "microfono"
): Promise<boolean> {
  try {
    const res = await request();
    if (res.status === "granted") return true;
    if (!res.canAskAgain) {
      Alert.alert(
        "Permesso negato",
        `Vai nelle impostazioni del telefono e abilita l'accesso a "${label}" per Nvmcars.`,
        [
          { text: "Annulla", style: "cancel" },
          {
            text: "Apri impostazioni",
            onPress: () => Linking.openSettings().catch(() => undefined),
          },
        ]
      );
    } else {
      Alert.alert(
        "Permesso necessario",
        `Per inviare media devi concedere accesso a "${label}".`
      );
    }
    return false;
  } catch (e) {
    Alert.alert("Errore permesso", String(e));
    return false;
  }
}

function logAndAlert(action: string, e: unknown): null {
  const msg = e instanceof Error ? e.message : String(e);
  console.warn(`[mediaPicker] ${action} failed:`, e);
  Alert.alert(`Errore ${action}`, msg);
  return null;
}

export async function pickFromGallery(): Promise<PickedMedia | null> {
  if (!(await ensurePermission(ImagePicker.requestMediaLibraryPermissionsAsync, "libreria foto"))) {
    return null;
  }
  try {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      quality: 0.8,
      allowsMultipleSelection: false,
      allowsEditing: false,
      videoMaxDuration: 60,
    });
    if (r.canceled || !r.assets?.length) return null;
    const a = r.assets[0];
    return {
      uri: a.uri,
      isVideo: a.type === "video",
      width: a.width,
      height: a.height,
    };
  } catch (e) {
    return logAndAlert("galleria", e);
  }
}

export async function takePhoto(): Promise<PickedMedia | null> {
  if (!(await ensurePermission(ImagePicker.requestCameraPermissionsAsync, "fotocamera"))) {
    return null;
  }
  try {
    const r = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: false,
      cameraType: ImagePicker.CameraType.back,
    });
    if (r.canceled || !r.assets?.length) return null;
    const a = r.assets[0];
    return { uri: a.uri, isVideo: false, width: a.width, height: a.height };
  } catch (e) {
    return logAndAlert("fotocamera", e);
  }
}

export async function recordVideo(): Promise<PickedMedia | null> {
  if (!(await ensurePermission(ImagePicker.requestCameraPermissionsAsync, "fotocamera"))) {
    return null;
  }
  try {
    const r = await ImagePicker.launchCameraAsync({
      mediaTypes: ["videos"],
      videoMaxDuration: 60,
      allowsEditing: false,
      cameraType: ImagePicker.CameraType.back,
      videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
    });
    if (r.canceled || !r.assets?.length) return null;
    const a = r.assets[0];
    return { uri: a.uri, isVideo: true, width: a.width, height: a.height };
  } catch (e) {
    return logAndAlert("registrazione video", e);
  }
}
