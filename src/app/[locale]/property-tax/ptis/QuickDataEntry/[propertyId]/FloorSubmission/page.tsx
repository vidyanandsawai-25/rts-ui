import { setRequestLocale } from 'next-intl/server';
import FloorSubmission from '@/components/modules/property-tax/ptis/QuickDataEntry/floorSubmission/FloorSubmission';
import { FloorSubmissionErrorBoundary } from '@/components/modules/property-tax/ptis/QuickDataEntry/floorSubmission/error/FloorSubmissionErrorBoundary';
import { FloorResponse, ConstructionTypeResponse, TypeOfUseApiItem, SubFloorResponse, SubTypeOfUseResponse } from '@/types/floor-details.types';
import { FloorData } from '@/types/room-details.types';
import { normalizeObjectResponse, normalizeArrayResponse, normalizeWrappedResponse, } from '@/lib/utils/action-response-helpers';
import { getFloorDataAction, getConstructionTypeDataAction, getTypeOfUseDataAction, getSubFloorDataAction, getSubTypeOfUseDataAction, getQuickDataEntryAction, getPropertyByDetailsAction, getFloorByIdAction, getFloorSubmissionsByOwnerAction, } from './actions';

// Force dynamic rendering — this page relies on per-request search params.
export const dynamic = 'force-dynamic';

// ─── Type Definitions ────────────────────────────────────────────────────────

interface PageProps {
    params: Promise<{ locale: string; propertyId: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Safely extract a single string value from a search-param entry. */
function asString(value: string | string[] | undefined): string {
    return typeof value === 'string' ? value : '';
}

/** Extract a numeric property ID from a raw API response object. */
function extractPropertyId(
    obj: Record<string, unknown>
): string | number | undefined {
    return (
        (obj.ownerID as string | number | undefined) ??
        (obj.ownerId as string | number | undefined) ??
        (obj.propertyId as string | number | undefined) ??
        (obj.id as string | number | undefined)
    );
}

/** Extract property ID from floor data (checks multiple possible field names) */
function getFloorPropertyId(floor: unknown): string | null {
    if (!floor || typeof floor !== 'object') {
        return null;
    }
    const floorObj = floor as Record<string, unknown>;

    // Check all possible property ID field names from API responses
    const propertyId =
        floorObj.ownerID ??          // Primary field from FloorAPIResponse
        floorObj.ownerId ??          // Alternate field from FloorAPIResponse  
        floorObj.propertyId ??       // Standard propertyId field
        floorObj.propertyID ??       // Alternate casing
        floorObj.ownerPropertyId;    // Legacy field name

    return propertyId !== undefined && propertyId !== null
        ? String(propertyId)
        : null;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function FloorSubmissionPage({
    params,
    searchParams,
}: PageProps): Promise<React.JSX.Element> {
    const { locale, propertyId } = await params;
    setRequestLocale(locale);

    const sp = await searchParams;

    // ── URL params ──────────────────────────────────────────────────────────
    const wardNo = asString(sp.wardNo);
    const propertyNo = asString(sp.propertyNo);
    const partitionNo = asString(sp.partitionNo);
    const propertyIdSp = asString(sp.propertyId);   // from URL (may be pre-set)
    const floorId = asString(sp.floorId);
    const typeOfUseId = asString(sp.typeOfUseId);

    const hasPropertyKeys = !!(wardNo && propertyNo && partitionNo);
    const knownPropertyId = propertyId || propertyIdSp || undefined;

    // ── Phase 1: Dynamic Data Fetching (On-Demand Pattern) ──────────────────
    // Only fetch dropdown lookups if requested or if editing a floor
    const shouldLoadAll = !!floorId;

    // Determine if we need subtype data upfront
    const shouldLoadSubType = shouldLoadAll || asString(sp.loadSubType) === 'true';
    const effectiveUseIdForPrefetch = shouldLoadSubType ? typeOfUseId : undefined;

    const [
        floorDataResult,
        constructionTypeDataResult,
        useDataResult,
        subFloorDataResult,
        subTypeDataResult,
        quickDataRaw,
        propertyRaw,
        floorDetailRaw,
        initialFloorsRaw,
    ] = await Promise.all([
        (shouldLoadAll || asString(sp.loadFloor) === 'true') ? getFloorDataAction() : Promise.resolve([]),
        (shouldLoadAll || asString(sp.loadConstruction) === 'true') ? getConstructionTypeDataAction() : Promise.resolve([]),
        (shouldLoadAll || asString(sp.loadUsage) === 'true') ? getTypeOfUseDataAction() : Promise.resolve([]),
        (shouldLoadAll || asString(sp.loadSubFloor) === 'true') ? getSubFloorDataAction() : Promise.resolve([]),
        shouldLoadSubType ? getSubTypeOfUseDataAction(effectiveUseIdForPrefetch) : Promise.resolve([]),
        hasPropertyKeys ? getQuickDataEntryAction(wardNo, propertyNo, partitionNo) : Promise.resolve(null),
        hasPropertyKeys ? getPropertyByDetailsAction(wardNo, propertyNo, partitionNo) : Promise.resolve(null),
        (floorId && floorId !== 'new') ? getFloorByIdAction(floorId) : Promise.resolve(null),
        (knownPropertyId && !hasPropertyKeys) ? getFloorSubmissionsByOwnerAction(knownPropertyId) : Promise.resolve([]),
    ]);

    // Extract errors and data
    const metadataErrors: string[] = [];

    /** 
     * Validates API result and returns data or empty array.
     * Pushes error keys to metadataErrors instead of throwing to prevent page crash.
     */
    function checkResult<T>(res: unknown, _name: string): T[] {
        if (res && typeof res === 'object' && 'success' in res && !res.success) {
            const errorKey = (res as { error?: string }).error;

            // If error is a translation key, collect it
            if (errorKey) {
                // Normalize key for use with client-side t() function
                // FloorSubmission component uses t = useTranslations('quickDataEntry')
                const normalizedKey = errorKey.startsWith('quickDataEntry.')
                    ? errorKey.replace('quickDataEntry.', '')
                    : errorKey;
                metadataErrors.push(normalizedKey);
            } else {
                // Use i18n key for fallback error
                const fallbackErrorKey = 'quickDataEntry.floorSubmission.errors.fetchFailed';
                const normalizedFallbackErrorKey = fallbackErrorKey.replace('quickDataEntry.', '');
                metadataErrors.push(normalizedFallbackErrorKey);
            }
            return [];
        }
        return Array.isArray(res) ? res as T[] : [];
    }

    const floorData = checkResult<FloorResponse>(floorDataResult, 'Floor data');
    const constructionTypeData = checkResult<ConstructionTypeResponse>(constructionTypeDataResult, 'Construction types');
    const useData = checkResult<TypeOfUseApiItem>(useDataResult, 'Usage types');
    const subFloorData = checkResult<SubFloorResponse>(subFloorDataResult, 'Sub-floor data');
    let subTypeData = checkResult<SubTypeOfUseResponse>(subTypeDataResult, 'Sub-usage types');

    // ── Resolve property data & ID ──────────────────────────────────────────
    const quickData = normalizeObjectResponse(quickDataRaw, (m) => metadataErrors.push(m));
    const propertyData = normalizeObjectResponse(propertyRaw, (m) => metadataErrors.push(m));

    const quickDataPropertyID = quickData ? extractPropertyId(quickData) : undefined;
    const propertyDataPropertyID = propertyData ? extractPropertyId(propertyData) : undefined;

    const initialPropertyID: string | number | undefined =
        quickDataPropertyID ?? propertyDataPropertyID ?? knownPropertyId;
    const initialPropertyData: Record<string, unknown> | null = quickData ?? propertyData;

    // ── Floor List (already fetched in Phase 1 if propertyId was known) ─────
    let finalFloorsRaw = initialFloorsRaw;
    if (initialPropertyID && (!knownPropertyId || (hasPropertyKeys && String(knownPropertyId) !== String(initialPropertyID)))) {
        finalFloorsRaw = await getFloorSubmissionsByOwnerAction(initialPropertyID);
    }

    const initialFloors: unknown[] = normalizeArrayResponse(finalFloorsRaw, (m) => metadataErrors.push(m));

    // ── Security & Details Resolution ───────────────────────────────────────
    let initialFloorDetails = normalizeWrappedResponse(floorDetailRaw, (m) => metadataErrors.push(m));
    const expectedPropertyId = initialPropertyID !== undefined && initialPropertyID !== null ? String(initialPropertyID) : null;

    if (floorId && floorId !== 'new' && expectedPropertyId) {
        let isBelonging = false;

        // Check 1: Via the floors list (if available)
        if (Array.isArray(initialFloors) && initialFloors.length > 0) {
            isBelonging = initialFloors.some((f) => String((f as FloorData).id) === String(floorId));
        }

        // Check 2: Via direct floor property ID (Defense-in-depth)
        if (!isBelonging && initialFloorDetails) {
            const fetchedFloorPropertyId = getFloorPropertyId(initialFloorDetails);
            isBelonging = fetchedFloorPropertyId === expectedPropertyId;
        }

        if (!isBelonging) {
            metadataErrors.push('floor.errors.invalidFloorIdForProperty');
            initialFloorDetails = null;
        }
    }

    // ── Sub-type lookup (refetch if floor details provide different useId) ──
    let effectiveUseId = (typeOfUseId && typeOfUseId !== 'undefined' && typeOfUseId !== 'null') ? typeOfUseId : undefined;

    // Ensure subtype list matches the floor's actual usage if editing
    if (initialFloorDetails && typeof initialFloorDetails === 'object') {
        const floorUseId = (initialFloorDetails as Record<string, unknown>).typeOfUseId;
        if (floorUseId) {
            const floorUseIdStr = String(floorUseId);
            // Only refetch if different from what we already loaded
            if (floorUseIdStr !== effectiveUseIdForPrefetch) {
                effectiveUseId = floorUseIdStr;
                const refetchedSubTypeResult = await getSubTypeOfUseDataAction(effectiveUseId);
                subTypeData = checkResult<SubTypeOfUseResponse>(refetchedSubTypeResult, 'Sub-usage types');
            } else {
                effectiveUseId = floorUseIdStr;
            }
        }
    }

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <FloorSubmissionErrorBoundary>
            <FloorSubmission
                key={initialPropertyID ? String(initialPropertyID) : 'new'}
                floorOptions={floorData}
                constructionTypeOptions={constructionTypeData}
                useOptions={useData}
                subFloorOptions={subFloorData}
                subTypeOptions={[]}
                floorData={floorData}
                constructionTypeData={constructionTypeData}
                useData={useData}
                subFloorData={subFloorData}
                subTypeData={subTypeData}
                wardNo={wardNo}
                propertyNo={propertyNo}
                partitionNo={partitionNo}
                initialPropertyData={initialPropertyData}
                initialPropertyID={initialPropertyID}
                initialFloors={initialFloors}
                initialFloorDetails={initialFloorDetails}
                locale={locale}
                apiErrors={metadataErrors}
            />
        </FloorSubmissionErrorBoundary>
    );
}