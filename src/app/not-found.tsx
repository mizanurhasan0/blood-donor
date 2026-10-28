import { ArrowRight, House } from "lucide-react";
import type { Metadata } from "next";
import { BloodDrop } from "@/components/layout/logo";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <Container className="flex flex-1 flex-col items-center justify-center gap-6 py-20 text-center sm:py-28">
      <div className="relative isolate">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 scale-150 rounded-full bg-brand/15 blur-3xl"
        />
        <BloodDrop className="h-16 w-12" />
      </div>
      <p className="text-sm font-medium tracking-[0.2em] text-brand-bright uppercase">Error 404</p>
      <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        We couldn&apos;t find that page
      </h1>
      <p className="max-w-md text-muted">
        The link may be broken, or the blood request may have been removed or is not public yet.
      </p>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <ButtonLink href="/">
          <House className="size-4" aria-hidden="true" />
          Go home
        </ButtonLink>
        <ButtonLink href="/requests" variant="secondary">
          Browse blood requests
          <ArrowRight className="size-4" aria-hidden="true" />
        </ButtonLink>
      </div>
    </Container>
  );
}
