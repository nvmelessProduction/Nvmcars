import { useState } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";
import { useColors } from "@/store/useThemeStore";

type Props = TextInputProps & {
  label: string;
  hint?: string;
  error?: string;
  /** Marca campo come obbligatorio (mostra asterisco). */
  required?: boolean;
};

export function TextField({ label, hint, error, required, style, onFocus, onBlur, ...rest }: Props) {
  const colors = useColors();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.danger : focused ? colors.accent : colors.border;
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textMuted }}>
        {label}
        {required ? <Text style={{ color: colors.danger }}> *</Text> : null}
      </Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={label}
        accessibilityHint={hint}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          {
            backgroundColor: colors.bgElevated,
            borderColor,
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
      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          style={{ fontSize: 12, color: colors.danger, fontWeight: "600" }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
