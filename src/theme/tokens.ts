// Design tokens centralizzati per coerenza visiva.
// Quando vedi un numero hardcoded che dovrebbe essere qui, sostituiscilo.

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 18,
  pill: 999,
} as const;

export const typography = {
  // Display = grandi titoli pagina
  displayLarge: { fontSize: 28, fontWeight: "800" as const, lineHeight: 34 },
  displayMedium: { fontSize: 24, fontWeight: "800" as const, lineHeight: 30 },
  displaySmall: { fontSize: 20, fontWeight: "800" as const, lineHeight: 26 },

  // Title = titoli sezione, card
  titleLarge: { fontSize: 18, fontWeight: "700" as const, lineHeight: 24 },
  titleMedium: { fontSize: 16, fontWeight: "700" as const, lineHeight: 22 },
  titleSmall: { fontSize: 15, fontWeight: "700" as const, lineHeight: 20 },

  // Body = testo standard
  bodyLarge: { fontSize: 15, fontWeight: "500" as const, lineHeight: 22 },
  bodyMedium: { fontSize: 14, fontWeight: "500" as const, lineHeight: 20 },
  bodySmall: { fontSize: 13, fontWeight: "500" as const, lineHeight: 18 },

  // Label = etichette piccole, all-caps
  labelLarge: {
    fontSize: 12,
    fontWeight: "700" as const,
    letterSpacing: 0.8,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 0.6,
  },

  // Caption = testo molto piccolo (timestamp, hint)
  caption: { fontSize: 12, fontWeight: "500" as const, lineHeight: 16 },

  // Numeric = prezzi, statistiche
  numericLarge: { fontSize: 36, fontWeight: "800" as const, lineHeight: 42 },
  numericMedium: { fontSize: 22, fontWeight: "800" as const, lineHeight: 28 },
} as const;

export const hitSlop = {
  small: { top: 8, bottom: 8, left: 8, right: 8 },
  medium: { top: 12, bottom: 12, left: 12, right: 12 },
  large: { top: 16, bottom: 16, left: 16, right: 16 },
} as const;

export const minTouchTarget = 44;

// Helper per opacità su colore hex
export function withOpacity(hex: string, opacity: number): string {
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
