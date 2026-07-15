/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { ApiError } from '@/lib/utils/api';
import { initOperations, getScopeOptions, searchProperties, getEligibleCount, executeOperation, getJobProperties, previewOperation, getAuditList, getAuditDetail, getImportTemplate } from '@/lib/api/add-taxes/operations.service';
import { InitOperationsResponse, ScopeOptionsResponse, ExecuteOperationPayload, SearchPropertiesResponse, JobPropertyItem, OperationPreviewPayload, ImportTemplateResponse } from '@/types/addTaxes.types';
import { createLogger } from '@/lib/utils/server-logger';

import { fetchZonesAction, getAllWardsForLinkAction } from "../zone-master/actions";
import { getPropertyTypesPaged } from '@/lib/api/property-type-crud.service';

const logger = createLogger('AddTaxesActions');

export async function initOperationsAction(): Promise<InitOperationsResponse | null> {
    try {
        const result = await initOperations();
        return result;
    } catch (error) {
        if (error instanceof ApiError) {
            logger.error(`[initOperationsAction] API Error ${error.statusCode}:`, { responseText: error.responseText }, error);
        } else {
            logger.error("[initOperationsAction] Error:", undefined, error);
        }
        return null;
    }
}

export async function getScopeOptionsAction(): Promise<ScopeOptionsResponse | null> {
    try {
        const result = await getScopeOptions();
        return result;
    } catch (error) {
        if (error instanceof ApiError) {
            logger.error(`[getScopeOptionsAction] API Error ${error.statusCode}:`, { responseText: error.responseText }, error);
        } else {
            logger.error("[getScopeOptionsAction] Error:", undefined, error);
        }
        return null;
    }
}

export async function fetchAllZonesAction() {
    return await fetchZonesAction(1, -1);
}

export async function fetchAllWardsAction() {
    return await getAllWardsForLinkAction();
}

export async function fetchAllPropertyTypesAction() {
    try {
        return await getPropertyTypesPaged(1, -1);
    } catch (error) {
        if (error instanceof ApiError) {
            logger.error(`[fetchAllPropertyTypesAction] API Error ${error.statusCode}:`, { responseText: error.responseText }, error);
        } else {
            logger.error("[fetchAllPropertyTypesAction] Error:", undefined, error);
        }
        return null;
    }
}

export async function searchPropertiesAction(zoneId: string | number | null, wardId: string | number): Promise<SearchPropertiesResponse | null> {
    try {
        const result = await searchProperties(zoneId, wardId);
        return result;
    } catch (error) {
        if (error instanceof ApiError) {
            logger.error(`[searchPropertiesAction] API Error ${error.statusCode}:`, { responseText: error.responseText }, error);
        } else {
            logger.error("[searchPropertiesAction] Error:", undefined, error);
        }
        return null;
    }
}

export async function getEligibleCountAction(payload: any): Promise<any> {
    try {
        const result = await getEligibleCount(payload);
        return result;
    } catch (error) {
        let errorMsg = "Failed to calculate eligible properties";
        if (error instanceof ApiError) {
            logger.error(`[getEligibleCountAction] API Error ${error.statusCode}:`, { responseText: error.responseText }, error);
            errorMsg = error.responseText || error.message || errorMsg;
        } else {
            logger.error("[getEligibleCountAction] Error:", undefined, error);
            errorMsg = (error as Error).message || errorMsg;
        }
        return { eligible: 0, total: 0, skipped: 0, error: errorMsg };
    }
}

export async function executeOperationAction(payload: ExecuteOperationPayload): Promise<any> {
    try {
        const result = await executeOperation(payload);
        return result;
    } catch (error) {
        let errorMsg = "Failed to execute operation";
        if (error instanceof ApiError) {
            logger.error(`[executeOperationAction] API Error ${error.statusCode}:`, { responseText: error.responseText }, error);
            errorMsg = error.responseText || error.message || errorMsg;
        } else {
            logger.error("[executeOperationAction] Error:", undefined, error);
            errorMsg = (error as Error).message || errorMsg;
        }
        return { success: false, error: errorMsg };
    }
}

export async function getJobPropertiesAction(jobId: string): Promise<JobPropertyItem[] | null> {
    try {
        const result = await getJobProperties(jobId);
        return result;
    } catch (error) {
        if (error instanceof ApiError) {
            logger.error(`[getJobPropertiesAction] API Error ${error.statusCode}:`, { responseText: error.responseText }, error);
        } else {
            logger.error("[getJobPropertiesAction] Error:", undefined, error);
        }
        return null;
    }
}

export async function previewOperationAction(payload: OperationPreviewPayload): Promise<any> {
    try {
        const result = await previewOperation(payload);
        return result;
    } catch (error) {
        let errorMsg = "Failed to load preview data";
        if (error instanceof ApiError) {
            logger.error(`[previewOperationAction] API Error ${error.statusCode}:`, { responseText: error.responseText }, error);
            errorMsg = error.responseText || error.message || errorMsg;
        } else {
            logger.error("[previewOperationAction] Error:", undefined, error);
            errorMsg = (error as Error).message || errorMsg;
        }
        return { records: [], totalSelected: 0, eligible: 0, skipped: 0, requiresApproval: 0, error: errorMsg };
    }
}

export async function getAuditListAction(queryParams: Record<string, string | number | undefined>): Promise<any | null> {
    try {
        const result = await getAuditList(queryParams);
        return result;
    } catch (error) {
        if (error instanceof ApiError) {
            logger.error(`[getAuditListAction] API Error ${error.statusCode}:`, { responseText: error.responseText }, error);
        } else {
            logger.error("[getAuditListAction] Error:", undefined, error);
        }
        return null;
    }
}

export async function getAuditDetailAction(jobId: string): Promise<any> {
    try {
        const result = await getAuditDetail(jobId);
        return result;
    } catch (error) {
        if (error instanceof ApiError) {
            logger.error(`[getAuditDetailAction] API Error ${error.statusCode}:`, { responseText: error.responseText }, error);
        } else {
            logger.error("[getAuditDetailAction] Error:", undefined, error);
        }
        return null;
    }
}

export async function getImportTemplateAction(): Promise<ImportTemplateResponse | null> {
    try {
        const result = await getImportTemplate();
        return result;
    } catch (error) {
        if (error instanceof ApiError) {
            logger.error(`[getImportTemplateAction] API Error ${error.statusCode}:`, { responseText: error.responseText }, error);
        } else {
            logger.error("[getImportTemplateAction] Error:", undefined, error);
        }
        return null;
    }
}

export async function fetchAssessmentStatusesAction() {
    try {
        const { getPropertyAssessmentStatuses } = await import('@/lib/api/property-assessment-status.service');
        const result = await getPropertyAssessmentStatuses();
        return { data: result };
    } catch (error) {
        if (error instanceof ApiError) {
            logger.error(`[fetchAssessmentStatusesAction] API Error ${error.statusCode}:`, { responseText: error.responseText }, error);
        } else {
            logger.error("[fetchAssessmentStatusesAction] Error:", undefined, error);
        }
        return { data: [], error: (error as Error).message };
    }
}
