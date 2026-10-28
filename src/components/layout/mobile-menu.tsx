"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { NAV_LINKS } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

/**
 * Compact disclosure menu for small screens. `children` is the server-rendered
 * account area (sign-in buttons or the signed-in user's links).
 */
export function MobileMenu({ children }: { children: ReactNode }) {
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
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>
      <div
        id="mobile-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-outline bg-background/98 shadow-popover"
      >
        <nav aria-label="Mobile" className="mx-auto flex max-w-7xl animate-slide-in flex-col gap-1 px-4 py-4">
          {NAV_LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
            return (
              <Link
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
              </Link>
            );
          })}
          <div className="mt-3 border-t border-outline pt-4">{children}</div>
        </nav>
      </div>
    </div>
  );
}
