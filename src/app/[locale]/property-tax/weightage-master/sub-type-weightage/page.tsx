import React from "react";

import { fetchUseFactorCVMasterPagedServerAction, fetchTypeOfUsePaged } from "./action";
import UseCategoryCvFactorMaster from "@/components/modules/property-tax/weightage-mastercv/useCategoryCv/UseCategoryCvFactorMaster";
import { getAssessmentYearsPagedServerCV } from "@/lib/api/floor-cv-weightageMaster.service";
import { UseCategoryCvPageProps } from "@/types/useCategoryCvFactor.types";


export default async function Page({ searchParams }: UseCategoryCvPageProps): Promise<React.ReactElement> {
    const params = await searchParams;
    const pageNumber = Math.max(1, parseInt(params.page as string, 10) || 1);
    const pageSizeRaw = parseInt(params.pageSize as string, 10);
    const pageSize = pageSizeRaw === -1 ? -1 : Math.min(1000, Math.max(1, pageSizeRaw || 10));
    const leftPageNumber = Math.max(1, parseInt(params.leftPage as string, 10) || 1);
    const leftPageSizeRaw = parseInt(params.leftPageSize as string, 10);
    const leftPageSize = leftPageSizeRaw === -1 ? -1 : Math.min(1000, Math.max(1, leftPageSizeRaw || 10));
    const searchTerm = params.q || undefined;
    const selectedYearRange = params.selectedYearRange || undefined;
    const typeOfUseId = (params.typeOfUseId && params.typeOfUseId !== "undefined") ? parseInt(params.typeOfUseId as string, 10) : undefined;

    // Assessment years for dropdown
    const assessmentYearData = await getAssessmentYearsPagedServerCV(1, -1);
    const assessmentYearOptions = assessmentYearData.items.map((year) => ({
        label: `${year.fromYear}-${year.toYear}`,
        value: year.id.toString(),
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
        id: undefined, // Optional filter
        typeOfUseCode: undefined, // Optional filter
        typeOfUseGroupId: undefined, // Optional filter
    });
   
   const typeOfUseDropdown = await fetchTypeOfUsePaged({ pageNumber: 1, pageSize: -1});
    const typeOfUseOptions = typeOfUseDropdown.items.map((type) => ({
        label: `${type.typeOfUseCode} - ${type.description}`,
        value: String(type.id),
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