import { notFound } from "next/navigation";

/**
 * Catch-all for paths that match no page under a language prefix (e.g. /bn/does-not-exist).
 * Without it Next falls back to its built-in English 404; calling notFound() here renders the
 * bilingual [lang]/not-found.tsx instead.
 */
export default function UnmatchedPage() {
  notFound();
}
