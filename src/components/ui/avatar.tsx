import Image from "next/image";
import { cn } from "@/lib/utils/cn";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Avatar({
  name,
  src,
  size = 36,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const style = { width: size, height: size };
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full bg-elevated object-cover", className)}
        style={style}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={style}
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-elevated text-xs font-semibold text-muted",
        className,
      )}
    >
      {initials(name) || "?"}
    </span>
  );
}
