import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useColors } from "@/store/useThemeStore";

type Props = {
  label: string;
  value: string;
  emoji: string;
  delay?: number;
  trend?: string;
};

export function StatCard({ label, value, emoji, delay = 0, trend }: Props) {
  const colors = useColors();
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(350)}
      style={{
        flex: 1,
        backgroundColor: colors.bgElevated,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text, marginTop: 4 }}>
        {value}
      </Text>
      <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{label}</Text>
      {trend ? (
        <Text style={{ fontSize: 11, color: colors.success, marginTop: 4, fontWeight: "600" }}>
          {trend}
        </Text>
      ) : null}
    </Animated.View>
  );
}
