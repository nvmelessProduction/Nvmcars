import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Locale = "it" | "en";

type LanguageState = {
  locale: Locale;
  setLocale: (l: Locale) => void;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      locale: "it",
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "nvmcars-locale",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
