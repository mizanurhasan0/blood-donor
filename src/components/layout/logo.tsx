import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function BloodDrop({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 32" className={cn("text-brand", className)} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 1.2c.4 0 .8.2 1 .6 1.9 3.1 4.3 6.2 6.2 9.4 1.9 3.1 3.1 5.8 3.1 8.6C22.3 26 17.7 30.8 12 30.8S1.7 26 1.7 19.8c0-2.8 1.2-5.5 3.1-8.6C6.7 8 9.1 4.9 11 1.8c.2-.4.6-.6 1-.6Z"
      />
      <path
        className="fill-background/35"
        d="M12 13.5a7.5 7.5 0 0 1 7.3 9.3A7.5 7.5 0 0 1 4.6 21a7.4 7.4 0 0 1 7.4-7.5Z"
      />
      <path
        className="fill-foreground/85"
        d="M7.2 20.4c.6 0 1 .4 1 1 0 1.6 1.2 3 2.8 3.3a1 1 0 1 1-.3 2 5.4 5.4 0 0 1-4.5-5.3c0-.6.4-1 1-1Z"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-button text-2xl font-bold tracking-tight",
        className,
      )}
    >
      <BloodDrop className="h-8 w-6 drop-shadow-[0_0_10px_var(--color-brand)]" />
      <span>
        Blood<span className="text-brand">Link</span>
      </span>
      <span className="sr-only">home</span>
    </Link>
  );
}
