import {PageContainer} from "@/components/common/PageContainer";
import RateMasterView from "@/components/modules/property-tax/RVRateMaster/RateMasterView";
import AddRateDrawer from "@/components/modules/property-tax/RVRateMaster/AddRateDrawer";
import {getAssessmentYears, getConstructionTypes, getUseGroupOptions, getZoneDescriptionsPaged, getAllZoneDescriptions, getZoneOptions, getRateMasterByFilters, getRateMasterData, getRateMasterPagedAction, getRateFrequencyPolicy, getRateUnitPolicy } from "../action";

// Force dynamic rendering to ensure fresh data on each navigation
export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{
    zone?: string;
    useGroup?: string;
    assessmentYear?: string;
    matrixPage?: string;
    matrixPageSize?: string;
  }>;
};

export default async function AddRatePage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  // Get matrix pagination params from URL
  const matrixPage = Number(params?.matrixPage) || 1;
  const matrixPageSize = Number(params?.matrixPageSize) || 10;
  
  // Get filter values from URL
  const selectedZone = params?.zone;
  const selectedUseGroup = params?.useGroup;
  const selectedYear = params?.assessmentYear;

  const [
    zones,
    useGroups,
    paginatedZonesResult,
    allZonesResult,
    constructionTypes,
    assessmentYears,
    allMasterData,
    rateFrequencyPolicy,
    rateUnitPolicy,
  ] = await Promise.all([
    getZoneOptions(),
    getUseGroupOptions(),
    getZoneDescriptionsPaged(matrixPage, matrixPageSize),
    getAllZoneDescriptions(), // Fetch all zones for copy rates functionality
    getConstructionTypes(),
    getAssessmentYears(),
    getRateMasterData(1, -1), // Get all zones for mapping (pageSize: -1 gets all items)
    getRateFrequencyPolicy(), // Fetch rate frequency policy configuration
    getRateUnitPolicy(), // Fetch rate unit policy configuration
  ]);

  // Extract zone descriptions for rate mapping
  const allZoneDescriptions = allMasterData.zoneDescriptions;

  // Get taxZoneIds for the current page of zones (for server-side filtering)
  const paginatedTaxZoneIds = paginatedZonesResult.items.map(z => z.taxZoneId);

  // Fetch filtered rates using the selected filters from URL (if any)
  const ratesResult = await getRateMasterPagedAction(
    1, 
    -1, // Fetch all matching rates for the filtered zones
    constructionTypes, 
    allZoneDescriptions, 
    selectedZone, 
    selectedUseGroup, 
    selectedYear,
    paginatedTaxZoneIds // Pass only the current page's zone IDs
  );

  const tableData = ratesResult.items;

  // Set initial values from searchParams if present, else fallback to first available options
  const initialZone = params?.zone || (zones && zones.length > 0 ? zones[0].value : "ALL");
  const initialUseGroup = params?.useGroup || (useGroups && useGroups.length > 0 ? useGroups[0].value : "ALL");
  const initialYear = params?.assessmentYear || (assessmentYears && assessmentYears.length > 0 ? assessmentYears[0].value : "ALL");

  // Check for existing rates if filters are provided (for add mode validation)
  let initialExistingRatesCheck = false;
  if (params?.zone && params?.useGroup && params?.assessmentYear) {
    try {
      const existingRates = await getRateMasterByFilters(
        params.zone,
        params.useGroup,
        params.assessmentYear
      );
      initialExistingRatesCheck = existingRates && existingRates.length > 0;
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

  return (
    <>
      <PageContainer className="pt-24">
        <RateMasterView
          rateMasterData={tableData ?? []}
          zones={zones ?? []}
          useGroups={useGroups ?? []}
          assessmentYears={assessmentYears ?? []}
          rateCategories={constructionTypes.map((ct: { constructionId: string; constructionCode?: string; description?: string }) => ({ constructionId: ct.constructionId, constructionCode: ct.constructionCode, description: ct.description }))}
          initialZone={initialZone}
          initialUseGroup={initialUseGroup}
          initialYear={initialYear}
          rateUnitPolicy={rateUnitPolicy}
        />
      </PageContainer>
      <AddRateDrawer
        zones={zones}
        useGroups={useGroups}
        assessmentYears={assessmentYears}
        assessmentYearRanges={assessmentYearRanges}
        zoneDescriptions={paginatedZonesResult.items}
        allZones={allZonesResult}
        rateCategories={constructionTypes.map((ct: { constructionId: string; constructionCode?: string; description?: string }) => ({ constructionId: ct.constructionId, constructionCode: ct.constructionCode, description: ct.description }))}
        paginatedZonesData={paginatedZonesData}
        initialExistingRatesCheck={initialExistingRatesCheck}
        rateFrequencyPolicy={rateFrequencyPolicy}
        rateUnitPolicy={rateUnitPolicy}
      />
    </>
  );
}
