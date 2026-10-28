import { Menu, Shield } from "lucide-react";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getViewer, type Viewer } from "@/features/auth/viewer";
import { signOutAction } from "@/features/auth/actions";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { NavLinks, NavList } from "./nav-links";

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

function GuestButtons({ stacked = false }: { stacked?: boolean }) {
  return (
    <div className={stacked ? "grid grid-cols-2 gap-3" : "flex items-center gap-3"}>
      <ButtonLink
        href="/login"
        variant="secondary"
        size={stacked ? "md" : "sm"}
        className="sm:min-h-11 sm:px-6"
      >
        Login
      </ButtonLink>
      <ButtonLink href="/login?mode=signup" size={stacked ? "md" : "sm"} className="sm:min-h-11 sm:px-6">
        Sign Up
      </ButtonLink>
    </div>
  );
}

async function DesktopAccount() {
  const viewer = await safeViewer();
  if (!viewer) return <GuestButtons />;
  return (
    <div className="flex items-center gap-2">
      {viewer.isAdmin && (
        <ButtonLink href="/admin/requests" variant="ghost" size="sm">
          <Shield className="size-4" aria-hidden="true" />
          Admin
        </ButtonLink>
      )}
      <Link
        href="/account"
        className="flex min-h-11 items-center gap-2.5 rounded-pill border border-outline py-1 pr-4 pl-1 text-sm font-medium transition-colors hover:border-muted"
      >
        <Avatar name={viewer.name} src={viewer.avatar} size={34} />
        <span className="max-w-32 truncate">{viewer.name.split(" ")[0]}</span>
      </Link>
    </div>
  );
}

async function MobileAccount() {
  const viewer = await safeViewer();
  if (!viewer) return <GuestButtons stacked />;
  return (
    <div className="flex flex-col gap-2">
      <Link href="/account" className="flex min-h-12 items-center gap-3 rounded-button px-4 hover:bg-surface">
        <Avatar name={viewer.name} src={viewer.avatar} size={32} />
        <span className="font-medium">My account</span>
      </Link>
      {viewer.isAdmin && (
        <Link
          href="/admin/requests"
          className="flex min-h-12 items-center rounded-button px-4 hover:bg-surface"
        >
          Moderation
        </Link>
      )}
      <form action={signOutAction}>
        <button
          type="submit"
          className="flex min-h-12 w-full items-center rounded-button px-4 text-left text-muted hover:bg-surface"
        >
          Sign out
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

export function Header() {
  return (
    <header className="sticky top-0 z-40 header-surface border-b">
      <Container className="relative flex h-16 items-center justify-between gap-4 sm:h-20">
        <Logo />
        <nav aria-label="Main" className="hidden lg:block">
          <Suspense fallback={<NavList pathname={null} />}>
            <NavLinks />
          </Suspense>
        </nav>
        <div className="hidden lg:block">
          <Suspense fallback={<GuestButtons />}>
            <DesktopAccount />
          </Suspense>
        </div>
        <Suspense fallback={<MobileMenuFallback />}>
          <MobileMenu>
            <Suspense fallback={<GuestButtons stacked />}>
              <MobileAccount />
            </Suspense>
          </MobileMenu>
        </Suspense>
      </Container>
    </header>
  );
}
