import { Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import type { Service } from "@/types";
import { useColors } from "@/store/useThemeStore";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  service: Service;
  onPress: () => void;
  selected?: boolean;
};

export function ServiceChip({ service, onPress, selected }: Props) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.96, { stiffness: 250, damping: 18 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { stiffness: 250, damping: 18 });
      }}
      style={[
        {
          flex: 1,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          backgroundColor: selected ? colors.accent : colors.bgElevated,
          borderColor: selected ? colors.accent : colors.border,
        },
        animatedStyle,
      ]}
    >
      <View style={{ alignItems: "center", gap: 8 }}>
        <Text style={{ fontSize: 28 }}>{service.emoji}</Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: selected ? "#FFFFFF" : colors.text,
            textAlign: "center",
          }}
        >
          {service.label}
        </Text>
      </View>
    </AnimatedPressable>
  );
}
