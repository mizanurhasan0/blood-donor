"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

function digestOf(error: unknown): string | null {
  if (error instanceof Error && "digest" in error && typeof error.digest === "string") return error.digest;
  return null;
}

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = digestOf(error);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex flex-1 flex-col items-center justify-center gap-5 py-20 text-center sm:py-28">
      <span className="grid size-14 place-items-center rounded-full bg-brand/15 text-brand-bright">
        <TriangleAlert className="size-6" aria-hidden="true" />
      </span>
      <div role="alert" className="flex flex-col items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Something went wrong</h1>
        <p className="max-w-md text-muted">
          This page couldn&apos;t load right now. It&apos;s usually temporary — please try again.
        </p>
      </div>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button onClick={() => retry()}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Try again
        </Button>
        <ButtonLink href="/" variant="secondary">
          Go home
        </ButtonLink>
      </div>
      {digest && <p className="text-xs text-muted">Reference: {digest}</p>}
    </Container>
  );
}
