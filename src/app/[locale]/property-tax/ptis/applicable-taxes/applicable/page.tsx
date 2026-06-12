import { ApplicableTaxes } from "@/components/modules/property-tax/ptis/applicable-taxes/ApplicableTaxes";
import { setRequestLocale, getTranslations } from 'next-intl/server';
import {
  getAssessmentYearsAction,
  getUseGroupsAction,
  getTaxApplicabilityAction
} from '../action';

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

  const [asseYearsResponse, useGroupsResponse] = await Promise.all([
    getAssessmentYearsAction(valuationTab, 1, -1),
    getUseGroupsAction(1, -1),
  ]);

  if (!asseYearsResponse.success) {
    throw new Error(asseYearsResponse.error || t("errors.fetchAssessmentYears"));
  }
  if (!useGroupsResponse.success) {
    throw new Error(useGroupsResponse.error || t("errors.fetchUseGroups"));
  }

  const financialYearId = selectedAsseYear
    ? Number(selectedAsseYear)
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
      taxApplicabilityResponse={taxApplicabilityResponse?.applicableTaxes || []}
      applicableCount={taxApplicabilityResponse?.applicableCount || 0}
      exemptedCount={taxApplicabilityResponse?.exemptedCount || 0}
    />
  );
}