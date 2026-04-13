import { create } from "zustand";

export const SUPPORTED_LOCALES = ["fr", "en", "es", "pt", "de"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_LABELS: Record<Locale, { flag: string; label: string }> = {
  fr: { flag: "🇫🇷", label: "Français" },
  en: { flag: "🇬🇧", label: "English" },
  es: { flag: "🇪🇸", label: "Español" },
  pt: { flag: "🇧🇷", label: "Português" },
  de: { flag: "🇩🇪", label: "Deutsch" }
};

export { LOCALE_LABELS };

type Messages = Record<string, string>;

const messageCache = new Map<Locale, Messages>();

async function loadMessages(locale: Locale): Promise<Messages> {
  const cached = messageCache.get(locale);
  if (cached) return cached;

  const modules: Record<string, () => Promise<{ default: Messages }>> = {
    fr: () => import("./locales/fr.json"),
    en: () => import("./locales/en.json"),
    es: () => import("./locales/es.json"),
    pt: () => import("./locales/pt.json"),
    de: () => import("./locales/de.json")
  };

  const mod = await modules[locale]();
  const messages = mod.default;
  messageCache.set(locale, messages);
  return messages;
}

function detectLocale(): Locale {
  const stored = localStorage.getItem("inkognito-locale");
  if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) {
    return stored as Locale;
  }
  const browserLang = navigator.language.split("-")[0];
  if (SUPPORTED_LOCALES.includes(browserLang as Locale)) {
    return browserLang as Locale;
  }
  return "en";
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
  }
  return result;
}

interface I18nState {
  locale: Locale;
  messages: Messages;
  ready: boolean;
  setLocale: (locale: Locale) => Promise<void>;
  init: () => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

// Load French synchronously as fallback (it's small)
import frMessages from "./locales/fr.json";
messageCache.set("fr", frMessages);

export const useI18n = create<I18nState>((set, get) => ({
  locale: "fr",
  messages: frMessages,
  ready: false,

  init: async () => {
    if (get().ready) return;
    const locale = detectLocale();
    const messages = await loadMessages(locale);
    set({ locale, messages, ready: true });
  },

  setLocale: async (locale: Locale) => {
    const messages = await loadMessages(locale);
    localStorage.setItem("inkognito-locale", locale);
    set({ locale, messages });
  },

  t: (key: string, params?: Record<string, string | number>) => {
    const { messages } = get();
    const template = messages[key];
    if (!template) return key;
    return interpolate(template, params);
  }
}));

/** Shorthand hook — just returns the t function and locale */
export function useT() {
  const t = useI18n((s) => s.t);
  const locale = useI18n((s) => s.locale);
  return { t, locale };
}
