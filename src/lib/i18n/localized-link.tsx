"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useLocale } from "./locale-context";
import { localizedPath } from "./paths";

/** next/link that keeps the visitor's language prefix (/bn or /en) on internal paths. */
export function LocalizedLink({ href, ...props }: ComponentProps<typeof Link>) {
  const { lang } = useLocale();
  const target = typeof href === "string" ? localizedPath(lang, href) : href;
  return <Link href={target} {...props} />;
}
