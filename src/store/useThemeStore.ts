import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { darkColors, lightColors, type ThemeColors } from "@/theme/colors";

export type ThemeMode = "auto" | "light" | "dark";

type ThemeState = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "auto",
      setMode: (mode) => set({ mode }),
    }),
    {
      name: "nvmcars-theme",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function useIsDark(): boolean {
  const system = useColorScheme();
  const mode = useThemeStore((s) => s.mode);
  if (mode === "dark") return true;
  if (mode === "light") return false;
  return system === "dark";
}

export function useColors(): ThemeColors {
  return useIsDark() ? darkColors : lightColors;
}
