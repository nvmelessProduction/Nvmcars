import { useEffect, useMemo, useRef, useState } from "react";
import { useLayoutEffect } from "react";
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
import { WORKSHOPS } from "@/data/workshops";
import type { HomeStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<HomeStackParamList, "Chat">;
type Route = RouteProp<HomeStackParamList, "Chat">;

export function ChatScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { workshopId } = route.params;
  const colors = useColors();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const ensure = useChatStore((s) => s.ensureConversation);
  const send = useChatStore((s) => s.send);
  const allMessages = useChatStore((s) => s.messages);
  const workshop = WORKSHOPS.find((w) => w.id === workshopId);
  const [text, setText] = useState("");
  const listRef = useRef<FlatList>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: workshop?.name ?? "Chat" });
  }, [navigation, workshop]);

  useEffect(() => {
    if (user) ensure(user.id, workshopId);
  }, [user, workshopId, ensure]);

  const convId = user ? `cv-${user.id}-${workshopId}` : "";
  const messages = useMemo(
    () =>
      allMessages
        .filter((m) => m.conversationId === convId)
        .sort((a, b) => a.createdAt - b.createdAt),
    [allMessages, convId]
  );

  if (!user || !workshop) return null;

  const onSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    send(convId, user.id, trimmed);
    setText("");
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    setTimeout(() => {
      send(convId, workshopId, "Grazie del messaggio, ti risponderò appena possibile.");
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }, 900);
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
            const mine = item.senderId === user.id;
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
                <Text
                  style={{
                    color: mine ? "rgba(255,255,255,0.7)" : colors.textMuted,
                    fontSize: 10,
                    marginTop: 4,
                    textAlign: "right",
                  }}
                >
                  {new Date(item.createdAt).toLocaleTimeString("it-IT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </Animated.View>
            );
          }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
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
