import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ScrollViewProps,
  type ViewStyle,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  /** Offset extra in pixel da aggiungere all'altezza dell'header. */
  extraOffset?: number;
};

/**
 * Wrapper KeyboardAvoidingView. Usalo SOLO se hai contenuto fisso (no ScrollView).
 * Per form con ScrollView, usa direttamente <KeyboardAwareScrollView> qui sotto
 * (è più affidabile).
 */
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

/**
 * ScrollView keyboard-aware. Spinge automaticamente i TextInput sopra la
 * tastiera (su iOS via automaticallyAdjustKeyboardInsets, su Android via
 * KeyboardAvoidingView wrapper).
 *
 * Usa questa al posto di <ScrollView> ogni volta che hai un form.
 */
type KASVProps = ScrollViewProps & {
  children: ReactNode;
  /** Offset extra in pixel da aggiungere all'altezza dell'header (default 0). */
  extraOffset?: number;
};

export function KeyboardAwareScrollView({
  children,
  extraOffset = 0,
  contentContainerStyle,
  style,
  ...rest
}: KASVProps) {
  const headerHeight = useHeaderHeight();

  // Su iOS la ScrollView nativa ha automaticallyAdjustKeyboardInsets
  // (iOS 14+, RN 0.73+) che gestisce TUTTO da sola. Niente wrapper KAV.
  if (Platform.OS === "ios") {
    return (
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={contentContainerStyle}
        style={[{ flex: 1 }, style]}
        {...rest}
      >
        {children}
      </ScrollView>
    );
  }

  // Android: wrapper KAV con behavior=height
  return (
    <KeyboardAvoidingView
      behavior="height"
      keyboardVerticalOffset={headerHeight + extraOffset}
      style={{ flex: 1 }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={contentContainerStyle}
        style={[{ flex: 1 }, style]}
        {...rest}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
