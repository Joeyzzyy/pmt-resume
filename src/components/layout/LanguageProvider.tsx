"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

export type Locale = "zh" | "en";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const STORAGE_KEY = "pmt-locale";
const listeners = new Set<() => void>();

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "zh";
  return window.localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "zh";
}

let currentLocale = getStoredLocale();

if (typeof window !== "undefined") {
  document.documentElement.lang = currentLocale === "zh" ? "zh-CN" : "en";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Locale {
  return currentLocale;
}

function getServerSnapshot(): Locale {
  return "zh";
}

function updateLocale(locale: Locale) {
  currentLocale = locale;
  window.localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  listeners.forEach((listener) => listener());
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const value = useMemo(() => ({ locale, setLocale: updateLocale }), [locale]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
