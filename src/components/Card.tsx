import { ReactNode } from "react";
import { View, ViewStyle } from "react-native";
import { useColors } from "@/store/useThemeStore";

type Props = {
  children: ReactNode;
  padding?: number;
  style?: ViewStyle;
};

export function Card({ children, padding = 16, style }: Props) {
  const colors = useColors();
  return (
    <View
      style={[
        {
          backgroundColor: colors.bgElevated,
          borderRadius: 16,
          padding,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
