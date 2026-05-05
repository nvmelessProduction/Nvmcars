/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
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
        },
        accent: {
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
        },
        success: "#10B981",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
