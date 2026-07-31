'use server';

import {
    getApprovalByUlbGridDetails,
    getWardWiseApprovalByUlbGridDetails,
    getBuildingWiseData,
    getPropertyWiseData
} from "@/lib/api/automation-dashboard/approval-by-ulb/approval-by-ulb.service";
import { ApprovalByUlbItems, BuildingWisePagination, PropertyWisePagination } from "@/types/automation-dashboard/approval-by-ulb/approval-by-ulb.type";
import { createLogger } from "@/lib/utils/server-logger";
import { ApiError } from "@/lib/utils/api";
import { getTranslations } from "next-intl/server";

const logger = createLogger("ApprovalByUlbActions");

type ActionResult<T> = {
    success: boolean;
    data?: T | null;
    error?: string;
    statusCode?: number;
};

export async function getApprovalByUlbGridDetailsAction(): Promise<ActionResult<ApprovalByUlbItems>> {
    try {
        logger.info("getApprovalByUlbGridDetailsAction: Fetching approval by ULB grid details");
        const data = await getApprovalByUlbGridDetails();
        return { success: true, data };
    } catch (error) {
        logger.error("Failed to fetch approval by ULB grid details", {}, error);
        if (error instanceof ApiError) {
            return { success: false, error: error.message, statusCode: error.statusCode };
        }
        const t = await getTranslations("automationDashboard");
        return { success: false, error: t("errors.fetchApprovalByUlbDetails") || "Failed to fetch approval by ULB grid details", statusCode: 500 };
    }
}

export async function getWardWiseApprovalByUlbGridDetailsAction(zoneId: string | number): Promise<ActionResult<ApprovalByUlbItems>> {
    try {
        logger.info("getWardWiseApprovalByUlbGridDetailsAction: Fetching ward-wise grid details", { zoneId });
        const data = await getWardWiseApprovalByUlbGridDetails(zoneId);
        return { success: true, data };
    } catch (error) {
        logger.error("Failed to fetch ward-wise approval by ULB grid details", { zoneId }, error);
        if (error instanceof ApiError) {
            return { success: false, error: error.message, statusCode: error.statusCode };
        }
        const t = await getTranslations("automationDashboard");
        return { success: false, error: t("errors.fetchApprovalByUlbDetails") || "Failed to fetch ward-wise approval by ULB grid details", statusCode: 500 };
    }
}

export async function getBuildingWiseDataAction(
    wardId: string | number, 
    workflowStageId: string | number, 
    pageNumber: number = 1, 
    pageSize: number = 10
): Promise<ActionResult<BuildingWisePagination>> {
    try {
        logger.info("getBuildingWiseDataAction: Fetching building-wise grid details", { wardId, workflowStageId, pageNumber, pageSize });
        const data = await getBuildingWiseData(wardId, workflowStageId, pageNumber, pageSize);
        return { success: true, data };
    } catch (error) {
        logger.error("Failed to fetch building-wise grid details", { wardId, workflowStageId, pageNumber, pageSize }, error);
        if (error instanceof ApiError) {
            return { success: false, error: error.message, statusCode: error.statusCode };
        }
        const t = await getTranslations("automationDashboard");
        return { success: false, error: t("errors.fetchBuildingWiseData") || "Failed to fetch building-wise grid details", statusCode: 500 };
    }
}

export async function getPropertyWiseDataAction(
    propertyNo: string,
    pageNumber: number = 1,
    pageSize: number = 10
): Promise<ActionResult<PropertyWisePagination>> {
    try {
        logger.info("getPropertyWiseDataAction: Fetching property-wise data", { propertyNo, pageNumber, pageSize });
        const data = await getPropertyWiseData(propertyNo, pageNumber, pageSize);
        return { success: true, data };
    } catch (error) {
        logger.error("Failed to fetch property-wise data", { propertyNo, pageNumber, pageSize }, error);
        if (error instanceof ApiError) {
            return { success: false, error: error.message, statusCode: error.statusCode };
        }
        const t = await getTranslations("automationDashboard");
        return { success: false, error: t("errors.fetchPropertyWiseData") || "Failed to fetch property-wise data", statusCode: 500 };
    }
}