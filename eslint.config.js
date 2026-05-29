// Flat config ESLint per l'app Expo. Estende la config ufficiale Expo e affina
// alcune regole per questa codebase.
const expoConfig = require("eslint-config-expo/flat");

module.exports = [
  ...expoConfig,
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "web/**",
      "supabase/functions/**",
      "scripts/**",
      "assets/**",
      "*.config.js",
    ],
  },
  {
    rules: {
      // Regole sperimentali del React Compiler (eslint-plugin-react-hooks v6):
      // troppo aggressive per una codebase RN classica che non usa il compiler.
      // Manteniamo invece rules-of-hooks ed exhaustive-deps, che colgono bug veri.
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "warn",
      // L'apostrofo nei testi italiani in JSX non è un problema reale.
      "react/no-unescaped-entities": "off",
      // La risoluzione dei moduli è già garantita da TypeScript; inoltre alcuni
      // moduli nativi (es. Stripe) sono dipendenze opzionali caricate a runtime.
      "import/no-unresolved": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
