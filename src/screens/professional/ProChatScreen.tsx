import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import type { ProRequestsStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<ProRequestsStackParamList, "ProChat">;
type Route = RouteProp<ProRequestsStackParamList, "ProChat">;

export function ProChatScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { conversationId } = route.params;
  const colors = useColors();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const allMessages = useChatStore((s) => s.messages);
  const send = useChatStore((s) => s.send);
  const conversations = useChatStore((s) => s.conversations);
  const messages = useMemo(
    () =>
      allMessages
        .filter((m) => m.conversationId === conversationId)
        .sort((a, b) => a.createdAt - b.createdAt),
    [allMessages, conversationId]
  );
  const [text, setText] = useState("");
  const listRef = useRef<FlatList>(null);
  const conversation = conversations.find((c) => c.id === conversationId);

  useLayoutEffect(() => {
    navigation.setOptions({ title: `Cliente #${conversation?.customerId?.slice(0, 6) ?? ""}` });
  }, [navigation, conversation]);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50);
  }, [messages.length]);

  if (!user || user.role !== "professional") return null;

  const onSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    send(conversationId, user.workshopId, trimmed);
    setText("");
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item }) => {
            const mine = item.senderId === user.workshopId;
            return (
              <Animated.View
                entering={FadeIn.duration(250)}
                style={{
                  alignSelf: mine ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  backgroundColor: mine ? colors.accent : colors.bgElevated,
                  borderRadius: 16,
                  borderTopRightRadius: mine ? 4 : 16,
                  borderTopLeftRadius: mine ? 16 : 4,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderWidth: mine ? 0 : 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ color: mine ? "#FFF" : colors.text, fontSize: 15, lineHeight: 21 }}>
                  {item.text}
                </Text>
              </Animated.View>
            );
          }}
        />

        <View
          style={{
            flexDirection: "row",
            padding: 12,
            gap: 8,
            backgroundColor: colors.bgElevated,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={t.chat.typeMessage}
            placeholderTextColor={colors.textMuted}
            multiline
            style={{
              flex: 1,
              backgroundColor: colors.bg,
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 10,
              fontSize: 15,
              color: colors.text,
              maxHeight: 100,
            }}
          />
          <Pressable
            onPress={onSend}
            style={{
              backgroundColor: colors.accent,
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "700" }}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
