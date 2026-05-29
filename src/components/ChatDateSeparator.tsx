import { Text, View } from "react-native";
import { useColors } from "@/store/useThemeStore";

/** Etichetta centrata che separa i messaggi per giorno (Oggi / Ieri / data). */
export function ChatDateSeparator({ label }: { label: string }) {
  const colors = useColors();
  return (
    <View style={{ alignItems: "center", marginVertical: 6 }}>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 11,
          fontWeight: "700",
          backgroundColor: colors.bgElevated,
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {label}
      </Text>
    </View>
  );
}
