import type { WordPair } from "../protocol.js";
import { BASE_WORD_PAIRS, WORD_CATEGORIES } from "../words.js";
import { EN_WORD_PAIRS, EN_WORD_CATEGORIES } from "./en.js";
import { ES_WORD_PAIRS, ES_WORD_CATEGORIES } from "./es.js";
import { PT_WORD_PAIRS, PT_WORD_CATEGORIES } from "./pt.js";
import { DE_WORD_PAIRS, DE_WORD_CATEGORIES } from "./de.js";

export type SupportedLanguage = "fr" | "en" | "es" | "pt" | "de";

const WORD_PAIRS_BY_LANG: Record<SupportedLanguage, WordPair[]> = {
  fr: BASE_WORD_PAIRS,
  en: EN_WORD_PAIRS,
  es: ES_WORD_PAIRS,
  pt: PT_WORD_PAIRS,
  de: DE_WORD_PAIRS
};

const CATEGORIES_BY_LANG: Record<SupportedLanguage, string[]> = {
  fr: WORD_CATEGORIES,
  en: EN_WORD_CATEGORIES,
  es: ES_WORD_CATEGORIES,
  pt: PT_WORD_CATEGORIES,
  de: DE_WORD_CATEGORIES
};

/** "All" keyword per language — first category is always "all" */
const ALL_KEYWORD: Record<SupportedLanguage, string> = {
  fr: "Tout",
  en: "All",
  es: "Todo",
  pt: "Tudo",
  de: "Alle"
};

export function getWordPairsForLang(lang: SupportedLanguage): WordPair[] {
  return WORD_PAIRS_BY_LANG[lang] ?? WORD_PAIRS_BY_LANG.en;
}

export function getCategoriesForLang(lang: SupportedLanguage): string[] {
  return CATEGORIES_BY_LANG[lang] ?? CATEGORIES_BY_LANG.en;
}

export function getAllKeywordForLang(lang: SupportedLanguage): string {
  return ALL_KEYWORD[lang] ?? "All";
}
