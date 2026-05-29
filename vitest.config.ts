import { defineConfig } from "vitest/config";
import path from "node:path";

// Test runner per la logica di business pura (pricing, validazioni, geo, stati
// prenotazione). Non carica il runtime React Native: gira veloce su Node.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globals: true,
  },
});
