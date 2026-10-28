import "server-only";
import { notFound } from "next/navigation";
import { lang as rootLang } from "next/root-params";
import { isLocale, type Locale } from "./config";
import { messages, type Dictionary } from "./messages";

/** The language of the current route, read from the [lang] segment. Unknown languages 404. */
export async function getLocale(): Promise<Locale> {
  const value = await rootLang();
  if (!isLocale(value)) notFound();
  return value;
}

/** All strings for the current language, for Server Components. */
export async function getDictionary(): Promise<Dictionary> {
  return messages[await getLocale()];
}
