import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ChatBubble } from "@/components/ChatBubble";
import { AttachSheet } from "@/components/AttachSheet";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { pickFromGallery, recordVideo, takePhoto } from "@/utils/mediaPicker";
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
  const [attachOpen, setAttachOpen] = useState(false);
  const listRef = useRef<FlatList>(null);
  const conversation = conversations.find((c) => c.id === conversationId);

  useLayoutEffect(() => {
    navigation.setOptions({ title: `Cliente #${conversation?.customerId?.slice(0, 6) ?? ""}` });
  }, [navigation, conversation]);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50);
  }, [messages.length]);

  if (!user || user.role !== "professional") return null;
  const senderId = user.workshopId;

  const scrollEnd = () =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);

  const onSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    send({ conversationId, senderId, kind: "text", text: trimmed });
    setText("");
    scrollEnd();
  };

  const handleAttach = async (a: "camera" | "gallery" | "video") => {
    const picker = a === "camera" ? takePhoto : a === "gallery" ? pickFromGallery : recordVideo;
    const r = await picker();
    if (!r) return;
    send({
      conversationId,
      senderId,
      kind: r.isVideo ? "video" : "image",
      mediaUri: r.uri,
      mediaWidth: r.width,
      mediaHeight: r.height,
    });
    scrollEnd();
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: colors.bgElevated,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Pressable
            onPress={() => navigation.navigate("CreateQuote", { conversationId })}
            style={{
              backgroundColor: colors.accent,
              borderRadius: 12,
              paddingVertical: 10,
              paddingHorizontal: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 18 }}>💶</Text>
            <Text style={{ color: "#FFF", fontWeight: "800", fontSize: 14 }}>
              {t.quote.createQuote}
            </Text>
          </Pressable>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item }) => (
            <ChatBubble
              message={item}
              mine={item.senderId === senderId}
              onPressQuote={(qid) => navigation.navigate("QuoteDetail", { quoteId: qid })}
              onPressMedia={(uri, isVideo) => {
                if (isVideo) Linking.openURL(uri).catch(() => undefined);
              }}
            />
          )}
        />

        <View
          style={{
            flexDirection: "row",
            padding: 12,
            gap: 8,
            alignItems: "flex-end",
            backgroundColor: colors.bgElevated,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <Pressable
            onPress={() => setAttachOpen(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.bg,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 20, color: colors.text }}>＋</Text>
          </Pressable>

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
            disabled={!text.trim()}
            style={{
              backgroundColor: text.trim() ? colors.accent : colors.border,
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

      <AttachSheet
        visible={attachOpen}
        onClose={() => setAttachOpen(false)}
        onPick={handleAttach}
      />
    </ScreenContainer>
  );
}
