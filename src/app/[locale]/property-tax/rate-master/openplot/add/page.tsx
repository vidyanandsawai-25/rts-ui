import { PageContainer } from "@/components/common/PageContainer";
import RateMasterView from "@/components/modules/property-tax/RVRateMaster/RateMasterView";
import AddRateDrawer from "@/components/modules/property-tax/RVRateMaster/AddRateDrawer";
import {
  getAssessmentYears,
  getZoneDescriptionsPaged,
  getAllZoneDescriptions,
  getZoneOptions,
  getRateMasterByFilters,
  getRateMasterData,
  getRateMasterPagedAction,
  getRateFrequencyPolicy,
  getRateUnitPolicy,
  getOpenPlotTypeOfUseDetailsAction
} from "@/app/[locale]/property-tax/rate-master/rvratemaster/action";
import { ITypeOfUseDetails } from "@/types/RVRateMaster";

// Force dynamic rendering to ensure fresh data on each navigation
export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{
    zone?: string;
    assessmentYear?: string;
    matrixPage?: string;
    matrixPageSize?: string;
  }>;
};

export default async function AddOpenPlotRatePage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Get matrix pagination params from URL
  const matrixPage = Number(params?.matrixPage) || 1;
  const matrixPageSize = Number(params?.matrixPageSize) || 10;

  // Get filter values from URL
  const selectedZone = params?.zone;
  const selectedYear = params?.assessmentYear;

  const [
    zones,
    typeofuseDetailsResult,
    paginatedZonesResult,
    allZonesResult,
    assessmentYears,
    allMasterData,
    rateFrequencyPolicy,
    rateUnitPolicy,
  ] = await Promise.all([
    getZoneOptions(),
    getOpenPlotTypeOfUseDetailsAction(),
    getZoneDescriptionsPaged(matrixPage, matrixPageSize),
    getAllZoneDescriptions(), // Fetch all zones for copy rates functionality
    getAssessmentYears(),
    getRateMasterData(1, -1), // Get all zones for mapping (pageSize: -1 gets all items)
    getRateFrequencyPolicy(), // Fetch rate frequency policy configuration
    getRateUnitPolicy(), // Fetch rate unit policy configuration
  ]);

  const typeofuseDetails = typeofuseDetailsResult.items || [];

  // Extract zone descriptions for rate mapping
  const allZoneDescriptions = allMasterData.zoneDescriptions;

  // Map typeofuse to RateCategory structure for table headers (distinct typeOfUseGroupId)
  const distinctGroupIds = new Set<number>();
  const rateCategories = typeofuseDetails
    .filter((tu: ITypeOfUseDetails) => {
      const groupId = tu.typeOfUseGroupId;
      if (groupId && !distinctGroupIds.has(groupId)) {
        distinctGroupIds.add(groupId);
        return true;
      }
      return false;
    })
    .map((tu: ITypeOfUseDetails) => {
      const associated = typeofuseDetails
        .filter((item: ITypeOfUseDetails) => item.typeOfUseGroupId === tu.typeOfUseGroupId)
        .map((item: ITypeOfUseDetails) => ({
          code: item.typeOfUseCode || "",
          description: item.description || ""
        }));
      return {
        constructionId: String(tu.id),
        constructionCode: tu.typeOfUseCode || String(tu.id),
        description: tu.description || "",
        typeOfUseGroupId: tu.typeOfUseGroupId,
        typeOfUseGroupCode: tu.typeOfUseGroupCode,
        groupName: tu.groupName,
        associatedUseTypes: associated
      };
    });

  // Get taxZoneIds for the current page of zones (for server-side filtering)
  const paginatedTaxZoneIds = paginatedZonesResult.items.map(z => z.taxZoneId);

  // Fetch filtered rates using the selected filters from URL (if any)
  const ratesResult = await getRateMasterPagedAction(
    1,
    -1, // Fetch all matching rates for the filtered zones
    rateCategories,
    allZoneDescriptions,
    selectedZone,
    "ALL", // No useGroup filter for Open Plot
    selectedYear,
    paginatedTaxZoneIds, // Pass only the current page's zone IDs
    true // isOpenPlot is true
  );

  const tableData = ratesResult.items;

  // Set initial values from searchParams if present, else fallback to first available options
  const initialZone = params?.zone || (zones && zones.length > 0 ? zones[0].value : "ALL");
  const initialYear = params?.assessmentYear || (assessmentYears && assessmentYears.length > 0 ? assessmentYears[0].value : "ALL");

  // Check for existing rates if filters are provided (for add mode validation)
  let initialExistingRatesCheck = false;
  if (params?.zone && params?.assessmentYear) {
    try {
      const existingRates = await getRateMasterByFilters(
        params.zone,
        "ALL",
        params.assessmentYear
      );
      const openPlotGroupIds = new Set(rateCategories.map(rc => rc.typeOfUseGroupId).filter(id => id !== undefined && id !== null));
      initialExistingRatesCheck = existingRates && existingRates.some(rate => openPlotGroupIds.has(rate.typeOfUseGroupId));
    } catch {
      initialExistingRatesCheck = false;
    }
  }

  // Prepare paginated zones data for the form
  const paginatedZonesData = {
    items: paginatedZonesResult.items,
    totalPages: paginatedZonesResult.totalPages,
    totalCount: paginatedZonesResult.totalCount,
    pageNumber: matrixPage,
    pageSize: matrixPageSize,
  };

  const assessmentYearRanges = assessmentYears.map((ay: { label: string; value: string; fromYear: string | number; toYear: string | number }) => ({
    label: ay.label,
    value: ay.value,
    fromYear: String(ay.fromYear),
    toYear: String(ay.toYear),
  }));

  // Map distinct typeofuseGroupId to distinct useGroups for Open Plot
  const distinctGroups = new Map<number, string>();
  typeofuseDetails.forEach((tu: ITypeOfUseDetails) => {
    if (tu.typeOfUseGroupId && tu.groupName) {
      distinctGroups.set(tu.typeOfUseGroupId, tu.groupName);
    }
  });
  const openPlotUseGroups = Array.from(distinctGroups.entries()).map(([id, name]) => ({
    value: String(id),
    label: name
  }));

  return (
    <>
      <PageContainer className="pt-24">
        <RateMasterView
          rateMasterData={tableData ?? []}
          zones={zones ?? []}
          useGroups={openPlotUseGroups}
          assessmentYears={assessmentYears ?? []}
          rateCategories={rateCategories}
          initialZone={initialZone}
          initialYear={initialYear}
          rateUnitPolicy={rateUnitPolicy}
          isOpenPlot={true}
        />
      </PageContainer>
      <AddRateDrawer
        zones={zones}
        useGroups={openPlotUseGroups}
        assessmentYears={assessmentYears}
        assessmentYearRanges={assessmentYearRanges}
        zoneDescriptions={paginatedZonesResult.items}
        allZones={allZonesResult}
        rateCategories={rateCategories}
        paginatedZonesData={paginatedZonesData}
        initialExistingRatesCheck={initialExistingRatesCheck}
        rateFrequencyPolicy={rateFrequencyPolicy}
        rateUnitPolicy={rateUnitPolicy}
        isOpenPlot={true}
      />
    </>
  );
}
