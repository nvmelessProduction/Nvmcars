import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  FlatList,
  Linking,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { KAV } from "@/components/KAV";
import { ChatBubble } from "@/components/ChatBubble";
import { AttachSheet } from "@/components/AttachSheet";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { WORKSHOPS } from "@/data/workshops";
import { pickFromGallery, recordVideo, takePhoto } from "@/utils/mediaPicker";
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
  const markRead = useChatStore((s) => s.markRead);
  const allMessages = useChatStore((s) => s.messages);
  const workshop = WORKSHOPS.find((w) => w.id === workshopId);
  const [text, setText] = useState("");
  const [attachOpen, setAttachOpen] = useState(false);
  const listRef = useRef<FlatList>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: workshop?.name ?? "Chat" });
  }, [navigation, workshop]);

  // Hide bottom tab bar while in chat so the keyboard has full vertical space
  useLayoutEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ tabBarStyle: { display: "none" } });
    return () => {
      parent?.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation]);

  useEffect(() => {
    if (user) ensure(user.id, workshopId);
  }, [user, workshopId, ensure]);

  const convId = user ? `cv-${user.id}-${workshopId}` : "";

  useEffect(() => {
    if (convId) markRead(convId, "customer");
  }, [convId, markRead]);
  const messages = useMemo(
    () =>
      allMessages
        .filter((m) => m.conversationId === convId)
        .sort((a, b) => a.createdAt - b.createdAt),
    [allMessages, convId]
  );

  if (!user || !workshop) return null;

  const scrollEnd = () =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);

  const onSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    send({ conversationId: convId, senderId: user.id, kind: "text", text: trimmed });
    setText("");
    scrollEnd();
    setTimeout(() => {
      send({
        conversationId: convId,
        senderId: workshopId,
        kind: "text",
        text: "Grazie del messaggio, ti risponderò appena possibile.",
      });
      scrollEnd();
    }, 900);
  };

  const handleAttach = async (a: "camera" | "gallery" | "video") => {
    console.log("[ChatScreen] handleAttach:", a);
    const picker = a === "camera" ? takePhoto : a === "gallery" ? pickFromGallery : recordVideo;
    try {
      const r = await picker();
      console.log("[ChatScreen] picker result:", r ? "got media" : "null");
      if (!r) return;
      send({
        conversationId: convId,
        senderId: user.id,
        kind: r.isVideo ? "video" : "image",
        mediaUri: r.uri,
        mediaWidth: r.width,
        mediaHeight: r.height,
      });
      scrollEnd();
    } catch (e) {
      console.warn("[ChatScreen] picker error:", e);
    }
  };

  return (
    <ScreenContainer>
      <KAV>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item }) => (
            <ChatBubble
              message={item}
              mine={item.senderId === user.id}
              onPressQuote={(qid) => navigation.navigate("QuoteDetail", { quoteId: qid })}
              onPressMedia={(uri, isVideo) => {
                if (isVideo) Linking.openURL(uri).catch(() => undefined);
              }}
            />
          )}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
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
      </KAV>

      <AttachSheet
        visible={attachOpen}
        onClose={() => setAttachOpen(false)}
        onPick={handleAttach}
      />
    </ScreenContainer>
  );
}
