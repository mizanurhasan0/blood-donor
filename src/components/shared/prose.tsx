import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { interpolate } from "@/lib/i18n/format";
import { getDictionary } from "@/lib/i18n/server";
import { cn } from "@/lib/utils/cn";

/** Readable long-form text styles for policy and help pages (no typography plugin needed). */
export function Prose({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "text-muted [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:decoration-brand/60 [&_a]:underline-offset-4 [&_a:hover]:decoration-brand",
        "[&_h2]:mt-12 [&_h2]:scroll-mt-28 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground sm:[&_h2]:text-2xl",
        "[&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:pl-1 [&_li+li]:mt-2 [&_p]:mt-4 [&_p]:leading-relaxed",
        "[&_strong]:font-medium [&_strong]:text-foreground [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:leading-relaxed",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Shared shell for the privacy policy and terms: heading, last-updated line and prose body.
 * `updated` is already formatted for the page's language (use formatDate).
 */
export async function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  const t = await getDictionary();
  return (
    <Container className="max-w-3xl py-10 sm:py-14">
      <header className="flex flex-col gap-3 border-b border-outline/70 pb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="text-sm text-muted">{interpolate(t.common.lastUpdated, { date: updated })}</p>
        <p className="text-lg leading-relaxed text-muted">{intro}</p>
      </header>
      <Prose>{children}</Prose>
    </Container>
  );
}
