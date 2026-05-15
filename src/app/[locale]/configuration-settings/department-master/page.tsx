import { getDepartmentMastersPaged, getDepartmentMasters } from "@/lib/api/configuration-settings/department-master/departmentMaster.service";
import { DepartmentMaster as DepartmentMasterClient } from "@/components/modules/configuration-settings/department-master/DepartmentMaster";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DepartmentMasterPage({ searchParams }: PageProps) {
    const resolvedSearchParams = await searchParams;
    
    const pageNumber = Number(resolvedSearchParams.page) || 1;
    const pageSize = Number(resolvedSearchParams.pageSize) || 10;
    const searchTerm = (resolvedSearchParams.search as string) || "";
    const rawStatus = resolvedSearchParams.status;
    const statusParam = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus;
    const status = statusParam && statusParam !== "all" ? statusParam : undefined;

    const [pagedData, allData] = await Promise.all([
        getDepartmentMastersPaged(pageNumber, pageSize, searchTerm, status),
        getDepartmentMasters(1, 1000)
    ]);

    return (
        <DepartmentMasterClient
            initialData={pagedData.items}
            initialPageNumber={pagedData.pageNumber}
            initialPageSize={pagedData.pageSize}
            initialTotalCount={pagedData.totalCount}
            initialTotalPages={pagedData.totalPages}
            initialSearchTerm={searchTerm}
            allData={allData}
        />
    );
}
