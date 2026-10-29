"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { LocalizedLink } from "@/lib/i18n/localized-link";
import { useT } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils/cn";
import { LanguageSwitcher } from "./language-switcher";
import { isActive, useNavItems } from "./nav-links";

/**
 * Compact disclosure menu for small screens. `children` is the server-rendered
 * account area (sign-in buttons or the signed-in user's links).
 */
export function MobileMenu({ children }: { children: ReactNode }) {
  const t = useT();
  const items = useNavItems();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);

  // Close after navigating (adjusting state during render, not in an effect).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="grid size-11 place-items-center rounded-button text-foreground transition-colors hover:bg-surface"
      >
        {open ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
        <span className="sr-only">{open ? t.common.closeMenu : t.common.openMenu}</span>
      </button>
      <div
        id="mobile-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-outline bg-background shadow-popover"
      >
        <nav
          aria-label={t.nav.mobileNav}
          className="mx-auto flex max-w-7xl animate-slide-in flex-col gap-1 px-4 py-4"
        >
          {items.map((link) => {
            const active = pathname !== null && isActive(pathname, link.href);
            return (
              <LocalizedLink
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex min-h-12 items-center rounded-button px-4 text-base font-medium transition-colors",
                  active ? "bg-brand/10 text-brand-bright" : "text-foreground hover:bg-surface",
                )}
              >
                {link.label}
              </LocalizedLink>
            );
          })}
          <div className="mt-3 flex flex-col gap-3 border-t border-outline pt-4">
            <LanguageSwitcher className="self-start" />
            {children}
          </div>
        </nav>
      </div>
    </div>
  );
}
