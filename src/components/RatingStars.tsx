import { Pressable, Text, View } from "react-native";
import { useColors } from "@/store/useThemeStore";
import { hitSlop } from "@/theme/tokens";

type Props = {
  value: number;
  size?: number;
  onChange?: (value: number) => void;
};

export function RatingStars({ value, size = 18, onChange }: Props) {
  const colors = useColors();
  const stars = [1, 2, 3, 4, 5];
  return (
    <View
      style={{ flexDirection: "row", gap: 2 }}
      accessibilityRole={onChange ? "adjustable" : "image"}
      accessibilityLabel={`${value} ${value === 1 ? "stella" : "stelle"} su 5`}
    >
      {stars.map((s) => {
        const filled = s <= Math.round(value);
        const content = (
          <Text style={{ fontSize: size, color: filled ? colors.warning : colors.border }}>
            {filled ? "★" : "☆"}
          </Text>
        );
        if (!onChange) return <View key={s}>{content}</View>;
        return (
          <Pressable
            key={s}
            onPress={() => onChange(s)}
            hitSlop={hitSlop.medium}
            accessibilityRole="button"
            accessibilityLabel={`Imposta ${s} stelle`}
          >
            {content}
          </Pressable>
        );
      })}
    </View>
  );
}
