import React from "react";

import { fetchUseFactorCVMasterPagedServerAction, fetchTypeOfUsePaged } from "./action";
import { getAssessmentYearsPagedServerCV } from "@/lib/api/assessmentYearMasterCV.service";
import UseCategoryCvFactorMaster from "@/components/modules/property-tax/weightage-mastercv/UseCategoryCvFactorMaster";

interface PageProps {
    searchParams: Promise<{
        page?: string;
        pageSize?: string;
        leftPage?: string;
        leftPageSize?: string;
        q?: string;
        selectedYearRange?: string;
        typeOfUseId?: string;
    }>;
}

export default async function Page({ searchParams }: PageProps): Promise<React.ReactElement> {
    const params = await searchParams;
    const pageNumber = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 10;
    const leftPageNumber = Number(params.leftPage) || 1;
    const leftPageSize = Number(params.leftPageSize) || 10;
    const searchTerm = params.q || undefined;
    const selectedYearRange = params.selectedYearRange || undefined;
    const typeOfUseId = params.typeOfUseId ? Number(params.typeOfUseId) : undefined;

    // Assessment years for dropdown
    const assessmentYearData = await getAssessmentYearsPagedServerCV(1, -1);
    const assessmentYearOptions = assessmentYearData.items.map((year) => ({
        label: `${year.fromYear}-${year.toYear}`,
        value: year.yearRangeCVId.toString(),
    }));

    // Use factor data with filters
    const tableResult = await fetchUseFactorCVMasterPagedServerAction(
        pageNumber,
        pageSize,
        searchTerm,
        selectedYearRange,
        typeOfUseId
    );

    // Fetch Type of Use master data with pagination and filters
    const typeOfUseTableData = await fetchTypeOfUsePaged({
        pageNumber: leftPageNumber,
        pageSize: leftPageSize,
        searchTerm: searchTerm,
        filterLogic: 1, // Filter for active records only
        typeOfUseId: undefined, // Optional filter
        typeOfUseCode: undefined, // Optional filter
        typeOfUseGroupId: undefined, // Optional filter
    });
   
   const typeOfUseDropdown = await fetchTypeOfUsePaged({ pageNumber: 1, pageSize: -1});
    const typeOfUseOptions = typeOfUseDropdown.items.map((type) => ({
        label: `${type.typeOfUseCode} - ${type.description}`,
        value: String(type.typeOfUseId),
    }));


    return (
        <div className="pt-6">
            <UseCategoryCvFactorMaster
                data={tableResult?.items || []}
                pageNumber={tableResult?.pageNumber || 1}
                pageSize={tableResult?.pageSize || 10}
                totalCount={tableResult?.totalCount || 0}
                totalPages={tableResult?.totalPages || 1}
                
                typeOfUseTableData={typeOfUseTableData?.items || []}
                typeOfUsePageNumber={typeOfUseTableData?.pageNumber || 1}
                typeOfUsePageSize={typeOfUseTableData?.pageSize || 10}
                typeOfUseTotalCount={typeOfUseTableData?.totalCount || 0}
                typeOfUseTotalPages={typeOfUseTableData?.totalPages || 1}
                
                assessmentYearOptions={assessmentYearOptions}
                typeOfUseOptions={typeOfUseOptions}
            />
        </div>
    );
}