import { Text, TextInput, TextInputProps, View } from "react-native";
import { useColors } from "@/store/useThemeStore";

type Props = TextInputProps & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({ label, hint, error, style, ...rest }: Props) {
  const colors = useColors();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textMuted }}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[
          {
            backgroundColor: colors.bgElevated,
            borderColor: error ? colors.danger : colors.border,
            borderWidth: 1,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 16,
            color: colors.text,
          },
          style,
        ]}
        {...rest}
      />
      {hint && !error ? (
        <Text style={{ fontSize: 12, color: colors.textMuted }}>{hint}</Text>
      ) : null}
      {error ? <Text style={{ fontSize: 12, color: colors.danger }}>{error}</Text> : null}
    </View>
  );
}
