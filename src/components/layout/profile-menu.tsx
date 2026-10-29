"use client";

import { ChevronDown, Shield } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { signOutAction } from "@/features/auth/actions";
import { LocalizedLink } from "@/lib/i18n/localized-link";
import { useLocale, useT } from "@/lib/i18n/locale-context";
import { localizedPath } from "@/lib/i18n/paths";
import { cn } from "@/lib/utils/cn";
import { LanguageSwitcher } from "./language-switcher";

export type ProfileRole = "admin" | "donor" | "member";

const ROLE_TONE: Record<ProfileRole, BadgeTone> = { admin: "solid", donor: "success", member: "neutral" };

const itemClasses =
  "flex min-h-11 w-full items-center gap-3 rounded-button px-3 text-sm font-medium text-foreground transition-colors hover:bg-elevated";

const divider = <hr className="my-1 border-outline" />;

interface ProfileMenuProps {
  name: string;
  avatar: string | null;
  role: ProfileRole;
}

/**
 * Signed-in profile button. Opens a panel with the name, role, account links,
 * the language switch and sign-out. Closes on Escape, outside click, or leaving it.
 */
export function ProfileMenu({ name, avatar, role }: ProfileMenuProps) {
  const t = useT();
  const { lang } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const roleLabel =
    role === "admin" ? t.nav.roleAdmin : role === "donor" ? t.nav.roleDonor : t.nav.roleMember;

  return (
    <div
      ref={rootRef}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 items-center gap-2.5 rounded-pill border border-outline py-1 pr-3 pl-1 text-sm font-medium transition-colors hover:border-muted"
      >
        <Avatar name={name} src={avatar} size={34} />
        <span className="max-w-32 truncate">{name.split(" ")[0]}</span>
        <ChevronDown
          className={cn("size-4 text-muted transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
        <span className="sr-only">{t.nav.accountMenu}</span>
      </button>

      {open && (
        <div
          id={panelId}
          onClick={(event) => {
            // Links and the language switch close the panel. Submit buttons (sign out) must not:
            // closing would remove the button from the page before its form is submitted.
            if ((event.target as HTMLElement).closest("a, button:not([type='submit'])")) setOpen(false);
          }}
          className="absolute top-full right-0 z-50 mt-2 w-72 animate-slide-in rounded-card border border-outline bg-surface p-2 shadow-popover"
        >
          <div className="flex items-center gap-3 p-2">
            <Avatar name={name} src={avatar} size={44} />
            <div className="flex min-w-0 flex-col items-start gap-1.5">
              <p className="max-w-full truncate font-semibold">{name}</p>
              <Badge tone={ROLE_TONE[role]}>{roleLabel}</Badge>
            </div>
          </div>
          {divider}
          <LocalizedLink href="/account" className={itemClasses}>
            {t.nav.account}
          </LocalizedLink>
          {role === "admin" && (
            <LocalizedLink href="/admin/requests" className={itemClasses}>
              <Shield className="size-4 text-muted" aria-hidden="true" />
              {t.nav.moderation}
            </LocalizedLink>
          )}
          {divider}
          <div className="p-1">
            <LanguageSwitcher className="w-full justify-center" />
          </div>
          {divider}
          <form action={signOutAction}>
            <input type="hidden" name="redirectTo" value={localizedPath(lang, "/")} />
            <button type="submit" className={cn(itemClasses, "text-muted")}>
              {t.nav.signOut}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
