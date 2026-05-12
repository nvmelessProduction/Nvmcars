import { useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FlatList, Pressable, Text, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { useResolvedWorkshop } from "@/store/useWorkshopStore";
import type { HomeStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<HomeStackParamList, "Chat">;

function timeAgo(ts?: number): string {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "ora";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}g`;
}

export function CustomerChatsListScreen() {
  const navigation = useNavigation<Nav>();
  const colors = useColors();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const conversations = useChatStore((s) => s.conversations);

  const myConversations = useMemo(() => {
    if (!user) return [];
    return [...conversations]
      .filter((c) => c.customerId === user.id)
      .sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0));
  }, [conversations, user]);

  if (!user) return null;

  return (
    <ScreenContainer>
      {myConversations.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <EmptyState emoji="💬" title={t.chat.noChats} body={t.chat.noChatsHint} />
        </View>
      ) : (
        <FlatList
          data={myConversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 24 }}
          renderItem={({ item, index }) => (
            <ChatRow
              workshopId={item.workshopId}
              lastMessage={item.lastMessage}
              lastMessageAt={item.lastMessageAt}
              unread={item.unreadCount}
              index={index}
              onPress={() => navigation.navigate("Chat", { workshopId: item.workshopId })}
            />
          )}
        />
      )}
    </ScreenContainer>
  );
}

function ChatRow({
  workshopId,
  lastMessage,
  lastMessageAt,
  unread,
  index,
  onPress,
}: {
  workshopId: string;
  lastMessage?: string;
  lastMessageAt?: number;
  unread: number;
  index: number;
  onPress: () => void;
}) {
  const colors = useColors();
  const workshop = useResolvedWorkshop(workshopId);
  return (
    <Animated.View entering={FadeInRight.delay(index * 40).duration(250)}>
      <Pressable onPress={onPress}>
        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors.accentSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 22 }}>🔧</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>
                  {workshop?.name ?? "Officina"}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>{timeAgo(lastMessageAt)}</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{ flex: 1, fontSize: 13, color: colors.textMuted }}
                >
                  {lastMessage ?? "—"}
                </Text>
                {unread > 0 ? (
                  <View
                    style={{
                      backgroundColor: colors.accent,
                      borderRadius: 999,
                      paddingHorizontal: 7,
                      paddingVertical: 2,
                      minWidth: 20,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "800" }}>
                      {unread}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  );
}
