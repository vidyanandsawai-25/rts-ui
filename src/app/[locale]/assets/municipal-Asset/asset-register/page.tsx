import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { parsePaginationParams } from '@/lib/utils/pagination';
import { AssetRegisterView } from '@/components/modules/assets/municipal-Asset/asset-register/AssetRegisterView';
import {
  fetchAssetRegisterPage,
  fetchZones,
  fetchWards,
  fetchDepartments,
  fetchCategories,
} from './[categoryId]/action';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    searchField?: string;
    AssetNo?: string;
    AssetTypeId?: string;
    ZoneId?: string;
    WardId?: string;
    DepartmentId?: string;
    sortBy?: string;
    sortOrder?: string;
    viewImageAssetId?: string;
    expandAssetId?: string;
  }>;
}

function isValidSingleFilterValue(value: string): boolean {
  return value === 'all' || /^\d+$/.test(value);
}

function isValidMultiFilterValue(value: string): boolean {
  return value === 'all' || /^\d+(,\d+)*$/.test(value);
}

function sanitizePositiveId(value: string | undefined): string | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return String(parsed);
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

const INDIAN_LANGUAGE_SEARCH_REGEX = /^[\p{L}\p{M}\p{N}\s.,\-()/]$/u;

function sanitizeSearch(value: string | undefined): string {
  return (value || '')
    .trim()
    .split('')
    .filter((char) => INDIAN_LANGUAGE_SEARCH_REGEX.test(char))
    .join('')
    .slice(0, 200);
}

export default async function Page({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const query = await searchParams;

  const { pageNumber: safePage, pageSize: rawPageSize } = parsePaginationParams(
    query.page,
    query.pageSize
  );
  const safePageSize = PAGE_SIZE_OPTIONS.includes(rawPageSize as (typeof PAGE_SIZE_OPTIONS)[number]) ? rawPageSize : 10;
  const safeSearch = sanitizeSearch(query.search);
  const safeSearchField = query.searchField === 'assetId' || query.searchField === 'assetName' || query.searchField === 'address' ? query.searchField : 'all';
  const safeAssetNo = sanitizeSearch(query.AssetNo);
  const safeAssetTypeId = isValidMultiFilterValue(query.AssetTypeId ?? 'all') ? (query.AssetTypeId ?? 'all') : 'all';
  const safeZoneId = isValidSingleFilterValue(query.ZoneId ?? 'all') ? (query.ZoneId ?? 'all') : 'all';
  const safeWardId = isValidSingleFilterValue(query.WardId ?? 'all') ? (query.WardId ?? 'all') : 'all';
  const safeDepartmentId = isValidSingleFilterValue(query.DepartmentId ?? 'all') ? (query.DepartmentId ?? 'all') : 'all';
  const safeSortBy = typeof query.sortBy === 'string' ? query.sortBy : undefined;
  const safeSortOrder = query.sortOrder === 'desc' ? 'desc' : (query.sortOrder === 'asc' ? 'asc' : undefined);
  const safeViewImageAssetId = sanitizePositiveId(query.viewImageAssetId);
  const safeExpandAssetId = sanitizePositiveId(query.expandAssetId);
  const updatedDate = new Date().toLocaleDateString('en-GB');

  const [assetsResult, typesResult, zonesResult, wardsResult, departmentsResult, categoriesResult] = await Promise.all([
    fetchAssetRegisterPage(
      null,
      safePage,
      safePageSize,
      safeSearchField === 'all' ? safeSearch : '',
      safeAssetTypeId === 'all' ? null : safeAssetTypeId,
      safeZoneId === 'all' ? null : Number(safeZoneId),
      safeWardId === 'all' ? null : Number(safeWardId),
      safeDepartmentId === 'all' ? null : Number(safeDepartmentId),
      (safeSearchField === 'assetId' && safeSearch) ? safeSearch : safeAssetNo,
      safeSearchField === 'assetName' ? safeSearch : '',
      safeSearchField === 'address' ? safeSearch : '',
      safeSortBy,
      safeSortOrder
    ),
    Promise.resolve([]),
    fetchZones(),
    fetchWards(safeZoneId),
    fetchDepartments(),
    fetchCategories(),
  ]);

  if (assetsResult.error) {
    throw new Error(assetsResult.error);
  }

  let finalWardId = safeWardId;
  if (safeZoneId !== 'all' && safeWardId !== 'all') {
    const ward = wardsResult.find((w) => String(w.id) === safeWardId);
    if (!ward || String(ward.zoneId) !== safeZoneId) {
      finalWardId = 'all';
    }
  }

  const totalPages = Math.max(1, Math.ceil(assetsResult.totalCount / safePageSize));
  let finalPage = safePage;
  if (safePage > totalPages) {
    finalPage = totalPages;
  }

  const canonicalQuery = new URLSearchParams();
  if (finalPage > 1) canonicalQuery.set('page', String(finalPage));
  if (safePageSize !== 10) canonicalQuery.set('pageSize', String(safePageSize));
  if (safeSearch) canonicalQuery.set('search', safeSearch);
  if (safeSearchField !== 'all') canonicalQuery.set('searchField', safeSearchField);
  if (safeAssetNo) canonicalQuery.set('AssetNo', safeAssetNo);
  if (safeAssetTypeId !== 'all') canonicalQuery.set('AssetTypeId', safeAssetTypeId);
  if (safeZoneId !== 'all') canonicalQuery.set('ZoneId', safeZoneId);
  if (finalWardId !== 'all') canonicalQuery.set('WardId', finalWardId);
  if (safeDepartmentId !== 'all') canonicalQuery.set('DepartmentId', safeDepartmentId);
  if (safeSortBy) canonicalQuery.set('sortBy', safeSortBy);
  if (safeSortOrder) canonicalQuery.set('sortOrder', safeSortOrder);
  if (safeViewImageAssetId) canonicalQuery.set('viewImageAssetId', safeViewImageAssetId);
  if (safeExpandAssetId) canonicalQuery.set('expandAssetId', safeExpandAssetId);

  const isCanonical =
    (query.page || '1') === String(finalPage) &&
    (query.pageSize || '10') === String(safePageSize) &&
    (query.search || '') === safeSearch &&
    (query.searchField || 'all') === safeSearchField &&
    (query.AssetNo || '') === safeAssetNo &&
    (query.AssetTypeId === safeAssetTypeId || (query.AssetTypeId === undefined && safeAssetTypeId === 'all')) &&
    (query.ZoneId === safeZoneId || (query.ZoneId === undefined && safeZoneId === 'all')) &&
    (query.WardId === finalWardId || (query.WardId === undefined && finalWardId === 'all')) &&
    (query.DepartmentId === safeDepartmentId || (query.DepartmentId === undefined && safeDepartmentId === 'all')) &&
    query.sortBy === safeSortBy &&
    query.sortOrder === safeSortOrder &&
    query.viewImageAssetId === safeViewImageAssetId &&
    query.expandAssetId === safeExpandAssetId;
  if (!isCanonical) {
    const qStr = canonicalQuery.toString();
    redirect(`/${locale}/assets/municipal-Asset/asset-register${qStr ? '?' + qStr : ''}`);
  }

  return (
    <AssetRegisterView
      locale={locale}
      categoryId={undefined}
      categoryName={null}
      safeSearch={safeSearch}
      safeSearchField={safeSearchField}
      AssetNo={safeAssetNo}
      AssetTypeId={safeAssetTypeId}
      ZoneId={safeZoneId}
      WardId={finalWardId}
      DepartmentId={safeDepartmentId}
      safePageSize={safePageSize}
      finalPage={finalPage}
      totalPages={totalPages}
      assetsResult={assetsResult}
      typesResult={typesResult}
      zonesResult={zonesResult}
      wardsResult={wardsResult}
      departmentsResult={departmentsResult}
      updatedDate={updatedDate}
      categoryOptions={categoriesResult}
      sortBy={safeSortBy}
      sortOrder={safeSortOrder}
    />
  );
}
