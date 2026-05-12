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
import type { ProProfileStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<ProProfileStackParamList, "ProChatsList">;

function timeAgo(ts?: number): string {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "ora";
  if (minutes < 60) return `${minutes} min fa`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h fa`;
  return `${Math.floor(hours / 24)}g fa`;
}

export function ProChatsListScreen() {
  const navigation = useNavigation<Nav>();
  const colors = useColors();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const conversations = useChatStore((s) => s.conversations);

  const workshopId = user && user.role === "professional" ? user.workshopId : null;

  const myConversations = useMemo(() => {
    if (!workshopId) return [];
    return [...conversations]
      .filter((c) => c.workshopId === workshopId)
      .sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0));
  }, [conversations, workshopId]);

  if (!workshopId) return null;

  return (
    <ScreenContainer>
      {myConversations.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <EmptyState emoji="💬" title={t.pro.noChats} body={t.chat.noChatsHint} />
        </View>
      ) : (
        <FlatList
          data={myConversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 24 }}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInRight.delay(index * 40).duration(250)}>
              <Pressable
                onPress={() =>
                  navigation.navigate("ProChat", { conversationId: item.id })
                }
              >
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
                      <Text style={{ fontSize: 22 }}>👤</Text>
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
                          {t.pro.customerLabel} #{item.customerId.slice(0, 6)}
                        </Text>
                        <Text style={{ fontSize: 11, color: colors.textMuted }}>
                          {timeAgo(item.lastMessageAt)}
                        </Text>
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
                          {item.lastMessage ?? "—"}
                        </Text>
                        {(item.unreadCountPro ?? 0) > 0 ? (
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
                              {item.unreadCountPro}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </View>
                </Card>
              </Pressable>
            </Animated.View>
          )}
        />
      )}
    </ScreenContainer>
  );
}
