import { Container } from "@/components/ui/container";
import { LocalizedLink } from "@/lib/i18n/localized-link";
import { getDictionary } from "@/lib/i18n/server";
import { Logo } from "./logo";

export async function Footer() {
  const t = await getDictionary();
  const links = [
    { href: "/requests", label: t.nav.bloodRequests },
    { href: "/become-donor", label: t.nav.becomeDonor },
    { href: "/how-it-works", label: t.nav.howItWorks },
    { href: "/privacy", label: t.nav.privacyPolicy },
    { href: "/terms", label: t.nav.terms },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <footer className="mt-auto border-t border-outline/70 bg-surface/40">
      <Container className="flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between">
        <div className="flex max-w-sm flex-col gap-3">
          <Logo className="text-xl" homeLabel={t.nav.home} />
          <p className="text-sm text-muted">{t.nav.footerMission}</p>
        </div>
        <nav aria-label={t.nav.footerNav}>
          <ul className="grid grid-cols-2 gap-x-10 gap-y-1 sm:grid-cols-3">
            {links.map((link) => (
              <li key={link.href}>
                <LocalizedLink
                  href={link.href}
                  className="inline-flex min-h-10 items-center text-sm text-muted transition-colors hover:text-foreground"
                >
                  {link.label}
                </LocalizedLink>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
      <Container className="border-t border-outline/50 py-5 text-xs text-muted">
        {t.nav.footerDisclaimer}
      </Container>
    </footer>
  );
}
