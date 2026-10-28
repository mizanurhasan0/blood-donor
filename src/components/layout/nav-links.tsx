"use client";

import { usePathname } from "next/navigation";
import { LocalizedLink } from "@/lib/i18n/localized-link";
import { useT } from "@/lib/i18n/locale-context";
import { startsWithLocale } from "@/lib/i18n/paths";
import { cn } from "@/lib/utils/cn";

export interface NavItem {
  href: string;
  label: string;
}

/** The main site sections, with labels in the visitor's language. Hrefs are unprefixed. */
export function useNavItems(): NavItem[] {
  const t = useT();
  return [
    { href: "/", label: t.nav.home },
    { href: "/requests", label: t.nav.bloodRequests },
    { href: "/become-donor", label: t.nav.becomeDonor },
    { href: "/how-it-works", label: t.nav.howItWorks },
  ];
}

/** "/bn/requests/3" → "/requests/3", so active checks ignore the language prefix. */
export function unprefixedPath(pathname: string): string {
  if (!startsWithLocale(pathname)) return pathname;
  return pathname.slice(3) || "/";
}

export function isActive(pathname: string, href: string) {
  const path = unprefixedPath(pathname);
  return href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
}

/** Desktop navigation with an animated underline on the active route. */
export function NavLinks() {
  const pathname = usePathname();
  return <NavList pathname={pathname} />;
}

export function NavList({ pathname }: { pathname: string | null }) {
  const items = useNavItems();
  return (
    <ul className="flex items-center gap-1">
      {items.map((link) => {
        const active = pathname !== null && isActive(pathname, link.href);
        return (
          <li key={link.href}>
            <LocalizedLink
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative inline-flex min-h-11 items-center rounded-button px-3.5 text-[0.95rem] font-medium transition-colors",
                active ? "text-brand" : "text-foreground/85 hover:text-foreground",
              )}
            >
              {link.label}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-3.5 bottom-1.5 h-0.5 origin-left rounded-full bg-brand transition-transform",
                  active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50",
                )}
              />
            </LocalizedLink>
          </li>
        );
      })}
    </ul>
  );
}
