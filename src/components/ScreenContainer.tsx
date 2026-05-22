import { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "@/store/useThemeStore";

type Props = {
  children: ReactNode;
  dark?: boolean;
  edges?: ("top" | "bottom" | "left" | "right")[];
};

export function ScreenContainer({ children, dark, edges }: Props) {
  const colors = useColors();
  const bg = dark ? colors.bgHeader : colors.bg;
  return (
    <SafeAreaView edges={edges ?? ["top", "bottom"]} style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
}
