import React from "react";

import { fetchNatureFactorCVMasterPagedServerAction } from "./actions";
import { getAssessmentYearsPagedServerCV } from "@/lib/api/natureofbuilding-cv-weightageMaster.service";
import { fetchConstructionPagedServerAction } from "../../constructiontype/action";
import { NatureFactorCvPageProps, NatureFactorCVMasterSearchParams } from "@/types/natureofbuilding-cv-weightageMaster.types";
import NatureFactorCVMaster from "@/components/modules/property-tax/weightage-mastercv/natureFactorCv/NatureFactorCVMaster";

// Pagination constraints
const MIN_PAGE = 1;
const MAX_PAGE = 10_000;
const MIN_PAGE_SIZE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

/**
 * Sanitizes and clamps query-string parameters before they reach the server action.
 * Malformed values (e.g. ?page=-1) are normalized to safe defaults.
 */
function sanitizeParams(raw: NatureFactorCVMasterSearchParams) {
    const rawPage = parseInt(raw.page ?? "", 10);
    const pageNumber = Number.isFinite(rawPage)
        ? Math.min(Math.max(rawPage, MIN_PAGE), MAX_PAGE)
        : MIN_PAGE;

    const rawPageSize = parseInt(raw.pageSize ?? "", 10);
    const pageSize = Number.isFinite(rawPageSize)
        ? Math.min(Math.max(rawPageSize, MIN_PAGE_SIZE), MAX_PAGE_SIZE)
        : DEFAULT_PAGE_SIZE;

    const searchTerm = raw.q?.trim() || undefined;
    const selectedYearRange = raw.selectedYearRange?.trim() || undefined;
    const constructionType = raw.constructionType?.trim() || undefined;

    return { pageNumber, pageSize, searchTerm, selectedYearRange, constructionType };
}

export default async function Page({ searchParams }: NatureFactorCvPageProps): Promise<React.ReactElement> {
    const params = await searchParams;
    const { pageNumber, pageSize, searchTerm, selectedYearRange, constructionType } = sanitizeParams(params);

    // Assessment years for dropdown
    const assessmentYearData = await getAssessmentYearsPagedServerCV(1, -1);
    const assessmentYearOptions = assessmentYearData.items.map((year) => ({
        label: `${year.fromYear}-${year.toYear}`,
        value: year.id.toString(),
    }));

    // Nature factor data with filters - no default year filter
    const natureResult = await fetchNatureFactorCVMasterPagedServerAction(
        pageNumber,
        pageSize,
        searchTerm,
        selectedYearRange, // Only use if explicitly selected by user
        constructionType
    );

    // Construction type dropdown
    const constructionTypeData = await fetchConstructionPagedServerAction(1, -1);
    const constructionTypeOptions = constructionTypeData.items.map((type) => ({
        label: `${type.constructionCode} - ${type.description}`,
        value: type.id.toString(),
    }));

    return (
        <div className="pt-6">
            <NatureFactorCVMaster
                data={natureResult.items}
                pageNumber={natureResult.pageNumber}
                pageSize={natureResult.pageSize}
                totalCount={natureResult.totalCount}
                totalPages={natureResult.totalPages}
                assessmentYearOptions={assessmentYearOptions}
                constructionTypeOptions={constructionTypeOptions}
            />
        </div>
    );
}