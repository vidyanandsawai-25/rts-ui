import RateMasterView from "@/components/modules/property-tax/RVRateMaster/RateMasterView";
import {
  getRateMasterData,
  getZoneDescriptionsPaged,
  getRateUnitPolicy,
  getRateFrequencyPolicy,
  getGlobalFrequencyMismatch
} from "@/app/[locale]/property-tax/rate-master/rvratemaster/action";
import { getRateMasterPaged } from "@/lib/api/rvRateMaster";

// Force dynamic rendering to ensure fresh data on each navigation
export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    zone?: string;
    useGroup?: string;
    year?: string;
  }>;
};

const RateMasterPageServer = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  
  // For zone pagination: pageSize refers to number of ZONES, not records
  const zonePage = Number(params?.page) || 1;
  const zonePageSize = Number(params?.pageSize) || 10;

  // Fetch all master data in one call (for mapping, fetch all zones, not just paginated)
  const [
    allMasterData,
    paginatedZonesResult,
    rateUnitPolicy,
    rateFrequencyPolicy
  ] = await Promise.all([
    getRateMasterData(1, -1), 
    getZoneDescriptionsPaged(zonePage, zonePageSize),
    getRateUnitPolicy(),
    getRateFrequencyPolicy()
  ]);

  const {
    constructionTypes,
    rateSections: zones,
    useGroups,
    assessmentYears,
    zoneDescriptions // all zones, not paged
  } = allMasterData;

  // Determine initial/selected values
  const selectedZone = params?.zone || (zones.length > 0 ? zones[0].value : "ALL");
  // Get the first valid use group (not "ALL")
  const firstValidUseGroup = useGroups.find((u) => u.value && u.value !== 'ALL');
  const selectedUseGroup = params?.useGroup || (firstValidUseGroup?.value ?? '');
  const selectedYear = params?.year || (assessmentYears.length > 0 ? assessmentYears[0].value : "ALL");

  // STEP 1: Use paginated zones for UI
  const paginatedZones = paginatedZonesResult.items;
  const totalZonePages = paginatedZonesResult.totalPages;
  const totalZonesCount = paginatedZonesResult.totalCount;

  // STEP 2: Get taxZoneIds for the current page of zones (for server-side filtering)
  const paginatedTaxZoneIds = paginatedZones.map(z => z.taxZoneId);

  // STEP 3: Fetch ONLY rates for the paginated zones (server-side zone pagination)
  const ratesResult = await getRateMasterPaged(
    1, 
    -1, // Fetch all matching rates for the filtered zones
    constructionTypes, 
    zoneDescriptions, 
    selectedZone, 
    selectedUseGroup, 
    selectedYear,
    paginatedTaxZoneIds // Pass only the current page's zone IDs
  );

  // Use the filtered rates directly (already filtered by taxZoneIds in getRateMasterPaged)
  const filteredRates = ratesResult.items;

  // STEP 4: Check for global frequency mismatch
  const globalFrequencyMismatch = await getGlobalFrequencyMismatch(
    rateFrequencyPolicy, 
    constructionTypes, 
    zoneDescriptions
  );

  return (
    <RateMasterView
      rateMasterData={filteredRates}
      pageNumber={zonePage}
      pageSize={zonePageSize}
      totalPages={totalZonePages}
      totalCount={totalZonesCount}
      zones={zones ?? []}
      useGroups={useGroups ?? []}
      assessmentYears={assessmentYears ?? []}
      rateCategories={constructionTypes.map((ct: { constructionId: string; constructionCode?: string; description?: string }) => ({ 
        constructionId: ct.constructionId, 
        constructionCode: ct.constructionCode || ct.constructionId,
        description: ct.description 
      }))}
      zoneDescriptions={zoneDescriptions ?? []}
      initialZone={selectedZone}
      initialUseGroup={selectedUseGroup}
      initialYear={selectedYear}
      rateUnitPolicy={rateUnitPolicy}
      rateFrequencyPolicy={rateFrequencyPolicy}
      globalFrequencyMismatch={globalFrequencyMismatch}
    />
  );
};

export default RateMasterPageServer;

