"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, LOCALE_NAME, type Locale } from "@/lib/i18n/config";
import { useLocale, useT } from "@/lib/i18n/locale-context";
import { switchLocalePath } from "@/lib/i18n/paths";
import { cn } from "@/lib/utils/cn";

/** Shows the other language's name. Choosing it remembers the choice and keeps the same page. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang } = useLocale();
  const t = useT();
  const router = useRouter();
  const next: Locale = lang === "bn" ? "en" : "bn";

  return (
    <button
      type="button"
      lang={next}
      aria-label={t.common.switchLanguage}
      onClick={() => {
        document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
        const { pathname, search, hash } = window.location;
        router.push(switchLocalePath(`${pathname}${search}${hash}`, next));
      }}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-pill border border-outline px-3.5 text-sm font-medium transition-colors hover:border-muted hover:bg-surface",
        className,
      )}
    >
      <Languages className="size-4 text-muted" aria-hidden="true" />
      {LOCALE_NAME[next]}
    </button>
  );
}
