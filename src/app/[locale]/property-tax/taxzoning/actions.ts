"use server";

import {createTaxZoning, getAllTaxZoningServer, getTaxZonePagedServer, getTaxZoningByWardServer, getTaxZoningPagedServer, getTaxZoningPropertyNoServer, getWardPagedServer, updateTaxZoning } from "@/lib/api/taxzoning.service";
import { ApiError } from "@/lib/utils/api";
import { PagedResponse } from "@/types/common.types";
import { ActionResult, TaxZone, TaxZoningFormModel, TaxZoning, TaxZoningPropertyNo, Ward } from "@/types/taxzoning.types";


export async function fetchTaxZonePagedAction(
  pageNumber: number,
  pageSize: number
): Promise<PagedResponse<TaxZone>> {
  try {
    return await getTaxZonePagedServer(pageNumber, pageSize);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error; // preserve message & status
    }

    throw new ApiError(
      500,
      "messages.fetchTaxZonesFailed",
      "fetchTaxZonePagedAction: Unknown error"
    );
  }
}
export async function fetchWardPagedAction(
  pageNumber: number,
  pageSize: number
): Promise<PagedResponse<Ward>> {
  try {
    return await getWardPagedServer(pageNumber, pageSize);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Preserve the original error message and stack if possible
    const message = error instanceof Error ? error.message : "messages.fetchWardsFailed";
    const details = error instanceof Error && error.stack ? error.stack : String(error);
    throw new ApiError(
      500,
      message,
      `fetchWardPagedAction: ${details}`
    );
  }
}



export async function getTaxZoningPagedAction(
  pageNumber: number,
  pageSize: number,
  taxZoneId?: number,
  wardId?: number,
  groupBy?: string
): Promise<ActionResult<PagedResponse<TaxZoning>>> {
  try {
    const data = await getTaxZoningPagedServer(pageNumber, pageSize, taxZoneId, wardId, groupBy);

    return {
      success: true,
      data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        statusCode: error.statusCode,
      };
    }

    return {
      success: false,
      error: "messages.fetchZoningDataFailed",
      statusCode: 500,
    };
  }
}
export async function getTaxZoningPropertyNoPagedAction(
  pageNumber: number,
  pageSize: number,
  taxZoneId?: number,
  wardId?: number
): Promise<ActionResult<PagedResponse<TaxZoningPropertyNo>>> {
  try {
    const data = await getTaxZoningPropertyNoServer(pageNumber, pageSize, taxZoneId, wardId);

    return {
      success: true,
      data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        statusCode: error.statusCode,
      };
    }

    return {
      success: false,
      error: "messages.fetchPropertyNoFailed",
      statusCode: 500,
    };
  }
}

export async function getTaxZoningByWardAction(
  wardNo: string,
  pageSize = 100,
  pageNumber = 1
): Promise<ActionResult<PagedResponse<TaxZoning>>> {
  try {
    const data = await getTaxZoningByWardServer(
      wardNo,
      pageSize,
      pageNumber
    );

    return {
      success: true,
      data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        statusCode: error.statusCode,
      };
    }

    return {
      success: false,
      error: "messages.fetchByWardFailed",
    };
  }
}

export async function getAllTaxZoningAction(
  pageNumber: number,
  pageSize: number,
  taxZoneId?: number,
  wardId?: number
): Promise<ActionResult<PagedResponse<TaxZoning>>> {
  try {
    const data = await getAllTaxZoningServer(pageNumber, pageSize, taxZoneId, wardId);

    return {
      success: true,
      data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        statusCode: error.statusCode,
      };
    }

    return {
      success: false,
      error: "messages.fetchAllFailed",
    };
  }
}

export async function createTaxZoningAction(
  data: TaxZoningFormModel
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await createTaxZoning(data);

    return {
      success: true,
      message: "messages.createSuccess",
    };
  } catch (error: unknown) {
    console.error("Create Tax Zoning Error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "messages.createFailed",
    };
  }
}

export async function updateTaxZoningAction(
  data: TaxZoningFormModel
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await updateTaxZoning(data);

    return {
      success: true,
      message: "messages.updateSuccess",
    };
  } catch (error: unknown) {
    console.error("Update Tax Zoning Error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "messages.updateFailed",
    };
  }
}