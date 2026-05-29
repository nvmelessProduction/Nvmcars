// Wrapper sicuro per expo-haptics: se la dep non è installata, è no-op.
let haptics: any = null;
try {
  haptics = require("expo-haptics");
} catch {
  haptics = null;
}

export function hapticLight() {
  haptics?.impactAsync?.(haptics?.ImpactFeedbackStyle?.Light).catch(() => undefined);
}

export function hapticMedium() {
  haptics?.impactAsync?.(haptics?.ImpactFeedbackStyle?.Medium).catch(() => undefined);
}

export function hapticHeavy() {
  haptics?.impactAsync?.(haptics?.ImpactFeedbackStyle?.Heavy).catch(() => undefined);
}

export function hapticSuccess() {
  haptics?.notificationAsync?.(haptics?.NotificationFeedbackType?.Success).catch(() => undefined);
}

export function hapticWarning() {
  haptics?.notificationAsync?.(haptics?.NotificationFeedbackType?.Warning).catch(() => undefined);
}

export function hapticError() {
  haptics?.notificationAsync?.(haptics?.NotificationFeedbackType?.Error).catch(() => undefined);
}

export function hapticSelection() {
  haptics?.selectionAsync?.().catch(() => undefined);
}
