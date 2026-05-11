import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useColors } from "@/store/useThemeStore";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
};

export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  loading,
  disabled,
  icon,
}: Props) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const isDisabled = disabled || loading;

  const bgByVariant = {
    primary: colors.accent,
    secondary: colors.bgHeader,
    ghost: "transparent",
    danger: colors.danger,
  }[variant];

  const textColor =
    variant === "ghost" ? colors.text : "#FFFFFF";

  const borderColor =
    variant === "ghost" ? colors.border : "transparent";

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => {
        scale.value = withSpring(0.97, { stiffness: 250, damping: 18 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { stiffness: 250, damping: 18 });
      }}
      style={[
        {
          backgroundColor: bgByVariant,
          borderColor,
          borderWidth: variant === "ghost" ? 1 : 0,
          borderRadius: 16,
          paddingVertical: 14,
          paddingHorizontal: 20,
          opacity: isDisabled ? 0.5 : 1,
        },
        animatedStyle,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <>
            {icon ? <Text style={{ fontSize: 18 }}>{icon}</Text> : null}
            <Text style={{ color: textColor, fontSize: 16, fontWeight: "600" }}>{label}</Text>
          </>
        )}
      </View>
    </AnimatedPressable>
  );
}
