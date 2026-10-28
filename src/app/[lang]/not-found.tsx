import { ArrowRight, House } from "lucide-react";
import type { Metadata } from "next";
import { BloodDrop } from "@/components/layout/logo";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { formatNumber, interpolate } from "@/lib/i18n/format";
import { getDictionary, getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return {
    title: t.pages.notFound.meta.title,
    robots: { index: false },
  };
}

export default async function NotFound() {
  const [t, lang] = await Promise.all([getDictionary(), getLocale()]);
  const n = t.pages.notFound;
  return (
    <Container className="flex flex-1 flex-col items-center justify-center gap-6 py-20 text-center sm:py-28">
      <div className="relative isolate">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 scale-150 rounded-full bg-brand/15 blur-3xl"
        />
        <BloodDrop className="h-16 w-12 text-brand" />
      </div>
      <p className="text-sm font-medium tracking-[0.2em] text-brand-bright uppercase">
        {interpolate(n.eyebrow, { code: formatNumber(404, lang) })}
      </p>
      <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{n.title}</h1>
      <p className="max-w-md text-muted">{n.text}</p>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <ButtonLink href="/">
          <House className="size-4" aria-hidden="true" />
          {n.goHome}
        </ButtonLink>
        <ButtonLink href="/requests" variant="secondary">
          {n.browse}
          <ArrowRight className="size-4" aria-hidden="true" />
        </ButtonLink>
      </div>
    </Container>
  );
}
