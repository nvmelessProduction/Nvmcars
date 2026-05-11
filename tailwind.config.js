/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
          500: "#64748B",
          300: "#CBD5E1",
          100: "#F1F5F9",
          50: "#F8FAFC",
        },
        accent: {
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
          soft: "rgba(6, 182, 212, 0.12)",
          softDark: "rgba(6, 182, 212, 0.18)",
        },
        success: "#10B981",
        successSoft: "rgba(16, 185, 129, 0.15)",
        danger: "#EF4444",
        dangerSoft: "rgba(239, 68, 68, 0.15)",
        warning: "#F59E0B",
        warningSoft: "rgba(245, 158, 11, 0.15)",
        dark: {
          900: "#020617",
          800: "#0F172A",
          700: "#1E293B",
          600: "#334155",
          400: "#64748B",
          200: "#94A3B8",
          100: "#CBD5E1",
        },
      },
    },
  },
  plugins: [],
};
