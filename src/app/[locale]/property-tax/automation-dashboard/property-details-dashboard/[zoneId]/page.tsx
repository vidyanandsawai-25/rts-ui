

import PropertyMainDashboardClient from "@/components/modules/property-tax/automation-dashboard/PropertyDetailsDashboard/PropertyMainDashboardClient";
import { getGeoSequencingPropertyDetailsAction, getPropertyTypeMasterAction, getWardsAction } from "./action";

interface PageProps {
    searchParams: Promise<
        {
            workflowStageId?: string;
            stage?: string;
            pageNumber?: string;
            pageSize?: string;
            wardId?: string;
            propertyDescription?: string;
            propertyTypeId?: string;
            assessmentTypeId?: string;
            searchTerm?: string;
            sortBy?: string;
            sortOrder?: string;
        }>;
    params: Promise<
        {
            zoneId: string
        }>;
}

const page = async ({ searchParams, params }: PageProps) => {
    const search = await searchParams;
    const pathParams = await params;

    const zoneId = pathParams.zoneId;
    const workflowStageId = search.workflowStageId;

    // pagination params
    const pageNumber = search.pageNumber ? parseInt(search.pageNumber, 10) : 1;
    const pageSize = search.pageSize ? parseInt(search.pageSize, 10) : 10;

    // filter/sort params
    const wardId = search.wardId;
    const propertyDescription = search.propertyDescription;
    const propertyTypeId = search.propertyTypeId;
    const assessmentTypeId = search.assessmentTypeId;
    const searchTerm = search.searchTerm;
    const sortBy = search.sortBy;
    const sortOrder = search.sortOrder;

    const [geoSequencingRes, wardsRes, propertytype] = await Promise.all([
        workflowStageId
            ? getGeoSequencingPropertyDetailsAction(
                zoneId,
                workflowStageId,
                pageNumber,
                pageSize,
                wardId,
                propertyDescription,
                propertyTypeId,
                assessmentTypeId,
                searchTerm,
                sortBy,
                sortOrder
            )
            : Promise.resolve({ success: true, data: null }),

        getWardsAction(1, -1),
        getPropertyTypeMasterAction(1, -1)
    ]);

    return (
        <PropertyMainDashboardClient
            serverData={geoSequencingRes?.data || null}
            wardsData={wardsRes?.data || null}
            propertyType={propertytype?.data || null}
        />
    )
}

export default page;