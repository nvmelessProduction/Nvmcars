import { Image, Pressable, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useColors } from "@/store/useThemeStore";
import { useQuoteStore } from "@/store/useQuoteStore";
import { useT } from "@/i18n";
import { hitSlop, withOpacity } from "@/theme/tokens";
import type { ChatMessage } from "@/types";

type Props = {
  message: ChatMessage;
  mine: boolean;
  onPressQuote?: (quoteId: string) => void;
  onPressMedia?: (uri: string, isVideo: boolean) => void;
};

export function ChatBubble({ message, mine, onPressQuote, onPressMedia }: Props) {
  const colors = useColors();
  const t = useT();
  const quote = useQuoteStore((s) =>
    message.quoteId ? s.byId(message.quoteId) : undefined
  );

  const time = new Date(message.createdAt).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
  // Indicatore di consegna, solo sui messaggi inviati da me.
  const statusGlyph =
    message.status === "sending" ? " 🕐" : message.status === "failed" ? " ⚠️" : " ✓";
  const timeWithStatus = mine ? `${time}${statusGlyph}` : time;

  if (message.kind === "system") {
    return (
      <Animated.View
        entering={FadeIn.duration(250)}
        style={{
          alignSelf: "center",
          maxWidth: "85%",
          backgroundColor: colors.accentSoft,
          paddingHorizontal: 12,
          paddingVertical: 7,
          borderRadius: 12,
          marginVertical: 4,
        }}
      >
        <Text style={{ color: colors.text, fontSize: 12, textAlign: "center" }}>
          {message.text}
        </Text>
      </Animated.View>
    );
  }

  if (message.kind === "quote" && quote) {
    return (
      <Animated.View
        entering={FadeIn.duration(250)}
        style={{
          alignSelf: mine ? "flex-end" : "flex-start",
          maxWidth: "85%",
        }}
      >
        <Pressable
          onPress={() => onPressQuote?.(quote.id)}
          hitSlop={hitSlop.small}
          accessibilityRole="button"
          accessibilityLabel={`Apri preventivo ${quote.title}`}
          style={{
            backgroundColor: colors.bgElevated,
            borderRadius: 18,
            borderTopRightRadius: mine ? 4 : 18,
            borderTopLeftRadius: mine ? 18 : 4,
            borderWidth: 1.5,
            borderColor: colors.accent,
            padding: 14,
            minWidth: 240,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "900",
              color: colors.accent,
              letterSpacing: 0.5,
            }}
          >
            💶 PREVENTIVO • {t.quote.status[quote.status].toUpperCase()}
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: colors.text,
              marginTop: 6,
              marginBottom: 4,
            }}
            numberOfLines={2}
          >
            {quote.title}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textMuted }}>
            {quote.lineItems.length}{" "}
            {quote.lineItems.length === 1 ? "voce" : "voci"}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              marginTop: 10,
              gap: 6,
            }}
          >
            <Text
              style={{ fontSize: 22, fontWeight: "900", color: colors.text }}
            >
              € {quote.total.toFixed(2)}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>totali</Text>
          </View>
          <View
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <Text style={{ color: colors.accent, fontSize: 13, fontWeight: "700" }}>
              Vedi dettagli →
            </Text>
          </View>
        </Pressable>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 10,
            marginTop: 4,
            textAlign: mine ? "right" : "left",
          }}
        >
          {timeWithStatus}
        </Text>
      </Animated.View>
    );
  }

  if (message.kind === "image" && message.mediaUri) {
    return (
      <Animated.View
        entering={FadeIn.duration(250)}
        style={{
          alignSelf: mine ? "flex-end" : "flex-start",
          maxWidth: "70%",
        }}
      >
        <Pressable onPress={() => onPressMedia?.(message.mediaUri!, false)}>
          <Image
            source={{ uri: message.mediaUri }}
            style={{
              width: 220,
              height: 220,
              borderRadius: 16,
              borderTopRightRadius: mine ? 4 : 16,
              borderTopLeftRadius: mine ? 16 : 4,
              backgroundColor: colors.bgElevated,
            }}
            resizeMode="cover"
          />
        </Pressable>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 10,
            marginTop: 4,
            textAlign: mine ? "right" : "left",
          }}
        >
          {timeWithStatus}
        </Text>
      </Animated.View>
    );
  }

  if (message.kind === "video" && message.mediaUri) {
    return (
      <Animated.View
        entering={FadeIn.duration(250)}
        style={{
          alignSelf: mine ? "flex-end" : "flex-start",
          maxWidth: "70%",
        }}
      >
        <Pressable
          onPress={() => onPressMedia?.(message.mediaUri!, true)}
          style={{
            width: 220,
            height: 220,
            borderRadius: 16,
            borderTopRightRadius: mine ? 4 : 16,
            borderTopLeftRadius: mine ? 16 : 4,
            backgroundColor: colors.bgElevated,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "rgba(0,0,0,0.55)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 28 }}>▶</Text>
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 10 }}>
            {t.chat.tapToPlay}
          </Text>
        </Pressable>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 10,
            marginTop: 4,
            textAlign: mine ? "right" : "left",
          }}
        >
          {timeWithStatus}
        </Text>
      </Animated.View>
    );
  }

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
      <Text style={{ color: mine ? "#FFFFFF" : colors.text, fontSize: 15, lineHeight: 21 }}>
        {message.text}
      </Text>
      <Text
        style={{
          color: mine ? withOpacity("#FFFFFF", 0.7) : colors.textMuted,
          fontSize: 10,
          marginTop: 4,
          textAlign: "right",
        }}
      >
        {time}
      </Text>
    </Animated.View>
  );
}
