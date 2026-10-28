import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/lib/i18n/config";

/**
 * URLs without a language prefix go to the visitor's language: the choice saved
 * by the language switcher, otherwise Bangla. Query strings are kept.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isLocale(pathname.split("/")[1])) return NextResponse.next();

  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const lang = isLocale(saved) ? saved : DEFAULT_LOCALE;
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${lang}` : `/${lang}${pathname}`;

  const response = NextResponse.redirect(url);
  // The redirect depends on the cookie, so shared caches must not reuse it across visitors.
  response.headers.set("Vary", "Cookie");
  return response;
}

export const config = {
  // Skip API routes, build assets, and files served from the root (icons, metadata, robots, sitemap).
  matcher: ["/((?!api/|_next/|opengraph-image|apple-icon|icon|robots|sitemap|manifest|.*\\..*).*)"],
};
