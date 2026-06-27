import { redirect } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { parsePtisSearchParams } from '@/lib/utils/params';
import { toSafeString } from '@/lib/utils/format';
import { getPtisUserSafeErrorMessage } from '@/components/modules/property-tax/ptis/shared/valuation-fetch';
import { defaultOldDetails } from '@/lib/constants/ptis.constants';
import { FALLBACK_FOOTER_ACTIONS } from '@/config/footer-fallback';
import { FOOTER_REGISTRY, DEFAULT_ACTION_STYLE } from '@/config/footer-registry';
import { FooterAction } from '@/lib/api/footer.service';

import { BottomActionBar } from '@/components/layout/BottomActionBar';
import { PtisBackButton, PtisFooterDropdowns } from '@/components/modules/property-tax/ptis/PtisFooterControls';
import PtisMainScreen from '@/components/modules/property-tax/ptis/PtisMainScreen';
import PropertyTabSection from '@/components/modules/property-tax/ptis/PropertyTabSection';
import { PtisLayoutWrapper } from '@/components/modules/property-tax/ptis/PtisLayoutWrapper';
import { RateableTaxDetailsSection } from '@/components/modules/property-tax/ptis/rateable';
import { CapitalTaxDetailsSection } from '@/components/modules/property-tax/ptis/capital';

import { fetchPtisPageData } from './ptis-fetch.service';
import { PtisNavigationProvider } from '@/components/modules/property-tax/ptis/shared/PtisNavigationContext';
import { PtisInitialData } from '@/types/ptis.types';

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
      valuationTab?: string;
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

  // 1. Fetch all data concurrently on the server
  const pageData = await fetchPtisPageData(resolvedSearchParams, locale);

  // 2. Perform URL normalization redirects
  if (pageData.shouldRedirect && pageData.redirectUrl) {
    redirect(pageData.redirectUrl);
  }

  const {
    criticalError,
    resolvedPropertyId,
    resolvedWardId,
    initialMediaPanelVisible,
    propertyDetailsResult,
    rawPropertyData,
    propertyOptions,
    wardOptions,
    kycDetails,
    societyDetails,
    buildingPermission,
    oldDetails,
    oldFloorTableData,
    oldTaxesData,
    discountDetails,
    apartmentData,
    rateableResult,
    capitalResult,
    dualSectionData,
    initialPhotoSlots,
    initialPhotos,
    showFloorParam,
    showOldTaxParam,
    showDetailsParam,
    rateableTaxDetails,
    capitalTaxDetails,
    rateableTaxError,
    capitalTaxError,
    activeTab,
    hasAppliedRules,
    appliedRulesList
  } = pageData;

  const ptisParams = parsePtisSearchParams(resolvedSearchParams);
  const valuationTab = ptisParams.tab;

  const wardNo = toSafeString(resolvedSearchParams?.wardNo);
  const propertyNo = toSafeString(resolvedSearchParams?.propertyNo);
  const rawPartitionNo = toSafeString(resolvedSearchParams?.partitionNo);
  const partitionNo = rawPartitionNo === '0' ? '' : rawPartitionNo;

  const initialError =
    (!propertyDetailsResult.success && propertyDetailsResult.error) || undefined;

  const sanitizedInitialError = propertyDetailsResult.error
    ? getPtisUserSafeErrorMessage(propertyDetailsResult.error, undefined, t('error.generic'), t)
    : undefined;

  const initialData: PtisInitialData = {
    propertyDetails: propertyDetailsResult.propertyDetails,
    kycDetails,
    societyDetails,
    buildingPermission,
    wardOptions,
    propertyOptions,
    rawPropertyData,
    oldDetails,
    oldFloorTableData,
    showOldFloorInfo: showFloorParam,
    oldTaxesData,
    showOldTaxInfo: showOldTaxParam,
    discountDetails,
  };

  const footerActions: FooterAction[] = FALLBACK_FOOTER_ACTIONS.map((action, index) => {
    const baseStyle = FOOTER_REGISTRY[action.actionCommand] || DEFAULT_ACTION_STYLE;
    return {
      id: index + 1000,
      ...action,
      style: {
        ...baseStyle,
        iconName: action.lucideIcon || baseStyle.iconName,
      },
    };
  });

  return (
    <PtisNavigationProvider properties={rawPropertyData}>
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
        <PtisLayoutWrapper
          wardNo={wardNo}
          propertyNo={propertyNo}
          partitionNo={partitionNo}
          propertyHolderName={kycDetails.propertyHolderName || ''}
          propertyHolderNameMarathi={kycDetails.propertyHolderNameMarathi || ''}
          isQCApproved={false}
          propertyId={resolvedPropertyId}
          initialPhotoSlots={initialPhotoSlots}
          initialPhotos={initialPhotos}
          initialMediaPanelVisible={initialMediaPanelVisible}
        >
          <div className="flex flex-col gap-6 w-full">
            <PropertyTabSection
              initialData={initialData}
              initialWardId={resolvedWardId}
              initialTab={ptisParams.tab === 'apartment' ? 'societydetails' : activeTab}
              initialError={initialError}
            />
            <PtisMainScreen
              locale={locale}
              propertyId={resolvedPropertyId}
            categoryId={propertyDetailsResult.propertyDetails.categoryId}
              ptisParams={ptisParams}
              resolvedSearchParams={resolvedSearchParams}
              error={sanitizedInitialError}
              initialApartmentData={apartmentData}
              initialDualSectionData={dualSectionData}
              wardId={resolvedWardId}
              propertyNo={propertyNo}
              hasAppliedRules={hasAppliedRules || false}
              appliedRules={appliedRulesList || []}
              rateableSection={
                <RateableTaxDetailsSection
                  rateableData={rateableResult?.success ? rateableResult.data : null}
                  error={!rateableResult?.success ? rateableResult?.error : undefined}
                  hasFetchedData={rateableResult != null}
                  oldDetails={initialData.oldDetails || defaultOldDetails}
                  propertyId={resolvedPropertyId}
                  searchParams={resolvedSearchParams as Record<string, string | string[] | undefined>}
                  initialTaxDetails={rateableTaxDetails}
                  taxDetailsError={rateableTaxError}
                  locale={locale}
                />
              }
              capitalSection={
                valuationTab === 'capital' ? (
                  <CapitalTaxDetailsSection
                    capitalData={capitalResult?.success ? capitalResult.data : null}
                    error={!capitalResult?.success ? capitalResult?.error : undefined}
                    hasFetchedData={capitalResult != null}
                    oldDetails={initialData.oldDetails || defaultOldDetails}
                    propertyId={resolvedPropertyId}
                    searchParams={resolvedSearchParams as Record<string, string | string[] | undefined>}
                    initialTaxDetails={capitalTaxDetails}
                    taxDetailsError={capitalTaxError}
                    locale={locale}
                  />
                ) : null
              }
              dualRateableSection={
                valuationTab === 'dual' && showDetailsParam ? (
                  <RateableTaxDetailsSection
                    rateableData={dualSectionData?.initialRateableData || null}
                    error={dualSectionData?.rateableError}
                    hasFetchedData={dualSectionData != null}
                    oldDetails={initialData.oldDetails || defaultOldDetails}
                    propertyId={resolvedPropertyId}
                    searchParams={resolvedSearchParams as Record<string, string | string[] | undefined>}
                    locale={locale}
                    initialTaxDetails={rateableTaxDetails}
                    taxDetailsError={rateableTaxError}
                    showInlineError={false}
                  />
                ) : null
              }
              dualCapitalSection={
                valuationTab === 'dual' && showDetailsParam ? (
                  <CapitalTaxDetailsSection
                    capitalData={dualSectionData?.initialCapitalData || null}
                    error={dualSectionData?.capitalError}
                    hasFetchedData={dualSectionData != null}
                    oldDetails={initialData.oldDetails || defaultOldDetails}
                    propertyId={resolvedPropertyId}
                    searchParams={resolvedSearchParams as Record<string, string | string[] | undefined>}
                    locale={locale}
                    initialTaxDetails={capitalTaxDetails}
                    taxDetailsError={capitalTaxError}
                    showInlineError={false}
                  />
                ) : null
              }
            />
          </div>
        </PtisLayoutWrapper>
        <BottomActionBar
          actions={footerActions}
          properties={rawPropertyData}
          leftContent={<PtisBackButton />}
          rightContent={<PtisFooterDropdowns />}
          categoryId={propertyDetailsResult.propertyDetails.categoryId}
          societyDetailId={societyDetails.societyDetailId}
        />
      </div>
    </PtisNavigationProvider>
  );
}
