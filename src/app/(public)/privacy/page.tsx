import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/shared/prose";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What BloodLink collects, who can see it, how phone numbers and documents are protected, and how to delete your data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="28 October 2026"
      intro="BloodLink is a free community platform that connects voluntary blood donors with people in need across Bangladesh. We only collect what we need to make that work, and we never sell your data."
    >
      <h2>What we collect</h2>
      <h3>When you sign in with Google</h3>
      <p>
        We receive your <strong>name</strong>, <strong>email address</strong> and{" "}
        <strong>profile photo</strong> from Google. We never see your Google password. A secure cookie keeps
        you signed in.
      </p>
      <h3>If you create a donor profile</h3>
      <ul>
        <li>Full name, blood group, division and district, and optionally your area.</li>
        <li>Optionally, your phone number. It is encrypted and never shown to other users.</li>
        <li>Whether you are available to donate and whether you want email alerts.</li>
        <li>If you link Telegram, your Telegram user ID, so we can approve you for the donor channel.</li>
      </ul>
      <h3>If you post a blood request</h3>
      <ul>
        <li>Blood group, units needed, hospital, district, needed date, urgency and a description.</li>
        <li>A contact phone number, encrypted at rest.</li>
        <li>Optionally, a prescription or requisition document (JPG, PNG, WEBP or PDF).</li>
      </ul>
      <h3>When you use the platform</h3>
      <ul>
        <li>Comments you post and reports you send about requests or comments.</li>
        <li>
          A log each time someone reveals a requester&apos;s phone number (who, which request and when).
        </li>
        <li>Short-lived counters used for rate limiting, and records of notification deliveries.</li>
      </ul>
      <p>We don&apos;t use advertising or third-party analytics trackers.</p>

      <h2>Who can see what</h2>
      <ul>
        <li>
          <strong>Published requests</strong> are public: blood group, units, hospital, district, needed date,
          urgency, description and comments (with the commenter&apos;s name and photo). New requests stay
          hidden until a moderator approves them.
        </li>
        <li>
          <strong>Phone numbers</strong> are shown masked (for example 017•••••678). The full number is
          revealed only to signed-in donors, only if the requester allows it, and every reveal is logged. The
          requester and moderators can always see it.
        </li>
        <li>
          <strong>Documents</strong> are kept in a private storage bucket with no public link. Only the
          requester and moderators can open them — and signed-in donors too, if the requester chooses to share
          it.
        </li>
        <li>
          <strong>Moderators</strong> can see pending requests, reports and notification delivery status in
          order to keep the platform safe.
        </li>
      </ul>

      <h2>How notifications work</h2>
      <ul>
        <li>
          <strong>Email</strong> alerts are sent through our email provider, Brevo, which receives your name
          and email address to deliver them. Only donors who turned on email alerts receive them, and every
          email has a one-click unsubscribe link.
        </li>
        <li>
          <strong>Telegram</strong> messages in the private donor channel contain only the blood group,
          hospital, district, units, needed date and a link to the request — never contact details or
          documents.
        </li>
      </ul>

      <h2>Who we share data with</h2>
      <p>
        We don&apos;t sell your data or use it for advertising. We rely on a few service providers to run
        BloodLink: Google (sign-in and profile photos), Brevo (email), Telegram (the donor channel), and our
        hosting, database and file storage providers. They only process data needed to provide their service.
      </p>

      <h2>Keeping it safe</h2>
      <p>
        Phone numbers are encrypted at rest, documents are stored privately, and every request is reviewed
        before it goes public. We rate-limit posting, comments, uploads, phone reveals and reports to prevent
        abuse. No system is perfectly secure, so please only share what is needed to arrange a donation.
      </p>

      <h2>Your choices and deleting your data</h2>
      <ul>
        <li>Turn email alerts or availability on or off from your account page at any time.</li>
        <li>Unsubscribe from alerts using the link in any email.</li>
        <li>
          Delete everything from <strong>Account → Delete account</strong>. This removes your account, donor
          profile, your requests and their documents, your Telegram link and your phone-reveal records.
          Comments you left on other people&apos;s requests are blanked.
        </li>
      </ul>

      <h2>Changes and contact</h2>
      <p>
        If we change this policy we will update the date at the top of this page. Questions? Visit our{" "}
        <Link href="/contact">contact page</Link>. See also our <Link href="/terms">Terms of Use</Link>.
      </p>
    </LegalPage>
  );
}
