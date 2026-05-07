import { Pressable, Text, View } from "react-native";
import type { Service } from "@/types";

type Props = {
  service: Service;
  onPress: () => void;
  selected?: boolean;
};

export function ServiceChip({ service, onPress, selected }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 rounded-2xl p-5 border ${
        selected
          ? "bg-accent-500 border-accent-500"
          : "bg-white border-ink-300"
      }`}
    >
      <View className="items-center" style={{ gap: 8 }}>
        <Text className="text-3xl">{service.emoji}</Text>
        <Text
          className={`text-base font-semibold ${
            selected ? "text-white" : "text-ink-900"
          }`}
        >
          {service.label}
        </Text>
      </View>
    </Pressable>
  );
}
