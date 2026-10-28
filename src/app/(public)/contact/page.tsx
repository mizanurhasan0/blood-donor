import { Flag, Mail, MessagesSquare, Siren } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach the BloodLink team, report a problem with a request, or get help.",
  alternates: { canonical: "/contact" },
};

function ContactCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <Card className="flex gap-4 p-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand/15 text-brand-bright">
        {icon}
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="font-semibold">{title}</h2>
        <div className="text-sm leading-relaxed text-muted">{children}</div>
      </div>
    </Card>
  );
}

/** Reads the address at request time so a changed env var applies without a rebuild. */
async function ContactEmail() {
  await connection();
  const email = env("contact").CONTACT_EMAIL;
  if (email) {
    return (
      <p>
        Email us at{" "}
        <a
          href={`mailto:${email}`}
          className="font-medium break-all text-foreground underline decoration-brand/60 underline-offset-4 hover:decoration-brand"
        >
          {email}
        </a>{" "}
        and we&apos;ll get back to you as soon as we can.
      </p>
    );
  }
  return (
    <p>
      We don&apos;t have a public inbox yet. Comment on the relevant{" "}
      <Link
        href="/requests"
        className="font-medium text-foreground underline decoration-brand/60 underline-offset-4"
      >
        blood request
      </Link>
      , or, if you&apos;ve joined the private donor Telegram channel, reach the admins there.
    </p>
  );
}

export default function ContactPage() {
  return (
    <PageContainer
      narrow
      title="Contact"
      description="Questions, feedback or a problem with a request? Here's the quickest way to reach the people who run BloodLink."
    >
      <div className="flex flex-col gap-4">
        <ContactCard icon={<Mail className="size-5" aria-hidden="true" />} title="Get in touch">
          <Suspense fallback={<Skeleton className="h-5 w-64 max-w-full" />}>
            <ContactEmail />
          </Suspense>
        </ContactCard>
        <ContactCard
          icon={<Flag className="size-5" aria-hidden="true" />}
          title="Report a request or comment"
        >
          <p>
            Use the <strong className="font-medium text-foreground">Report</strong> button on the request
            page. It goes straight to our moderators — for example if someone asks for payment or the details
            look wrong.
          </p>
        </ContactCard>
        <ContactCard
          icon={<MessagesSquare className="size-5" aria-hidden="true" />}
          title="Coordinating a donation"
        >
          <p>
            Talk to the requester in the comments on their request. Read{" "}
            <Link
              href="/how-it-works"
              className="font-medium text-foreground underline decoration-brand/60 underline-offset-4"
            >
              how it works
            </Link>{" "}
            for tips on staying safe.
          </p>
        </ContactCard>
        <ContactCard icon={<Siren className="size-5" aria-hidden="true" />} title="Medical emergency">
          <p>BloodLink isn&apos;t an emergency service. Contact the hospital directly or call 999.</p>
        </ContactCard>
      </div>
    </PageContainer>
  );
}
