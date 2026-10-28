import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "./logo";

const LINKS = [
  { href: "/requests", label: "Blood Requests" },
  { href: "/become-donor", label: "Become Donor" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-outline/70 bg-surface/40">
      <Container className="flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between">
        <div className="flex max-w-sm flex-col gap-3">
          <Logo className="text-xl" />
          <p className="text-sm text-muted">
            A free community connecting voluntary blood donors with people in need across Bangladesh. Never
            pay or accept payment for blood.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-1 sm:grid-cols-3">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-10 items-center text-sm text-muted transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
      <Container className="border-t border-outline/50 py-5 text-xs text-muted">
        BloodLink is a volunteer community platform, not a medical service. Donation eligibility and
        compatibility are decided by qualified medical staff.
      </Container>
    </footer>
  );
}
