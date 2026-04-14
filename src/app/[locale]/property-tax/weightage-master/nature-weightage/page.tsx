import React from "react";

import { fetchNatureFactorCVMasterPagedServerAction } from "./acions";
import { getAssessmentYearsPagedServerCV } from "@/lib/api/assessmentYearMasterCV.service";
import NatureFactorCVMaster from "@/components/modules/property-tax/weightage-mastercv/NatureFactorCVMaster";
import { fetchConstructionTypePagedAction } from "../age-weightage/action";

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

    // Nature factor data with filters - no default year filter
    const natureResult = await fetchNatureFactorCVMasterPagedServerAction(
        pageNumber,
        pageSize,
        searchTerm,
        selectedYearRange, // Only use if explicitly selected by user
        constructionType
    );

    // Construction type dropdown
    const constructionTypeData = await fetchConstructionTypePagedAction(1, -1);
    const constructionTypeOptions = constructionTypeData.items.map((type) => ({
        label: `${type.constructionCode} - ${type.description}`,
        value: type.constructionTypeId.toString(),
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