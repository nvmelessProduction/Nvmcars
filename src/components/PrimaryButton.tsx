import { ActivityIndicator, Pressable, Text, View } from "react-native";

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
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
  const isDisabled = disabled || loading;

  const styles = {
    primary: "bg-accent-500 active:bg-accent-600",
    secondary: "bg-ink-800 active:bg-ink-700",
    ghost: "bg-transparent border border-ink-300 active:bg-ink-100",
  }[variant];

  const textStyles = {
    primary: "text-white",
    secondary: "text-white",
    ghost: "text-ink-900",
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`rounded-2xl py-4 px-6 ${styles} ${isDisabled ? "opacity-50" : ""}`}
    >
      <View className="flex-row items-center justify-center gap-2">
        {loading ? (
          <ActivityIndicator color={variant === "ghost" ? "#0F172A" : "#FFFFFF"} />
        ) : (
          <>
            {icon ? <Text className="text-lg">{icon}</Text> : null}
            <Text className={`text-base font-semibold ${textStyles}`}>{label}</Text>
          </>
        )}
      </View>
    </Pressable>
  );
}
