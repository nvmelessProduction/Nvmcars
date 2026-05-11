import { FlatList, Pressable, Text, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import type { Notification } from "@/types";

const TYPE_EMOJI: Record<Notification["type"], string> = {
  booking_accepted: "✅",
  booking_rejected: "❌",
  booking_completed: "🏁",
  new_review: "⭐",
  promo: "🎁",
  system: "ℹ️",
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}g`;
}

export function NotificationsScreen() {
  const colors = useColors();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const all = useNotificationsStore((s) => s.notifications);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);

  const items = user
    ? all.filter((n) => n.userId === user.id).sort((a, b) => b.createdAt - a.createdAt)
    : [];

  return (
    <ScreenContainer>
      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 8,
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          {items.some((n) => !n.read) ? (
            <Pressable onPress={() => user && markAllRead(user.id)} hitSlop={8}>
              <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 13 }}>
                {t.notifications.markAllRead}
              </Text>
            </Pressable>
          ) : null}
        </View>
        {items.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <EmptyState emoji="🔔" title={t.notifications.noNotifications} />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 10 }}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInRight.delay(index * 50).duration(300)}>
                <Pressable onPress={() => markRead(item.id)}>
                  <Card style={{ borderColor: item.read ? colors.border : colors.accent }}>
                    <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
                      <Text style={{ fontSize: 30 }}>{TYPE_EMOJI[item.type]}</Text>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                          <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text, flex: 1 }}>
                            {item.title}
                          </Text>
                          <Text style={{ fontSize: 11, color: colors.textMuted, marginLeft: 6 }}>
                            {timeAgo(item.createdAt)}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4, lineHeight: 20 }}>
                          {item.body}
                        </Text>
                      </View>
                      {!item.read ? (
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: colors.accent,
                            marginTop: 6,
                          }}
                        />
                      ) : null}
                    </View>
                  </Card>
                </Pressable>
              </Animated.View>
            )}
          />
        )}
      </View>
    </ScreenContainer>
  );
}
