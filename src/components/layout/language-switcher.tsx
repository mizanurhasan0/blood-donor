"use client";

import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, LOCALE_NAME, type Locale } from "@/lib/i18n/config";
import { useLocale, useT } from "@/lib/i18n/locale-context";
import { switchLocalePath } from "@/lib/i18n/paths";
import { cn } from "@/lib/utils/cn";

function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

/** Remembers the selected language while preserving the current page. */
export function LanguageSwitcher({
  className,
  variant = "compact",
}: {
  className?: string;
  variant?: "compact" | "segmented";
}) {
  const { lang } = useLocale();
  const t = useT();
  const router = useRouter();
  const next: Locale = lang === "bn" ? "en" : "bn";

  const handleSelectLanguage = (locale: Locale) => {
    if (locale === lang) return;
    rememberLocale(locale);
    const { pathname, search, hash } = window.location;
    router.push(switchLocalePath(`${pathname}${search}${hash}`, locale));
  };

  if (variant === "segmented") {
    return (
      <div
        role="group"
        aria-label={t.common.switchLanguage}
        className={cn("grid grid-cols-2 gap-1 rounded-2xl border border-outline/80 bg-background/60 p-1", className)}
      >
        {(["en", "bn"] as const).map((locale) => (
          <button
            key={locale}
            type="button"
            lang={locale}
            aria-pressed={lang === locale}
            onClick={() => handleSelectLanguage(locale)}
            className={cn(
              "flex min-h-11 items-center justify-center gap-2.5 rounded-xl border px-3 text-sm font-medium transition-colors",
              lang === locale
                ? "border-info/35 bg-info/12 text-white shadow-sm"
                : "border-transparent text-muted hover:bg-elevated hover:text-foreground",
            )}
          >
            <LanguageFlag locale={locale} />
            {LOCALE_NAME[locale]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <button
      type="button"
      lang={next}
      aria-label={t.common.switchLanguage}
      onClick={() => handleSelectLanguage(next)}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-pill border border-outline px-3.5 text-sm font-medium transition-colors hover:border-muted hover:bg-surface",
        className,
      )}
    >
      <LanguageFlag locale={next} />
      {LOCALE_NAME[next]}
    </button>
  );
}

function LanguageFlag({ locale }: { locale: Locale }) {
  return (
    <svg viewBox="0 0 60 40" className="h-4 w-6 shrink-0 overflow-hidden rounded-[3px] ring-1 ring-white/15" aria-hidden="true" focusable="false">
      {locale === "bn" ? (
        <>
          <path fill="#006a4e" d="M0 0h60v40H0z" />
          <circle cx="27" cy="20" r="12" fill="#f42a41" />
        </>
      ) : (
        <>
          <path fill="#012169" d="M0 0h60v40H0z" />
          <path d="m0 0 60 40m0-40L0 40" stroke="white" strokeWidth="8" />
          <path d="m0 0 60 40m0-40L0 40" stroke="#c8102e" strokeWidth="3" />
          <path d="M30 0v40M0 20h60" stroke="white" strokeWidth="13" />
          <path d="M30 0v40M0 20h60" stroke="#c8102e" strokeWidth="7" />
        </>
      )}
    </svg>
  );
}
