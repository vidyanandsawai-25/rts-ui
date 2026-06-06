import CommonDetailsUpdatePage from "@/components/modules/property-tax/common-details-update/CommonDetailsUpdatePage";
import { getMenuItemsAction, getAllWardsAction, getAllWingsAction } from "./actions";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    field?: string;
    wardId?: string;
    fromProperty?: string;
    toProperty?: string;
    wing?: string;
    page?: string;
    pageSize?: string;
    q?: string;
  }>;
}

/** Pagination constraints */
const MIN_PAGE = 1;
const MAX_PAGE = 10_000;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

/**
 * Sanitizes and clamps all query-string parameters before they reach the
 * client component.
 */
function sanitizeParams(raw: Awaited<PageProps["searchParams"]>) {
  const rawPage = parseInt(raw.page ?? "", 10);
  const pageNumber = Number.isFinite(rawPage)
    ? Math.min(Math.max(rawPage, MIN_PAGE), MAX_PAGE)
    : MIN_PAGE;

  const rawPageSize = parseInt(raw.pageSize ?? "", 10);
  const pageSize = Number.isFinite(rawPageSize)
    ? Math.min(Math.max(rawPageSize, 1), MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;

  const searchTerm = raw.q?.trim() || "";
  const selectedField = raw.field?.trim() || "";
  const wardId = raw.wardId?.trim() || "";
  const fromProperty = raw.fromProperty?.trim() || "";
  const toProperty = raw.toProperty?.trim() || "";
  const wing = raw.wing?.trim() || "";
  const tab = raw.tab?.trim() || "updateFields";

  return { pageNumber, pageSize, searchTerm, selectedField, wardId, fromProperty, toProperty, wing, tab };
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const { pageNumber, pageSize, searchTerm, selectedField, wardId, fromProperty, toProperty, wing, tab } = sanitizeParams(params);

  // Fetch menu items - throw error to trigger error boundary
  const menuItems = await getMenuItemsAction();

  // Fetch supporting data in parallel
  const [wardsResult, wingsResult] = await Promise.all([
    getAllWardsAction(),
    getAllWingsAction(),
  ]);

  const wardsData = wardsResult.success && wardsResult.data ? wardsResult.data : {
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: -1,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  const wingsData = wingsResult.success && wingsResult.data ? wingsResult.data : {
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: -1,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  return (
    <CommonDetailsUpdatePage
      menuItems={menuItems}
      wardsData={wardsData}
      wingsData={wingsData}
      initialField={selectedField}
      initialWardId={wardId}
      initialFromProperty={fromProperty}
      initialToProperty={toProperty}
      initialWing={wing}
      initialPage={pageNumber}
      initialPageSize={pageSize}
      initialSearchTerm={searchTerm}
      initialTab={tab}
    />
  );
}
