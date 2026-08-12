

import PropertyMainDashboardClient from "@/components/modules/property-tax/automation-dashboard/PropertyDetailsDashboard/PropertyMainDashboardClient";
import {
    getGeoSequencingPropertyDetailsAction,
    getPropertyAssessmentStatusAction,
    getPropertyTypeMasterAction,
    getWardsAction,
    getWardWisePropertySubGridDetailsAction
} from "./action";
import { PropertySubGridDetailsItems } from "@/types/automation-dashboard/property-dashboard/property-subgrid-details.type";

interface PageProps {
    searchParams: Promise<
        {
            workflowStageId?: string;
            stage?: string;
            pageNumber?: string;
            pageSize?: string;
            wardId?: string;
            propertyDescription?: string;
            PropertyTypeCategoryId?: string;
            propertyTypeCategoryId?: string;
            propertyTypeId?: string;
            assessmentTypeId?: string;
            searchTerm?: string;
            sortBy?: string;
            sortOrder?: string;
            wardWise?: string;
            source?: string;
            zoneId?: string;
            Structure?: string;
            Unit?: string;
        }>;
    params: Promise<
        {
            zoneId: string
        }>;
}

const page = async ({ searchParams, params }: PageProps) => {
    const search = await searchParams;
    const pathParams = await params;

    const workflowStageId = search.workflowStageId;

    // pagination params
    const pageNumber = search.pageNumber ? parseInt(search.pageNumber, 10) : 1;
    const pageSize = search.pageSize ? parseInt(search.pageSize, 10) : 10;

    const propertyTypeCategoryId = search.PropertyTypeCategoryId || search.propertyTypeCategoryId;
    const propertyDescription = search.propertyDescription;
    const propertyTypeId = search.propertyTypeId;
    const assessmentTypeId = search.assessmentTypeId;
    const searchTerm = search.searchTerm;
    const sortBy = search.sortBy;
    const sortOrder = search.sortOrder;
    const structure = search.Structure ? search.Structure === 'true' : undefined;
    const unit = search.Unit ? search.Unit === 'true' : undefined;

    const isWardWise = search.wardWise === 'true' || search.source === 'ward';

    // If navigated from Ward Wise Summary, the path parameter is actually the wardId
    const actualZoneId = isWardWise && search.zoneId ? search.zoneId : pathParams.zoneId;
    const actualWardId = isWardWise ? pathParams.zoneId : search.wardId;

    const [geoSequencingRes, wardsRes, propertytype, assessmentStatusRes] = await Promise.all([
        workflowStageId
            ? isWardWise
                ? getWardWisePropertySubGridDetailsAction(
                    actualZoneId,
                    workflowStageId,
                    pageNumber,
                    pageSize,
                    actualWardId,                    
                    propertyDescription,
                    propertyTypeCategoryId,
                    propertyTypeId,
                    assessmentTypeId,
                    searchTerm,
                    sortBy,
                    sortOrder,
                    structure,
                    unit
                )
                : getGeoSequencingPropertyDetailsAction(
                    actualZoneId,
                    workflowStageId,
                    pageNumber,
                    pageSize,
                    actualWardId,
                    propertyTypeCategoryId,
                    propertyTypeId,
                    assessmentTypeId,
                    searchTerm,
                    sortBy,
                    sortOrder,
                    structure,
                    unit
                )
            : Promise.resolve({ success: true, data: null }),

        getWardsAction(1, -1),
        getPropertyTypeMasterAction(1, -1),
        getPropertyAssessmentStatusAction(1,-1)
    ]);

    return (
        <PropertyMainDashboardClient
            serverData={geoSequencingRes?.data as PropertySubGridDetailsItems || null}
            wardsData={wardsRes?.data || null}
            propertyType={propertytype?.data || null}
            assessmentStatus={assessmentStatusRes?.data || null}
        />
    )
}

export default page;