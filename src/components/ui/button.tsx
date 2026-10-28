import type { ComponentProps } from "react";
import { LocalizedLink } from "@/lib/i18n/localized-link";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "./spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-pill font-medium whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-brand-strong text-foreground shadow-glow hover:bg-brand-strong-hover",
  secondary: "border border-outline text-foreground hover:border-muted hover:bg-surface",
  ghost: "text-muted hover:bg-surface hover:text-foreground",
  danger: "border border-brand/50 text-brand-bright hover:bg-brand-strong hover:text-foreground",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3.5 text-sm",
  md: "min-h-11 px-5 text-[0.95rem]",
  lg: "min-h-12 px-6 text-base sm:min-h-14 sm:px-8 sm:text-lg",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  size?: Size;
  pending?: boolean;
}

export function Button({
  variant,
  size,
  pending = false,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      {...props}
    >
      {pending && <Spinner className="size-4" />}
      {children}
    </button>
  );
}

interface ButtonLinkProps extends ComponentProps<typeof LocalizedLink> {
  variant?: Variant;
  size?: Size;
}

/** A link styled as a button. Paths are unprefixed (`/requests`); the language prefix is added for you. */
export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <LocalizedLink className={buttonClasses(variant, size, className)} {...props} />;
}
