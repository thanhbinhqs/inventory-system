import type { TransactionFilter } from "@/lib/types";

// ---------------------------------------------------------------------------
// Defaults — used to keep the URL clean by omitting params that match these.
// ---------------------------------------------------------------------------

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_SORT_BY = "created_at";
export const DEFAULT_SORT_ORDER: "asc" | "desc" = "desc";

// ---------------------------------------------------------------------------
// Build helpers – turn filter state into URLSearchParams / query string.
// ---------------------------------------------------------------------------

/**
 * Build a `URLSearchParams` instance from a partial `TransactionFilter`.
 * Fields that match the default value are omitted so the URL stays clean.
 */
export function buildFilterParams(
  filter: Partial<TransactionFilter>,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filter.page !== undefined && filter.page !== DEFAULT_PAGE) {
    params.set("page", String(filter.page));
  }
  if (filter.pageSize !== undefined && filter.pageSize !== DEFAULT_PAGE_SIZE) {
    params.set("pageSize", String(filter.pageSize));
  }
  if (filter.sortBy !== undefined && filter.sortBy !== DEFAULT_SORT_BY) {
    params.set("sortBy", filter.sortBy);
  }
  if (
    filter.sortOrder !== undefined &&
    filter.sortOrder !== DEFAULT_SORT_ORDER
  ) {
    params.set("sortOrder", filter.sortOrder);
  }
  if (filter.search) {
    params.set("search", filter.search);
  }
  if (filter.type) {
    params.set("type", filter.type);
  }
  if (filter.startDate) {
    params.set("startDate", filter.startDate);
  }
  if (filter.endDate) {
    params.set("endDate", filter.endDate);
  }

  return params;
}

/**
 * Convenience wrapper – returns a query string (e.g. `?page=2&sortBy=name`).
 */
export function buildFilterQueryString(
  filter: Partial<TransactionFilter>,
): string {
  const qs = buildFilterParams(filter).toString();
  return qs ? `?${qs}` : "";
}

// ---------------------------------------------------------------------------
// Parse helpers – read filter state back from URLSearchParams.
// ---------------------------------------------------------------------------

/**
 * Parse a `URLSearchParams` instance into a partial `TransactionFilter`.
 * Only params that are present in the search string are set on the result.
 */
export function parseFilterParams(
  searchParams: URLSearchParams,
): Partial<TransactionFilter> {
  const filter: Partial<TransactionFilter> = {};

  const page = searchParams.get("page");
  if (page !== null) {
    filter.page = Number(page);
  }

  const pageSize = searchParams.get("pageSize");
  if (pageSize !== null) {
    filter.pageSize = Number(pageSize);
  }

  const sortBy = searchParams.get("sortBy");
  if (sortBy !== null) {
    filter.sortBy = sortBy;
  }

  const sortOrder = searchParams.get("sortOrder");
  if (sortOrder === "asc" || sortOrder === "desc") {
    filter.sortOrder = sortOrder;
  }

  const search = searchParams.get("search");
  if (search !== null) {
    filter.search = search;
  }

  const type = searchParams.get("type");
  if (type === "IN" || type === "OUT" || type === "") {
    filter.type = type;
  }

  const startDate = searchParams.get("startDate");
  if (startDate !== null) {
    filter.startDate = startDate;
  }

  const endDate = searchParams.get("endDate");
  if (endDate !== null) {
    filter.endDate = endDate;
  }

  return filter;
}

/**
 * Get a fully resolved `TransactionFilter` from URL params, filling in
 * defaults for any fields that were not present in the search string.
 */
export function resolveFilterParams(
  searchParams: URLSearchParams,
): TransactionFilter {
  const partial = parseFilterParams(searchParams);

  return {
    page: partial.page ?? DEFAULT_PAGE,
    pageSize: partial.pageSize ?? DEFAULT_PAGE_SIZE,
    sortBy: partial.sortBy ?? DEFAULT_SORT_BY,
    sortOrder: partial.sortOrder ?? DEFAULT_SORT_ORDER,
    search: partial.search,
    type: partial.type ?? "",
    startDate: partial.startDate,
    endDate: partial.endDate,
  };
}

// ---------------------------------------------------------------------------
// Merge helpers – make surgical updates to an existing set of search params.
// ---------------------------------------------------------------------------

/**
 * Return a **new** `URLSearchParams` by applying the given updates on top of
 * `currentSearchParams`.  Fields set to their default / empty value are
 * removed from the result so the URL stays tidy.
 */
export function mergeFilterParams(
  currentSearchParams: URLSearchParams,
  updates: Partial<TransactionFilter>,
): URLSearchParams {
  const params = new URLSearchParams(currentSearchParams);

  if (updates.page !== undefined) {
    updates.page === DEFAULT_PAGE
      ? params.delete("page")
      : params.set("page", String(updates.page));
  }

  if (updates.pageSize !== undefined) {
    updates.pageSize === DEFAULT_PAGE_SIZE
      ? params.delete("pageSize")
      : params.set("pageSize", String(updates.pageSize));
  }

  if (updates.sortBy !== undefined) {
    updates.sortBy === DEFAULT_SORT_BY
      ? params.delete("sortBy")
      : params.set("sortBy", updates.sortBy);
  }

  if (updates.sortOrder !== undefined) {
    updates.sortOrder === DEFAULT_SORT_ORDER
      ? params.delete("sortOrder")
      : params.set("sortOrder", updates.sortOrder);
  }

  if (updates.search !== undefined) {
    updates.search
      ? params.set("search", updates.search)
      : params.delete("search");
  }

  if (updates.type !== undefined) {
    updates.type
      ? params.set("type", updates.type)
      : params.delete("type");
  }

  if (updates.startDate !== undefined) {
    updates.startDate
      ? params.set("startDate", updates.startDate)
      : params.delete("startDate");
  }

  if (updates.endDate !== undefined) {
    updates.endDate
      ? params.set("endDate", updates.endDate)
      : params.delete("endDate");
  }

  return params;
}
