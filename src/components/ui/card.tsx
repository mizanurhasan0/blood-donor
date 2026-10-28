import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("rounded-card border border-outline/70 bg-card shadow-card", className)} {...props} />
  );
}
