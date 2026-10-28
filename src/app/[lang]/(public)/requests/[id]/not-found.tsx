import { SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getDictionary } from "@/lib/i18n/server";

export default async function RequestNotFound() {
  const t = await getDictionary();
  const n = t.requests.notFound;
  return (
    <Container className="flex max-w-xl flex-col items-center gap-4 py-20 text-center sm:py-28">
      <span className="grid size-14 place-items-center rounded-full bg-elevated text-muted">
        <SearchX className="size-6" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{n.title}</h1>
      <p className="text-muted">{n.body}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/requests">{n.browse}</ButtonLink>
        <ButtonLink href="/request/new" variant="secondary">
          {n.post}
        </ButtonLink>
      </div>
    </Container>
  );
}
