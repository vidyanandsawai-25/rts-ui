import React from "react";
import { fetchAgeFactorCVMasterPagedServerAction, fetchConstructionTypePagedAction, fetchAllAgeFactorsAction } from "./action";
import { getAssessmentYearsPagedServerCV } from "@/lib/api/assessmentYearMasterCV.service";
import AgeFactorCvBuilding from "@/components/modules/property-tax/weightage-mastercv/AgeFactorCvBuilding";


interface PageProps {
    searchParams: Promise<{
        page?: string;
        pageSize?: string;
        q?: string;
        selectedYearRange?: string;
        constructionType?: string;
    }>;
}

export default async function Page({ searchParams }: PageProps): Promise<React.ReactElement> {
    const params = await searchParams;
    const pageNumber = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 10;
    const searchTerm = params.q || undefined;
    const selectedYearRange = params.selectedYearRange || undefined;
    const constructionType = params.constructionType || undefined;

    // Assessment years for dropdown
    const assessmentYearData = await getAssessmentYearsPagedServerCV(1, -1);
    const assessmentYearOptions = assessmentYearData.items.map((year) => ({
        label: `${year.fromYear}-${year.toYear}`,
        value: year.yearRangeCVId.toString(),
    }));

    // Age factor data with filters
    const ageResult = await fetchAgeFactorCVMasterPagedServerAction(
        pageNumber,
        pageSize,
        searchTerm,
        selectedYearRange,
        constructionType ? Number(constructionType) : undefined
    );

    // Construction type dropdown
    const constructionTypeData = await fetchConstructionTypePagedAction(1, -1);
    const constructionTypeOptions = constructionTypeData.items.map((type) => ({
        label: `${type.constructionCode} - ${type.description}`,
        value: type.constructionTypeId.toString(),
    }));

    // Fetch all age factors to get unique age ranges
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
            <AgeFactorCvBuilding
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
