// App Tracking Transparency (iOS) — wrapper safe.
// Apple richiede di chiedere il permesso anche se non tracciamo (per via di SDK terzi).
import { Platform } from "react-native";

let att: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  att = require("expo-tracking-transparency");
} catch {
  att = null;
}

export async function requestTrackingPermissionIfNeeded(): Promise<
  "granted" | "denied" | "restricted" | "not-determined" | "unavailable"
> {
  if (!att || Platform.OS !== "ios") return "unavailable";
  try {
    const current = await att.getTrackingPermissionsAsync();
    if (current.status === "undetermined") {
      const result = await att.requestTrackingPermissionsAsync();
      return result.status;
    }
    return current.status;
  } catch {
    return "unavailable";
  }
}
