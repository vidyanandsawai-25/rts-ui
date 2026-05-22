import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getWardListAction, getPropertyListByWardAction, fetchWardIdAction } from './actions';
import { getInitialData } from './initial-loader';
import { fetchPtisDomainData } from './domain-loader';
import { assembleDualMethodSectionData } from '@/components/modules/property-tax/ptis/dualmethod/dual-method-data';
import type { SearchSelectOption } from '@/components/common/SearchSelect';
import type {
  PropertyListItem,
  Ward,
  PtisInitialData,
  PtisTabId,
} from '@/types/ptis.types';
import { PTIS_TABS } from '@/types/ptis.types';
import { toPositiveInt, toSafeString } from '@/lib/utils/format';
import { parsePtisSearchParams } from '@/lib/utils/params';
import { getFooterActionsAction } from '@/app/[locale]/footer-actions';
import { fetchTaxDetailsByTab } from './TaxDetails/fetchTaxDetails';
import { getUserRoleIdFromCookies } from '@/lib/utils/cookie';
import { FooterAction } from '@/lib/api/footer.service';
import { DEFAULT_PTIS_FOOTER_ACTIONS } from '@/components/modules/property-tax/ptis/constants';

const toValidTab = (value: unknown): PtisTabId => {
  return typeof value === 'string' && (PTIS_TABS as readonly string[]).includes(value)
    ? (value as PtisTabId)
    : 'propertydetails';
};

const isRedirectError = (e: unknown): boolean =>
  typeof e === 'object' && e !== null && 'digest' in e &&
  typeof (e as { digest?: unknown }).digest === 'string' &&
  String((e as { digest: string }).digest).startsWith('NEXT_REDIRECT');

export async function loadPtisPageData(
  resolvedParams: { locale: string },
  resolvedSearchParams: Record<string, string | string[] | undefined>
) {
  const wardNo = toSafeString(resolvedSearchParams?.wardNo);
  const propertyNo = toSafeString(resolvedSearchParams?.propertyNo);
  const rawPartitionNo = toSafeString(resolvedSearchParams?.partitionNo);
  const partitionNo = rawPartitionNo === '0' ? '' : rawPartitionNo;
  const { locale } = resolvedParams;
  const activeTab = toValidTab(resolvedSearchParams?.tab);
  const ptisParams = parsePtisSearchParams(resolvedSearchParams);
  const wardIdParam = toPositiveInt(resolvedSearchParams?.wardId);
  const propertyIdParam = toPositiveInt(resolvedSearchParams?.propertyId);
  const showFloorParam = resolvedSearchParams?.showFloor === 'true';
  const showOldTaxParam = resolvedSearchParams?.showOldTax === 'true';
  const pageNumber = toPositiveInt(resolvedSearchParams?.pageNumber) || 1;
  const pageSize = toPositiveInt(resolvedSearchParams?.pageSize) || 10;
  const searchTerm = toSafeString(resolvedSearchParams?.searchTerm);
  const appartmentTab = toSafeString(resolvedSearchParams?.appartmentTab) || 'amenities';
  
  const cookieStore = await cookies();
  const userRoleId = getUserRoleIdFromCookies(cookieStore);

  const [wardListSettled, initialWardIdSettled, footerActionsSettled] = await Promise.allSettled([
    getWardListAction(),
    !wardIdParam && wardNo ? fetchWardIdAction(wardNo) : Promise.resolve(null),
    userRoleId !== null
      ? getFooterActionsAction(userRoleId, '/property-tax/ptis')
      : Promise.resolve({ success: true, data: [] as FooterAction[] }),
  ]);

  const wardListResult = wardListSettled.status === 'fulfilled'
    ? wardListSettled.value
    : { success: false, error: 'Failed to fetch wards', data: [] as Ward[] };

  const initialWardIdResult = initialWardIdSettled.status === 'fulfilled' ? initialWardIdSettled.value : null;

  let footerActions: FooterAction[] = [];
  if (footerActionsSettled.status === 'fulfilled') {
    const res = footerActionsSettled.value;
    if (res && 'success' in res && res.success) footerActions = res.data;
  }
  if (footerActions.length === 0) footerActions = DEFAULT_PTIS_FOOTER_ACTIONS;

  if (wardListSettled.status === 'rejected' || (!wardListResult.success && (!wardListResult.data || wardListResult.data.length === 0))) {
    const isRateLimited = wardListResult.error?.includes('429') || wardListResult.error?.toLowerCase().includes('too many requests');
    throw new Error(isRateLimited ? 'The system is experiencing high traffic. Please wait a moment and try again.' : wardListResult.error || 'Failed to load critical module data (Ward List)');
  }

  const wardOptions: SearchSelectOption[] = wardListResult.success && wardListResult.data
    ? wardListResult.data.map((w: Ward) => ({
        label: w.wardNo || '',
        value: (w.wardId ?? w.wardID ?? '').toString(),
      }))
    : [];

  let resolvedWardId = wardIdParam;
  if (!resolvedWardId && initialWardIdResult?.success && initialWardIdResult.data?.wardId) {
    resolvedWardId = initialWardIdResult.data.wardId;
  }

  const [propertyListResult, propertyDetailsResult] = await Promise.all([
    resolvedWardId ? getPropertyListByWardAction(resolvedWardId) : Promise.resolve(null),
    getInitialData(wardNo, propertyNo, partitionNo, resolvedWardId, propertyIdParam),
  ]);

  const resolvedPropertyId = propertyIdParam ?? propertyDetailsResult.propertyId;
  const initialError = (!propertyDetailsResult.success && propertyDetailsResult.error) || (propertyListResult && !propertyListResult.success && propertyListResult.error) || undefined;

  let propertyOptions: SearchSelectOption[] = [];
  let rawPropertyData: PropertyListItem[] = [];
  if (resolvedWardId && propertyListResult?.success && propertyListResult.data) {
    rawPropertyData = propertyListResult.data;
    propertyOptions = propertyListResult.data.map((p) => {
      const trimmedPartitionNo = (p.partitionNo ?? '').trim();
      const normalizedPartitionNo = trimmedPartitionNo === '0' ? '' : trimmedPartitionNo;
      return {
        label: `${p.propertyNo}${normalizedPartitionNo ? ` - ${normalizedPartitionNo}` : ''}`,
        value: JSON.stringify({ propertyNo: p.propertyNo, partitionNo: normalizedPartitionNo, propertyId: p.propertyId }),
      };
    });
  }

  const {
    apartmentData,
    rateableResult,
    capitalResult,
    kycDetails,
    societyDetails,
    oldDetails,
    oldFloorTableData,
    oldTaxesData,
  } = await fetchPtisDomainData({
    resolvedWardId,
    propertyNo,
    appartmentTab,
    pageNumber,
    pageSize,
    searchTerm,
    resolvedPropertyId,
  });

  const dualSectionData = ptisParams.tab === 'dual'
    ? await assembleDualMethodSectionData(resolvedPropertyId, oldDetails)
    : undefined;

  const initialData: PtisInitialData = {
    propertyDetails: propertyDetailsResult.propertyDetails,
    kycDetails,
    societyDetails,
    wardOptions,
    propertyOptions,
    rawPropertyData,
    oldDetails,
    oldFloorTableData,
    showOldFloorInfo: showFloorParam,
    oldTaxesData,
    showOldTaxInfo: showOldTaxParam,
  };

  try {
    if (propertyDetailsResult.propertyId && !propertyIdParam) {
      const newParams = new URLSearchParams();
      for (const [key, value] of Object.entries(resolvedSearchParams)) {
        if (value == null) continue;
        const values = Array.isArray(value) ? value : [value];
        values.forEach((v) => { if (v != null) newParams.append(key, v); });
      }
      newParams.set('propertyId', propertyDetailsResult.propertyId.toString());
      redirect(`/${locale}/property-tax/ptis?${newParams.toString()}`);
    }
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;
    throw error;
  }

  const { rateableTaxDetails, capitalTaxDetails, rateableTaxError, capitalTaxError } =
    await fetchTaxDetailsByTab(resolvedPropertyId, ptisParams.tab);

  return {
    locale,
    resolvedPropertyId,
    ptisParams,
    resolvedSearchParams,
    sanitizedInitialError: propertyDetailsResult.error,
    apartmentData,
    dualSectionData,
    resolvedWardId,
    propertyNo,
    rateableResult,
    capitalResult,
    rateableTaxDetails,
    rateableTaxError,
    capitalTaxDetails,
    capitalTaxError,
    activeTab,
    initialError,
    initialData,
    footerActions,
    pageNumber,
    appartmentTab,
  };
}
