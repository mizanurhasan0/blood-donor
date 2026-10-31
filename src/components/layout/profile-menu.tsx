"use client";

import { ChevronDown, ChevronRight, Languages, LogOut, Shield, UserRound } from "lucide-react";
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

const divider = <hr className="my-2 border-outline/70" />;

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
        className={cn(
          "flex min-h-11 items-center gap-2.5 rounded-pill border bg-surface/60 py-1 pr-3.5 pl-1 text-sm font-medium transition-colors hover:border-info/50 hover:bg-elevated",
          open ? "border-info/50 bg-elevated" : "border-outline",
        )}
      >
        <Avatar name={name} src={avatar} size={34} />
        <span className="max-w-36 truncate">{name}</span>
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
            // Keep language controls mounted during selection and the sign-out form mounted during submission.
            if ((event.target as HTMLElement).closest("a")) setOpen(false);
          }}
          className="absolute top-full right-0 z-50 mt-3 w-80 max-w-[calc(100vw-2rem)] animate-slide-in rounded-[1.25rem] border border-outline bg-surface p-3 shadow-popover"
        >
          <div className="flex items-center gap-3 rounded-xl bg-linear-to-br from-info/10 to-transparent p-3">
            <Avatar name={name} src={avatar} size={48} />
            <div className="flex min-w-0 flex-col items-start gap-1.5">
              <p className="max-w-full truncate font-semibold">{name}</p>
              <Badge tone={ROLE_TONE[role]}>{roleLabel}</Badge>
            </div>
          </div>
          {divider}
          <LocalizedLink href="/account" className={cn(itemClasses, "group py-2.5")}>
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-info/10 text-info ring-1 ring-inset ring-info/15">
              <UserRound className="size-[1.125rem]" aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span>{t.nav.account}</span>
              <span className="truncate text-xs font-normal text-muted">{name}</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted transition-colors group-hover:text-foreground" aria-hidden="true" />
          </LocalizedLink>
          {role === "admin" && (
            <LocalizedLink href="/admin/requests" className={itemClasses}>
              <Shield className="size-4 text-muted" aria-hidden="true" />
              {t.nav.moderation}
            </LocalizedLink>
          )}
          {divider}
          <div className="px-1 py-2">
            <p className="mb-2.5 flex items-center gap-2 px-1 text-xs font-medium text-muted">
              <Languages className="size-3.5" aria-hidden="true" />
              {t.nav.language}
            </p>
            <LanguageSwitcher variant="segmented" />
          </div>
          {divider}
          <form action={signOutAction}>
            <input type="hidden" name="redirectTo" value={localizedPath(lang, "/")} />
            <button type="submit" className="group flex min-h-12 w-full items-center gap-3 rounded-xl border border-brand/15 bg-brand/5 px-3 py-2 text-sm font-medium text-brand-bright transition-colors hover:border-brand/35 hover:bg-brand/12">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand/10 transition-colors group-hover:bg-brand/15">
                <LogOut className="size-[1.125rem]" aria-hidden="true" />
              </span>
              {t.nav.signOut}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
