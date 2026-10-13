'use server';

import { revalidatePath } from 'next/cache';
import {
  getAppealTypes,
  checkAppealLevel,
  getAppealApplicationSummary,
  submitAppeal,
  getAppealDashboardCards,
  getAppealDashboardGrid,
  getAppealProcessDetails,
  processAppealAction,
} from '@/lib/api/rts/rtsappeal.service';
import type {
  RTSAppealTypeDto,
  RTSAppealLevelCheckResultDto,
  RTSAppealApplicationSummaryDto,
  CreateRTSAppealApplicationDto,
  RTSAppealApplicationResultDto,
  RTSAppealDashboardCardsCountDto,
  RTSAppealDashboardDetailsDto,
  RTSAppealProcessDetailsDto,
  ProcessRTSAppealActionDto,
  RTSAppealQueryParameters,
} from '@/types/rts/appeal.types';

export async function getAppealDashboardCardsAction(): Promise<RTSAppealDashboardCardsCountDto> {
  try {
    return await getAppealDashboardCards();
  } catch (error) {
    console.error('Error fetching appeal dashboard cards:', error);
    return {
      totalAppeals: 0,
      pendingAppeals: 0,
      approvedAppeals: 0,
      rejectedAppeals: 0,
      returnedAppeals: 0,
      firstAppeals: 0,
      secondAppeals: 0,
      delayedAppeals: 0,
    };
  }
}

export async function getAppealDashboardGridAction(
  params: RTSAppealQueryParameters = {}
): Promise<{
  items: RTSAppealDashboardDetailsDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}> {
  try {
    return await getAppealDashboardGrid(params);
  } catch (error) {
    console.error('Error fetching appeal dashboard grid:', error);
    return {
      items: [],
      totalCount: 0,
      pageNumber: params.pageNumber ?? 1,
      pageSize: params.pageSize ?? 10,
    };
  }
}

export async function getAppealProcessDetailsAction(
  appealId: number
): Promise<RTSAppealProcessDetailsDto | null> {
  try {
    return await getAppealProcessDetails(appealId);
  } catch (error) {
    console.error(`Error fetching appeal process details for #${appealId}:`, error);
    return null;
  }
}

export async function processAppealOfficerAction(
  payload: ProcessRTSAppealActionDto
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await processAppealAction(payload);
    revalidatePath('/rts/appeals');
    return { success: true, message: res.message };
  } catch (error: any) {
    console.error('Error processing officer appeal action:', error);
    return { success: false, error: error?.message || 'Failed to process officer decision' };
  }
}

// ── Citizen Actions ──────────────────────────────────────────────────────────

export async function checkCitizenAppealEligibilityAction(
  applicationNo: string
): Promise<{ success: boolean; data?: RTSAppealLevelCheckResultDto; error?: string }> {
  try {
    const trimmed = applicationNo.trim();
    if (!trimmed) {
      return { success: false, error: 'Application number is required' };
    }
    const data = await checkAppealLevel(trimmed);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to check eligibility' };
  }
}

export async function getCitizenAppealApplicationSummaryAction(
  applicationNo: string
): Promise<{ success: boolean; data?: RTSAppealApplicationSummaryDto; error?: string }> {
  try {
    const trimmed = applicationNo.trim();
    if (!trimmed) {
      return { success: false, error: 'Application number is required' };
    }
    const data = await getAppealApplicationSummary(trimmed);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to fetch application details' };
  }
}

export async function getAppealTypesAction(): Promise<RTSAppealTypeDto[]> {
  try {
    return await getAppealTypes();
  } catch (error) {
    console.error('Error fetching statutory appeal types:', error);
    return [];
  }
}

export async function submitCitizenAppealAction(
  payload: CreateRTSAppealApplicationDto
): Promise<{ success: boolean; data?: RTSAppealApplicationResultDto; error?: string }> {
  try {
    const result = await submitAppeal(payload);
    revalidatePath('/rts/appeals');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error submitting citizen appeal:', error);
    return { success: false, error: error?.message || 'Failed to submit statutory appeal' };
  }
}
