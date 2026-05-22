import PropertyTabSection from '@/components/modules/property-tax/ptis/PropertyTabSection';
import {
  defaultPropertyDetails,
  defaultKycDetails,
  defaultSocietyDetails,
  defaultOldDetails,
} from '@/lib/constants/ptis.constants';
import { AlertCircle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import PtisMainScreen from '@/components/modules/property-tax/ptis/PtisMainScreen';
import { getPtisUserSafeErrorMessage } from '@/components/modules/property-tax/ptis/shared/valuation-fetch';
import { RateableTaxDetailsSection } from '@/components/modules/property-tax/ptis/rateable';
import { CapitalTaxDetailsSection } from '@/components/modules/property-tax/ptis/capital';
import { BottomActionBar } from '@/components/layout/BottomActionBar';
import { PtisFooterControls } from '@/components/modules/property-tax/ptis/PtisFooterControls';
import { loadPtisPageData } from './loader';

interface PtisPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<
    Record<string, string | string[] | undefined> & {
      wardNo?: string;
      propertyNo?: string;
      partitionNo?: string;
      propertyId?: string;
      wardId?: string;
      tab?: string;
      showFloor?: string;
      showOldTax?: string;
    }
  >;
}

export default async function PtisPage({ params, searchParams }: PtisPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { locale } = resolvedParams;
  const t = await getTranslations({ locale, namespace: 'ptis' });

  let criticalError: string | undefined = undefined;
  let data: Awaited<ReturnType<typeof loadPtisPageData>> | null = null;

  try {
    data = await loadPtisPageData(resolvedParams, resolvedSearchParams);
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'digest' in error &&
      typeof (error as { digest?: unknown }).digest === 'string' &&
      String((error as { digest: string }).digest).startsWith('NEXT_REDIRECT')
    ) {
      throw error;
    }
    criticalError = error instanceof Error ? error.message : 'An unexpected error occurred.';
  }

  const pageData = data || {
    locale,
    resolvedPropertyId: undefined,
    ptisParams: { tab: 'rateable' as const },
    resolvedSearchParams,
    sanitizedInitialError: criticalError,
    apartmentData: {
      amenities: { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 1, hasPrevious: false, hasNext: false },
      commercial: { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 1, hasPrevious: false, hasNext: false },
      residential: { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 1, hasPrevious: false, hasNext: false },
    },
    dualSectionData: undefined,
    resolvedWardId: undefined,
    propertyNo: '',
    rateableResult: null,
    capitalResult: null,
    rateableTaxDetails: undefined,
    rateableTaxError: undefined,
    capitalTaxDetails: undefined,
    capitalTaxError: undefined,
    activeTab: 'propertydetails' as const,
    initialError: undefined,
    initialData: {
      propertyDetails: defaultPropertyDetails,
      kycDetails: defaultKycDetails,
      societyDetails: defaultSocietyDetails,
      wardOptions: [],
      propertyOptions: [],
      rawPropertyData: [],
      oldDetails: defaultOldDetails,
      oldFloorTableData: [],
      showOldFloorInfo: false,
      oldTaxesData: null,
      showOldTaxInfo: false,
    },
    footerActions: [],
    pageNumber: 1,
    appartmentTab: 'amenities',
  };

  const sanitizedInitialError = pageData.sanitizedInitialError
    ? getPtisUserSafeErrorMessage(
        pageData.sanitizedInitialError,
        undefined,
        t('error.generic')
      )
    : undefined;

  return (
    <div className="flex flex-col gap-6 pb-24">
      {criticalError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold">{t('error.networkError.title')}</p>
            <p className="text-sm mt-0.5">{criticalError}</p>
          </div>
        </div>
      )}
      <PropertyTabSection
        initialData={pageData.initialData}
        initialWardId={pageData.resolvedWardId}
        initialTab={pageData.activeTab}
        initialError={pageData.initialError}
      />
      <PtisMainScreen
        locale={pageData.locale}
        propertyId={pageData.resolvedPropertyId}
        ptisParams={pageData.ptisParams}
        resolvedSearchParams={pageData.resolvedSearchParams}
        error={sanitizedInitialError}
        initialApartmentData={pageData.apartmentData}
        initialDualSectionData={pageData.dualSectionData}
        wardId={pageData.resolvedWardId}
        propertyNo={pageData.propertyNo}
        rateableSection={
          <RateableTaxDetailsSection
            rateableData={pageData.rateableResult?.success ? pageData.rateableResult.data : null}
            error={!pageData.rateableResult?.success ? pageData.rateableResult?.error : undefined}
            hasFetchedData={pageData.rateableResult != null}
            oldDetails={pageData.initialData.oldDetails || defaultOldDetails}
            propertyId={pageData.resolvedPropertyId}
            searchParams={pageData.resolvedSearchParams as Record<string, string | string[] | undefined>}
            initialTaxDetails={pageData.rateableTaxDetails}
            taxDetailsError={pageData.rateableTaxError}
            locale={pageData.locale}
          />
        }
        capitalSection={
          <CapitalTaxDetailsSection
            capitalData={pageData.capitalResult?.success ? pageData.capitalResult.data : null}
            error={!pageData.capitalResult?.success ? pageData.capitalResult?.error : undefined}
            hasFetchedData={pageData.capitalResult != null}
            oldDetails={pageData.initialData.oldDetails || defaultOldDetails}
            propertyId={pageData.resolvedPropertyId}
            searchParams={pageData.resolvedSearchParams as Record<string, string | string[] | undefined>}
            initialTaxDetails={pageData.capitalTaxDetails}
            taxDetailsError={pageData.capitalTaxError}
            locale={pageData.locale}
          />
        }
        dualRateableSection={
          <RateableTaxDetailsSection
            rateableData={pageData.dualSectionData?.initialRateableData || null}
            error={pageData.dualSectionData?.rateableError}
            hasFetchedData={pageData.dualSectionData != null}
            oldDetails={pageData.initialData.oldDetails || defaultOldDetails}
            propertyId={pageData.resolvedPropertyId}
            searchParams={pageData.resolvedSearchParams as Record<string, string | string[] | undefined>}
            locale={pageData.locale}
            initialTaxDetails={pageData.rateableTaxDetails}
            taxDetailsError={pageData.rateableTaxError}
            showInlineError={false}
          />
        }
        dualCapitalSection={
          <CapitalTaxDetailsSection
            capitalData={pageData.dualSectionData?.initialCapitalData || null}
            error={pageData.dualSectionData?.capitalError}
            hasFetchedData={pageData.dualSectionData != null}
            oldDetails={pageData.initialData.oldDetails || defaultOldDetails}
            propertyId={pageData.resolvedPropertyId}
            searchParams={pageData.resolvedSearchParams as Record<string, string | string[] | undefined>}
            locale={pageData.locale}
            initialTaxDetails={pageData.capitalTaxDetails}
            taxDetailsError={pageData.capitalTaxError}
            showInlineError={false}
          />
        }
      />
      <BottomActionBar
        actions={pageData.footerActions}
        currentPage={pageData.pageNumber}
        totalPages={
          (pageData.appartmentTab === 'commercial'
            ? pageData.apartmentData?.commercial?.totalPages
            : pageData.appartmentTab === 'residential'
            ? pageData.apartmentData?.residential?.totalPages
            : pageData.apartmentData?.amenities?.totalPages) ?? 1
        }
        leftContent={<PtisFooterControls />}
      />
    </div>
  );
}