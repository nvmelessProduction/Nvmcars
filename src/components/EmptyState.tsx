import { Text, View } from "react-native";
import { useColors } from "@/store/useThemeStore";

type Props = {
  emoji: string;
  title: string;
  body?: string;
};

export function EmptyState({ emoji, title, body }: Props) {
  const colors = useColors();
  return (
    <View style={{ alignItems: "center", paddingVertical: 56, paddingHorizontal: 24, gap: 8 }}>
      <Text style={{ fontSize: 48 }}>{emoji}</Text>
      <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, textAlign: "center" }}>
        {title}
      </Text>
      {body ? (
        <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: "center" }}>{body}</Text>
      ) : null}
    </View>
  );
}
