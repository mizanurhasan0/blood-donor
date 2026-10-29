import { Menu } from "lucide-react";
import { unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getViewer, type Viewer } from "@/features/auth/viewer";
import { signOutAction } from "@/features/auth/actions";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/messages";
import { LocalizedLink } from "@/lib/i18n/localized-link";
import { localizedPath } from "@/lib/i18n/paths";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { NavLinks, NavList } from "./nav-links";
import { ProfileMenu, type ProfileRole } from "./profile-menu";

type Nav = Dictionary["nav"];

/** The header must never break the page, so auth/database errors fall back to guest UI. */
async function safeViewer(): Promise<Viewer | null> {
  try {
    return await getViewer();
  } catch (error) {
    unstable_rethrow(error);
    console.error("[header] could not resolve viewer", error);
    return null;
  }
}

function GuestButtons({ stacked = false, t }: { stacked?: boolean; t: Nav }) {
  return (
    <div className={stacked ? "grid grid-cols-2 gap-3" : "flex items-center gap-3"}>
      <ButtonLink
        href="/login"
        variant="secondary"
        size={stacked ? "md" : "sm"}
        className="sm:min-h-11 sm:px-6"
      >
        {t.login}
      </ButtonLink>
      <ButtonLink href="/login?mode=signup" size={stacked ? "md" : "sm"} className="sm:min-h-11 sm:px-6">
        {t.signUp}
      </ButtonLink>
    </div>
  );
}

/** Admin wins over donor: an admin who is also a donor is shown as admin. */
function roleOf(viewer: Viewer): ProfileRole {
  if (viewer.isAdmin) return "admin";
  return viewer.donor ? "donor" : "member";
}

function roleLabel(role: ProfileRole, t: Nav): string {
  return role === "admin" ? t.roleAdmin : role === "donor" ? t.roleDonor : t.roleMember;
}

function displayName(viewer: Viewer): string {
  return viewer.donor?.fullName ?? viewer.name;
}

/** Guests see the language switch beside the sign-in buttons. Signed-in users find it in the profile menu. */
function GuestAccount({ t }: { t: Nav }) {
  return (
    <>
      <LanguageSwitcher />
      <GuestButtons t={t} />
    </>
  );
}

async function DesktopAccount({ t }: { t: Nav }) {
  const viewer = await safeViewer();
  if (!viewer) return <GuestAccount t={t} />;
  return <ProfileMenu name={displayName(viewer)} avatar={viewer.avatar ?? null} role={roleOf(viewer)} />;
}

async function MobileAccount({ t, lang }: { t: Nav; lang: Locale }) {
  const viewer = await safeViewer();
  if (!viewer) return <GuestButtons stacked t={t} />;
  const role = roleOf(viewer);
  return (
    <div className="flex flex-col gap-2">
      <LocalizedLink
        href="/account"
        className="flex min-h-12 items-center gap-3 rounded-button px-4 hover:bg-surface"
      >
        <Avatar name={displayName(viewer)} src={viewer.avatar} size={32} />
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-medium">{displayName(viewer)}</span>
          <span className="text-xs text-muted">{roleLabel(role, t)}</span>
        </span>
      </LocalizedLink>
      {viewer.isAdmin && (
        <LocalizedLink
          href="/admin/requests"
          className="flex min-h-12 items-center rounded-button px-4 hover:bg-surface"
        >
          {t.moderation}
        </LocalizedLink>
      )}
      <form action={signOutAction}>
        <input type="hidden" name="redirectTo" value={localizedPath(lang, "/")} />
        <button
          type="submit"
          className="flex min-h-12 w-full items-center rounded-button px-4 text-left text-muted hover:bg-surface"
        >
          {t.signOut}
        </button>
      </form>
    </div>
  );
}

function MobileMenuFallback() {
  return (
    <span className="grid size-11 place-items-center text-foreground lg:hidden" aria-hidden="true">
      <Menu className="size-6" />
    </span>
  );
}

export async function Header() {
  const [t, lang] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <header className="sticky top-0 z-40 header-surface border-b">
      <Container className="relative flex h-16 items-center justify-between gap-4 sm:h-20">
        <Logo homeLabel={t.nav.home} />
        <nav aria-label={t.nav.mainNav} className="hidden lg:block">
          <Suspense fallback={<NavList pathname={null} />}>
            <NavLinks />
          </Suspense>
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Suspense fallback={<GuestAccount t={t.nav} />}>
            <DesktopAccount t={t.nav} />
          </Suspense>
        </div>
        <Suspense fallback={<MobileMenuFallback />}>
          <MobileMenu>
            <Suspense fallback={<GuestButtons stacked t={t.nav} />}>
              <MobileAccount t={t.nav} lang={lang} />
            </Suspense>
          </MobileMenu>
        </Suspense>
      </Container>
    </header>
  );
}
