import { useEffect, useState, type ReactNode } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ScrollViewProps,
  type ViewStyle,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";

/** Altezza corrente della tastiera (0 se chiusa). Solo per Android. */
function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) =>
      setHeight(e.endCoordinates?.height ?? 0)
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
  return height;
}

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  /** Offset extra in pixel da aggiungere all'altezza dell'header. */
  extraOffset?: number;
};

/**
 * Wrapper per contenuto a layout FISSO con un input ancorato in basso
 * (es. la barra di scrittura della chat). Usa "padding" su entrambe le
 * piattaforme: su iOS con l'offset dell'header, su Android l'OS ridimensiona
 * già la finestra (adjustResize) quindi non serve offset.
 */
export function KAV({ children, style, extraOffset = 0 }: Props) {
  const headerHeight = useHeaderHeight();
  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={
        Platform.OS === "ios" ? headerHeight + extraOffset : extraOffset
      }
      style={[{ flex: 1 }, style]}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

/**
 * ScrollView keyboard-aware per i FORM.
 * - iOS: `automaticallyAdjustKeyboardInsets` gestisce tutto da solo.
 * - Android: aggiunge in fondo uno spazio pari all'altezza della tastiera, così
 *   ogni campo (anche l'ultimo) può essere scrollato sopra la tastiera.
 * In entrambi i casi: tocco fuori dai campi chiude la tastiera, e i tap sui
 * pulsanti restano attivi (keyboardShouldPersistTaps="handled").
 */
type KASVProps = ScrollViewProps & {
  children: ReactNode;
  /** Offset extra in pixel (default 0). */
  extraOffset?: number;
};

export function KeyboardAwareScrollView({
  children,
  extraOffset = 0,
  contentContainerStyle,
  style,
  ...rest
}: KASVProps) {
  const keyboardHeight = useKeyboardHeight();

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

  // Android: spazio extra in fondo = altezza tastiera (+ offset) quando aperta.
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={[
        contentContainerStyle,
        keyboardHeight > 0 ? { paddingBottom: keyboardHeight + extraOffset } : null,
      ]}
      style={[{ flex: 1 }, style]}
      {...rest}
    >
      {children}
    </ScrollView>
  );
}
