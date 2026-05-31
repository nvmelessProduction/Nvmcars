import { ReactNode } from "react";
import { Keyboard, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "@/store/useThemeStore";

type Props = {
  children: ReactNode;
  dark?: boolean;
  edges?: ("top" | "bottom" | "left" | "right")[];
  /** Disabilita il "tocca fuori per chiudere la tastiera" (raro). */
  noDismissKeyboard?: boolean;
};

export function ScreenContainer({ children, dark, edges, noDismissKeyboard }: Props) {
  const colors = useColors();
  const bg = dark ? colors.bgHeader : colors.bg;
  return (
    <SafeAreaView edges={edges ?? ["top", "bottom"]} style={{ flex: 1, backgroundColor: bg }}>
      {noDismissKeyboard ? (
        <View style={{ flex: 1 }}>{children}</View>
      ) : (
        // Tocco su un'area vuota (fuori dai campi/scroll) → chiude la tastiera.
        // Gli scroll interni hanno keyboardShouldPersistTaps="handled", quindi i
        // tap sui pulsanti continuano a funzionare normalmente.
        <Pressable
          style={{ flex: 1 }}
          onPress={Keyboard.dismiss}
          accessible={false}
          android_disableSound
        >
          {children}
        </Pressable>
      )}
    </SafeAreaView>
  );
}
