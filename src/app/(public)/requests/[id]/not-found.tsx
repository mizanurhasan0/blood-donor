import { SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function RequestNotFound() {
  return (
    <Container className="flex max-w-xl flex-col items-center gap-4 py-20 text-center sm:py-28">
      <span className="grid size-14 place-items-center rounded-full bg-elevated text-muted">
        <SearchX className="size-6" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Request not found</h1>
      <p className="text-muted">
        This request doesn&apos;t exist, was removed, or is still waiting for review.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/requests">Browse requests</ButtonLink>
        <ButtonLink href="/request/new" variant="secondary">
          Post a request
        </ButtonLink>
      </div>
    </Container>
  );
}
