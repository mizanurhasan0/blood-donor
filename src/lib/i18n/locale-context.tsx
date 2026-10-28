"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "./config";
import type { ClientDictionary } from "./messages";

interface LocaleValue {
  lang: Locale;
  t: ClientDictionary;
}

const LocaleContext = createContext<LocaleValue | null>(null);

/** Provided once by the [lang] layout so client components know the language and its strings. */
export function LocaleProvider({ lang, t, children }: LocaleValue & { children: ReactNode }) {
  return <LocaleContext value={{ lang, t }}>{children}</LocaleContext>;
}

export function useLocale(): LocaleValue {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used inside the [lang] layout");
  return value;
}

export function useT(): ClientDictionary {
  return useLocale().t;
}
