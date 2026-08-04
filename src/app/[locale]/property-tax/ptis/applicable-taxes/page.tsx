import { ApplicableTaxes } from "@/components/modules/property-tax/ptis/applicable-taxes/ApplicableTaxes";
import { setRequestLocale, getTranslations } from 'next-intl/server';
import {
  getAssessmentYearsAction,
  getTypeOfUseAction,
  getTaxApplicabilityAction
} from './action';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ApplicablePage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("applicableTaxes");

  const searchParamsResolved = await searchParams;
  const valuationTab = typeof searchParamsResolved.valuationTab === 'string' ? searchParamsResolved.valuationTab : '';
  const propertyIdStr = typeof searchParamsResolved.propertyId === 'string' ? searchParamsResolved.propertyId : '';
  const propertyId = propertyIdStr ? Number(propertyIdStr) : NaN;

  const selectedAsseYear = typeof searchParamsResolved.asseYear === 'string' ? searchParamsResolved.asseYear : '';
  const selectedFloorUse = typeof searchParamsResolved.floorUse === 'string' ? searchParamsResolved.floorUse : '';

  const pageNumber = typeof searchParamsResolved.pageNumber === 'string' ? Number(searchParamsResolved.pageNumber) : 1;
  const pageSize = typeof searchParamsResolved.pageSize === 'string' ? Number(searchParamsResolved.pageSize) : 10;

  const [asseYearsResponse, useGroupsResponse] = await Promise.all([
    getAssessmentYearsAction(valuationTab, 1, -1),
    getTypeOfUseAction(1, -1),
  ]);

  if (!asseYearsResponse.success) {
    throw new Error(asseYearsResponse.error || t("errors.fetchAssessmentYears"));
  }
  if (!useGroupsResponse.success) {
    throw new Error(useGroupsResponse.error || t("errors.fetchUseGroups"));
  }

  let finalAsseYear = selectedAsseYear;

  if (!finalAsseYear && asseYearsResponse.data?.items?.length) {
    const currentYear = new Date().getFullYear();
    const activeYears = asseYearsResponse.data.items.filter(y => y.isActive);
    const currentYearItem = activeYears.find(y => currentYear >= y.fromYear && currentYear <= y.toYear) || activeYears[0];
    if (currentYearItem) {
      finalAsseYear = String(currentYearItem.id);
    }
  }

  const financialYearId = finalAsseYear
    ? Number(finalAsseYear)
    : undefined;

  const typeOfUseGroupId = selectedFloorUse
    ? Number(selectedFloorUse)
    : undefined;

  const rvOrCv = valuationTab === 'capital' ? 'CV' : 'RV';

  let taxApplicabilityResponse = null;
  if (!isNaN(propertyId) && financialYearId !== undefined && typeOfUseGroupId !== undefined) {
    const taxApplicabilityResult = await getTaxApplicabilityAction({
      propertyId,
      financialYearId,
      typeOfUseGroupId,
      rvOrCv,
      pageNumber,
      pageSize,
    });
    if (!taxApplicabilityResult.success) {
      throw new Error(taxApplicabilityResult.error || t("errors.fetchTaxApplicability"));
    }
    taxApplicabilityResponse = taxApplicabilityResult.data || null;
  }
  
  return (
    <ApplicableTaxes
      asseYearsResponse={asseYearsResponse.data ?? null}
      useGroupsResponse={useGroupsResponse.data ?? null}
      valuationTab={valuationTab}
      taxApplicabilityPagedResponse={taxApplicabilityResponse}
    />
  );
}
