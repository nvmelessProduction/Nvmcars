import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, type ViewStyle } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  extraOffset?: number;
};

export function KAV({ children, style, extraOffset = 0 }: Props) {
  const headerHeight = useHeaderHeight();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight + extraOffset : extraOffset}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
