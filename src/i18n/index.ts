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

/** Legge la locale corrente dallo store (non-reattivo, sicuro fuori dai componenti). */
export function getLocaleStr(): "it-IT" | "en-GB" {
  const locale = useLanguageStore.getState().locale;
  return locale === "en" ? "en-GB" : "it-IT";
}

/** Hook reattivo per la locale BCP-47 (da usare dentro componenti React). */
export function useLocaleStr(): "it-IT" | "en-GB" {
  const locale = useLanguageStore((s) => s.locale);
  return locale === "en" ? "en-GB" : "it-IT";
}

export type { Translations } from "./it";
