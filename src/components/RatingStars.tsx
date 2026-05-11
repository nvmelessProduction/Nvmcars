import { Pressable, Text, View } from "react-native";

type Props = {
  value: number;
  size?: number;
  onChange?: (value: number) => void;
};

export function RatingStars({ value, size = 18, onChange }: Props) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {stars.map((s) => {
        const filled = s <= Math.round(value);
        const content = (
          <Text style={{ fontSize: size, color: filled ? "#F59E0B" : "#CBD5E1" }}>
            {filled ? "★" : "☆"}
          </Text>
        );
        if (!onChange) return <View key={s}>{content}</View>;
        return (
          <Pressable key={s} onPress={() => onChange(s)} hitSlop={6}>
            {content}
          </Pressable>
        );
      })}
    </View>
  );
}
