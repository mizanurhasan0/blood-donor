import { Fragment, type ReactNode } from "react";
import { LocalizedLink } from "@/lib/i18n/localized-link";

// Tokens understood in dictionary text: **bold**, [label](/path) and {name} placeholders.
const TOKEN = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|\{(\w+)\}/g;

/**
 * Renders dictionary copy that needs a little emphasis or a link, without putting JSX in the dictionary.
 * The markup (strong, links, placeholder slots) is chosen here; only plain text comes from messages.
 */
export function Rich({
  text,
  values,
  strongClassName,
  linkClassName,
}: {
  text: string;
  values?: Record<string, ReactNode>;
  strongClassName?: string;
  linkClassName?: string;
}) {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    const [token, bold, label, href, name] = match;
    const index = match.index;
    if (index > last) nodes.push(text.slice(last, index));
    if (bold !== undefined) {
      nodes.push(
        <strong key={index} className={strongClassName}>
          {bold}
        </strong>,
      );
    } else if (label !== undefined && href !== undefined) {
      nodes.push(
        href.startsWith("/") ? (
          <LocalizedLink key={index} href={href} className={linkClassName}>
            {label}
          </LocalizedLink>
        ) : (
          <a key={index} href={href} className={linkClassName}>
            {label}
          </a>
        ),
      );
    } else if (name !== undefined) {
      nodes.push(<Fragment key={index}>{values?.[name] ?? token}</Fragment>);
    }
    last = index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}
