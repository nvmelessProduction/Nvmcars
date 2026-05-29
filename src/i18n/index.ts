import { it } from "./it";
import { en } from "./en";
import { useLanguageStore } from "@/store/useLanguageStore";

export type Locale = "it" | "en";

const dictionaries = { it, en };

export function useT() {
  const locale = useLanguageStore((s) => s.locale);
  return dictionaries[locale];
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export type { Translations } from "./it";
