export type ThemeColors = {
  bg: string;
  bgElevated: string;
  bgHeader: string;
  border: string;
  text: string;
  textMuted: string;
  textInverse: string;
  accent: string;
  accentSoft: string;
  success: string;
  danger: string;
  warning: string;
};

export const lightColors: ThemeColors = {
  bg: "#F1F5F9",
  bgElevated: "#FFFFFF",
  bgHeader: "#0F172A",
  border: "#E2E8F0",
  text: "#0F172A",
  textMuted: "#64748B",
  textInverse: "#FFFFFF",
  accent: "#06B6D4",
  accentSoft: "rgba(6, 182, 212, 0.12)",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
};

export const darkColors: ThemeColors = {
  bg: "#020617",
  bgElevated: "#0F172A",
  bgHeader: "#020617",
  border: "#1E293B",
  text: "#F1F5F9",
  textMuted: "#94A3B8",
  textInverse: "#0F172A",
  accent: "#22D3EE",
  accentSoft: "rgba(34, 211, 238, 0.18)",
  success: "#34D399",
  danger: "#F87171",
  warning: "#FBBF24",
};
