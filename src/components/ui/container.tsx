import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}

export function SectionHeading({
  title,
  description,
  action,
  as: Heading = "h2",
  id,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  as?: "h1" | "h2";
  id?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="flex max-w-2xl flex-col gap-2">
        <Heading id={id} className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </Heading>
        {description && <p className="text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Standard page wrapper: heading block + content, used by every inner page. */
export function PageContainer({
  title,
  description,
  action,
  children,
  className,
  narrow = false,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  narrow?: boolean;
}) {
  return (
    <Container className={cn("py-10 sm:py-14", narrow && "max-w-3xl", className)}>
      <SectionHeading as="h1" title={title} description={description} action={action} />
      <div className="mt-8 sm:mt-10">{children}</div>
    </Container>
  );
}
