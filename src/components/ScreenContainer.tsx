import { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: ReactNode;
  dark?: boolean;
};

export function ScreenContainer({ children, dark }: Props) {
  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className={`flex-1 ${dark ? "bg-ink-900" : "bg-ink-100"}`}
    >
      <View className="flex-1">{children}</View>
    </SafeAreaView>
  );
}
