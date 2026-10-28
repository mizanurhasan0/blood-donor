"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop navigation with an animated underline on the active route. */
export function NavLinks() {
  const pathname = usePathname();
  return <NavList pathname={pathname} />;
}

export function NavList({ pathname }: { pathname: string | null }) {
  return (
    <ul className="flex items-center gap-1">
      {NAV_LINKS.map((link) => {
        const active = pathname !== null && isActive(pathname, link.href);
        return (
          <li key={link.href}>
            <Link
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
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
