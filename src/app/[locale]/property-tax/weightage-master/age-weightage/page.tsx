import React from "react";
import { 
    fetchAgeFactorCVMasterPagedServerAction, 
    fetchConstructionTypePagedAction, 
    fetchAllAgeFactorsAction 
} from "./action";

import { getAssessmentYearsPagedServerCV } from "@/lib/api/floor-cv-weightageMaster.service";
import AgeFactorCvWeightageMaster from "@/components/modules/property-tax/weightage-mastercv/ageFactorCv/AgeFactorCvWeightageMaster";

interface PageProps {
    searchParams: Promise<{
        page?: string;
        pageSize?: string;
        q?: string;
        selectedYearRange?: string;
        constructionType?: string;
        sortBy?: string;
        sortOrder?: string;
    }>;
}

/**
 * Normalizes a string input to a positive integer within bounds, or a default value.
 */
function normalizeParam(val: string | undefined, defaultValue: number, max: number): number {
    const num = parseInt(val || "", 10);
    if (!Number.isFinite(num) || num <= 0) return defaultValue;
    return Math.min(num, max);
}

export default async function Page({ searchParams }: PageProps): Promise<React.ReactElement> {
    const params = await searchParams;
    
    // Normalize and clamp pagination parameters to prevent SSR crashes or bad API requests
    const pageNumber = normalizeParam(params.page, 1, 10000);
    const pageSize = normalizeParam(params.pageSize, 10, 100);
    
    // Sanitize sorting parameters
    const sortBy = params.sortBy?.trim() || undefined;
    const sortOrder = params.sortOrder?.trim() || undefined;
    
    const searchTerm = params.q?.trim() || undefined;
    const selectedYearRange = params.selectedYearRange?.trim() || undefined;
    const constructionType = params.constructionType?.trim() || undefined;

    // Fetch assessment years for dropdown - use -1 to fetch all records
    const assessmentYearData = await getAssessmentYearsPagedServerCV(1, -1);
    const assessmentYearOptions = assessmentYearData.items.map((year) => ({
        label: `${year.fromYear}-${year.toYear}`,
        value: year.id.toString(),
    }));

    // Age factor data with filters and sorting
    const ageResult = await fetchAgeFactorCVMasterPagedServerAction(
        pageNumber,
        pageSize,
        searchTerm,
        selectedYearRange,
        constructionType ? Number(constructionType) : undefined,
        sortBy,
        sortOrder
    );

    // Fetch construction types for dropdown - use -1 to fetch all records
    const constructionTypeData = await fetchConstructionTypePagedAction(1, -1);
    const constructionTypeOptions = constructionTypeData.items.map((type) => ({
        label: `${type.constructionCode} - ${type.description}`,
        value: type.id.toString(),
    }));

    // Fetch all age factors to get unique age ranges for the filter dropdown
    const allAgeFactors = await fetchAllAgeFactorsAction();
    const uniqueAgeRanges = Array.from(new Set(allAgeFactors.map(af => `${af.ageFrom}-${af.ageTo}`)))
        .sort((a, b) => {
            const [aFrom] = a.split('-').map(Number);
            const [bFrom] = b.split('-').map(Number);
            return aFrom - bFrom;
        })
        .map(range => ({ label: range, value: range }));

    return (
        <div className="pt-6">
            <AgeFactorCvWeightageMaster
                data={ageResult.items}
                pageNumber={ageResult.pageNumber}
                pageSize={ageResult.pageSize}
                totalCount={ageResult.totalCount}
                totalPages={ageResult.totalPages}
                assessmentYearOptions={assessmentYearOptions}
                constructionTypeOptions={constructionTypeOptions}
                ageRangeOptions={uniqueAgeRanges}
                allAgeFactors={allAgeFactors}
            />
        </div>
    );
}
