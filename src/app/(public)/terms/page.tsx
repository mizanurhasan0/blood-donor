import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/shared/prose";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The simple rules for using BloodLink: a free community platform, no payment for blood, no medical advice and respectful, accurate posts.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      updated="28 October 2026"
      intro="By using BloodLink you agree to these terms. They are short on purpose — please read them."
    >
      <h2>A free community platform</h2>
      <p>
        BloodLink helps people share blood requests and connect with voluntary donors across Bangladesh. It is
        free to use. BloodLink is not a blood bank, hospital or medical service.
      </p>

      <h2>Never pay for blood</h2>
      <p>
        Blood donation on BloodLink is voluntary. <strong>Never pay or accept payment for blood</strong>, and
        never ask for money, gifts or favours in return. Requests or comments that involve payment will be
        removed. Please report them.
      </p>

      <h2>No medical advice</h2>
      <p>
        Matching by blood group only finds potential volunteers. Screening, compatibility testing and donation
        eligibility are decided by qualified medical staff at the hospital. Nothing on BloodLink is medical
        advice. In an emergency, contact the hospital directly or call 999.
      </p>

      <h2>Your responsibilities</h2>
      <ul>
        <li>Only post genuine requests, and keep the details accurate and up to date.</li>
        <li>Mark your request as fulfilled once you have the blood you need.</li>
        <li>Only share someone else&apos;s details or documents with their permission.</li>
        <li>Use any phone number you see only to arrange a donation — never for anything else.</li>
        <li>Be respectful. No spam, harassment, hate or misleading content.</li>
      </ul>
      <p>You are responsible for what you post and for your own arrangements with other users.</p>

      <h2>Moderation</h2>
      <p>
        Moderators review every request before it is published. We may reject or remove requests and comments,
        and act on reports, when content breaks these terms or puts people at risk.
      </p>

      <h2>No guarantees</h2>
      <p>
        We do our best, but we can&apos;t guarantee that a donor will be found, that information posted by
        users is accurate, or that the service will always be available. BloodLink is provided as is, and we
        are not responsible for arrangements made between users.
      </p>

      <h2>Your account</h2>
      <p>
        You sign in with Google and can delete your account at any time from{" "}
        <strong>Account → Delete account</strong>. How we handle your data is explained in our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Changes and contact</h2>
      <p>
        We may update these terms and will change the date at the top when we do. Questions? Visit our{" "}
        <Link href="/contact">contact page</Link>.
      </p>
    </LegalPage>
  );
}
