import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { parseRequestFilters } from "@/lib/validators/request";

export type FilterKey = "bloodGroup" | "district" | "urgency" | "status" | "needed" | "q";

/**
 * Request-list filters stored in the URL. Every change replaces the current
 * history entry, resets pagination and runs inside a transition so callers
 * can show a pending state while the server renders the new results.
 */
export function useRequestFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Same parser as the server, so the UI never shows a value the list ignores.
  const filters = parseRequestFilters(Object.fromEntries(searchParams));
  const activeCount = [
    filters.bloodGroup,
    filters.district,
    filters.urgency,
    filters.needed,
    filters.status !== "published",
  ].filter(Boolean).length;
  const hasFilters = activeCount > 0 || Boolean(filters.q);

  function navigate(params: URLSearchParams) {
    params.delete("page");
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  function setFilter(key: FilterKey, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    const isDefault = !value || (key === "status" && value === "published");
    if (isDefault) params.delete(key);
    else params.set(key, value);
    navigate(params);
  }

  function clear() {
    navigate(new URLSearchParams());
  }

  return { filters, activeCount, hasFilters, isPending, setFilter, clear };
}
