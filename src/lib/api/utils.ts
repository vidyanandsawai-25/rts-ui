export interface BasePagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface BaseQueryParams {
  id?: number;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filterLogic?: string;
}

export function parseApiBoolean(val: unknown, defaultValue = false): boolean {
  if (val === null || val === undefined) return defaultValue;
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return val !== 0;
  if (typeof val === "string") {
    const s = val.trim().toLowerCase();
    if (s === "true" || s === "1" || s === "yes" || s === "active") return true;
    if (s === "false" || s === "0" || s === "no" || s === "inactive") return false;
  }
  return defaultValue;
}

export function parsePositiveInteger(val: unknown, defaultValue: number): number {
  if (typeof val === "number") {
    return Number.isInteger(val) && Number.isFinite(val) && val > 0 ? val : defaultValue;
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (/^\d+$/.test(trimmed)) {
      const num = parseInt(trimmed, 10);
      return Number.isInteger(num) && num > 0 ? num : defaultValue;
    }
  }
  return defaultValue;
}

export function sanitizePagedQuery<T extends BaseQueryParams>(
  params?: T,
  allowedSortFields?: Set<string>
): BaseQueryParams {
  const pageNumber = parsePositiveInteger(params?.pageNumber, 1);
  const pageSize = Math.min(100, parsePositiveInteger(params?.pageSize, 10));

  let searchTerm: string | undefined = undefined;
  if (typeof params?.searchTerm === "string" && params.searchTerm.trim()) {
    searchTerm = params.searchTerm.trim().slice(0, 100);
  }

  let sortBy: string | undefined = undefined;
  if (typeof params?.sortBy === "string" && params.sortBy.trim()) {
    const cleanSort = params.sortBy.trim();
    if (!allowedSortFields || allowedSortFields.has(cleanSort.toLowerCase())) {
      sortBy = cleanSort;
    }
  }

  const sortOrder = params?.sortOrder === "desc" ? "desc" : params?.sortOrder === "asc" ? "asc" : undefined;
  const id = params?.id && Number.isFinite(Number(params.id)) ? Number(params.id) : undefined;

  let filterLogic: string | undefined = undefined;
  if (typeof params?.filterLogic === "string" && params.filterLogic.trim()) {
    filterLogic = params.filterLogic.trim().slice(0, 500);
  }

  return {
    id,
    pageNumber,
    pageSize,
    searchTerm,
    sortBy,
    sortOrder,
    filterLogic,
  };
}

export function normalizePagedResponse<T>(
  raw: unknown,
  normalizeItem: (item: unknown) => T,
  params?: { pageNumber?: number; pageSize?: number }
): BasePagedResponse<T> {
  let rawData = (raw ?? {}) as Record<string, unknown>;

  if (rawData.data && typeof rawData.data === "object" && !Array.isArray(rawData.data)) {
    rawData = rawData.data as Record<string, unknown>;
  } else if (rawData.result && typeof rawData.result === "object" && !Array.isArray(rawData.result)) {
    rawData = rawData.result as Record<string, unknown>;
  }

  let rawItems: unknown[] = [];
  if (Array.isArray(rawData)) {
    rawItems = rawData;
  } else if (Array.isArray(rawData.items)) {
    rawItems = rawData.items;
  } else if (Array.isArray(rawData.Items)) {
    rawItems = rawData.Items;
  } else if (Array.isArray(rawData.data)) {
    rawItems = rawData.data as unknown[];
  }

  const items = rawItems.map(normalizeItem);

  const totalCount =
    typeof rawData.totalCount === "number"
      ? rawData.totalCount
      : typeof rawData.TotalCount === "number"
      ? rawData.TotalCount
      : items.length;

  const pageNumber =
    typeof rawData.pageNumber === "number"
      ? rawData.pageNumber
      : typeof rawData.PageNumber === "number"
      ? rawData.PageNumber
      : params?.pageNumber ?? 1;

  const pageSize =
    typeof rawData.pageSize === "number"
      ? rawData.pageSize
      : typeof rawData.PageSize === "number"
      ? rawData.PageSize
      : params?.pageSize ?? 10;

  const totalPages =
    typeof rawData.totalPages === "number"
      ? rawData.totalPages
      : typeof rawData.TotalPages === "number"
      ? rawData.TotalPages
      : Math.ceil(totalCount / (pageSize || 1)) || 1;

  return {
    items,
    totalCount,
    pageNumber,
    pageSize,
    totalPages,
    hasPreviousPage: pageNumber > 1,
    hasNextPage: pageNumber < totalPages,
  };
}
