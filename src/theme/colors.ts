export type ThemeColors = {
  bg: string;
  bgElevated: string;
  bgHeader: string;
  border: string;
  text: string;
  textMuted: string;
  textInverse: string;
  /** Testo SOPRA bgHeader: sempre chiaro, indipendente dal mode. */
  onHeader: string;
  /** Testo secondario sopra bgHeader. */
  onHeaderMuted: string;
  /** Overlay scuro (per modal backdrop, image overlay). */
  scrim: string;
  accent: string;
  accentSoft: string;
  success: string;
  danger: string;
  warning: string;
};

// =============================================================
// Brand Nvmcars — "Performance / Automotive"
// Nero profondo + arancio racing. L'accento arancio è il colore
// guida di tutta l'app (pulsanti, link, badge, evidenziazioni).
// =============================================================

export const lightColors: ThemeColors = {
  bg: "#F4F4F5",
  bgElevated: "#FFFFFF",
  bgHeader: "#111114",
  border: "#E4E4E7",
  text: "#18181B",
  textMuted: "#71717A",
  textInverse: "#FFFFFF",
  onHeader: "#FFFFFF",
  onHeaderMuted: "#D4D4D8",
  scrim: "rgba(9, 9, 11, 0.55)",
  accent: "#EA580C",
  accentSoft: "rgba(234, 88, 12, 0.12)",
  success: "#16A34A",
  danger: "#DC2626",
  warning: "#D97706",
};

export const darkColors: ThemeColors = {
  bg: "#0A0A0B",
  bgElevated: "#161618",
  bgHeader: "#0A0A0B",
  border: "#27272A",
  text: "#FAFAFA",
  textMuted: "#A1A1AA",
  textInverse: "#0A0A0B",
  onHeader: "#FAFAFA",
  onHeaderMuted: "#A1A1AA",
  scrim: "rgba(0, 0, 0, 0.7)",
  accent: "#FF7A1A",
  accentSoft: "rgba(255, 122, 26, 0.16)",
  success: "#22C55E",
  danger: "#F87171",
  warning: "#FBBF24",
};
