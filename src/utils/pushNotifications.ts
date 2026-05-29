// Wrapper per expo-notifications. Se la dep non è installata, è no-op.
// Quando attivo: chiede permessi e ottiene un Expo push token salvabile su profiles.push_token.
import { Platform } from "react-native";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

let notifications: any = null;
try {
  notifications = require("expo-notifications");
  notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch {
  notifications = null;
}

export async function registerForPushNotificationsAsync(userId?: string): Promise<string | null> {
  if (!notifications) return null;
  try {
    if (Platform.OS === "android") {
      await notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const { status: existing } = await notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== "granted") {
      const { status } = await notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") return null;

    const tokenRes = await notifications.getExpoPushTokenAsync();
    const token = tokenRes.data;
    if (token && userId && isSupabaseConfigured) {
      await supabase.from("profiles").update({ push_token: token }).eq("id", userId);
    }
    return token;
  } catch (e) {
    console.warn("Push notification setup failed:", e);
    return null;
  }
}

export async function scheduleLocalNotification(input: {
  title: string;
  body: string;
  delaySeconds?: number;
  data?: Record<string, unknown>;
}) {
  if (!notifications) return;
  await notifications.scheduleNotificationAsync({
    content: {
      title: input.title,
      body: input.body,
      data: input.data ?? {},
    },
    trigger: input.delaySeconds && input.delaySeconds > 0 ? { seconds: input.delaySeconds } : null,
  });
}

export async function cancelAllNotifications() {
  if (!notifications) return;
  await notifications.cancelAllScheduledNotificationsAsync();
}

export function setBadgeCount(count: number) {
  if (!notifications) return;
  notifications.setBadgeCountAsync?.(count).catch(() => undefined);
}
