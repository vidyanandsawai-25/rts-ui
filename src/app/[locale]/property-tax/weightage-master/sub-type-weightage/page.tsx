import React from "react";

import { fetchUseFactorCVMasterPagedServerAction, fetchTypeOfUsePaged } from "./action";
import UseCategoryCvFactorMaster from "@/components/modules/property-tax/weightage-mastercv/useCategoryCv/UseCategoryCvFactorMaster";
import { getAssessmentYearsPagedServerCV } from "@/lib/api/floor-cv-weightageMaster.service";
import { UseCategoryCvPageProps } from "@/types/useCategoryCvFactor.types";
import { parsePaginationParams } from "@/lib/utils/pagination";
import { sanitizeNumericParam } from "@/lib/utils/params";


export default async function Page({ searchParams }: UseCategoryCvPageProps): Promise<React.ReactElement> {
    const params = await searchParams;
    
    // Parse pagination for both main and left tables
    const { pageNumber, pageSize } = parsePaginationParams(params.page, params.pageSize);
    const { pageNumber: leftPageNumber, pageSize: leftPageSize } = parsePaginationParams(params.leftPage, params.leftPageSize);

    const searchTerm = params.q?.trim() || undefined;
    const selectedYearRange = sanitizeNumericParam(params.selectedYearRange)?.toString();
    const typeOfUseId = sanitizeNumericParam(params.typeOfUseId);

    // Sanitization for sorting
    const sortByRaw = params.sortBy?.trim() ?? "";
    const allowedSortColumns = ["TypeOfUseCode", "TypeOfUseDescription", "SubTypeOfUseDescription", "FromYear"];
    const sortBy = allowedSortColumns.includes(sortByRaw) ? sortByRaw : undefined;

    const sortOrderRaw = params.sortOrder?.trim().toLowerCase() ?? "";
    const sortOrder = ["asc", "desc"].includes(sortOrderRaw) ? (sortOrderRaw as "asc" | "desc") : undefined;

    const leftSortByRaw = params.leftSortBy?.trim() ?? "";
    const leftAllowedSortColumns = ["TypeOfUseCode", "Description"];
    const leftSortBy = leftAllowedSortColumns.includes(leftSortByRaw) ? leftSortByRaw : undefined;

    const leftSortOrderRaw = params.leftSortOrder?.trim().toLowerCase() ?? "";
    const leftSortOrder = ["asc", "desc"].includes(leftSortOrderRaw) ? (leftSortOrderRaw as "asc" | "desc") : undefined;

    // Assessment years for dropdown
    const assessmentYearData = await getAssessmentYearsPagedServerCV(1, -1);
    const assessmentYearOptions = assessmentYearData.items.map((year) => ({
        label: `${year.fromYear}-${year.toYear}`,
        value: year.id.toString(),
    }));

    // Use factor data with filters and sorting
    const tableResult = await fetchUseFactorCVMasterPagedServerAction(
        pageNumber,
        pageSize,
        searchTerm,
        selectedYearRange,
        typeOfUseId,
        undefined, // subTypeOfUseId
        sortBy,
        sortOrder
    );

    // Fetch Type of Use master data with pagination, filters, and sorting
    const typeOfUseTableData = await fetchTypeOfUsePaged({
        pageNumber: leftPageNumber,
        pageSize: leftPageSize,
        searchTerm: searchTerm,
        filterLogic: 1, // Filter for active records only
        id: undefined, // Optional filter
        typeOfUseCode: undefined, // Optional filter
        typeOfUseGroupId: undefined, // Optional filter
        sortBy: leftSortBy,
        sortOrder: leftSortOrder,
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
                
                sortBy={sortBy}
                sortOrder={sortOrder}
                leftSortBy={leftSortBy}
                leftSortOrder={leftSortOrder}
            />
        </div>
    );
}