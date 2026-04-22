"use server";

import {createTaxZoning, getAllTaxZonningServer, getTaxZonePagedServer, getTaxZonningByWardServer, getTaxZonningPagedServer, getTaxZonningPropertyNoServer, getWardPagedServer, updateTaxZoning } from "@/lib/api/taxzoning.service";
import { ApiError } from "@/lib/utils/api";
import { PagedResponse } from "@/types/common.types";
import { ActionResult, TaxZone, TaxZoningFormModel, TaxZonning, Ward } from "@/types/taxzoning.types";


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



export async function getTaxZonningPagedAction(
  pageNumber: number,
  pageSize: number
) {
  try {
    const data = await getTaxZonningPagedServer(pageNumber, pageSize);

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
export async function getTaxZonningPropertyNoPagedAction(
  pageNumber: number,
  pageSize: number
) {
  try {
    const data = await getTaxZonningPropertyNoServer(pageNumber, pageSize);

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
// export async function getTaxZonningByWardAction(
//   wardNo: string,
//   pageSize = 100
// ) {
//   try {
//     const data = await getTaxZonningByWardServer(wardNo, pageSize);

//     return {
//       success: true,
//       data,
//     };
//   } catch (error) {
//     if (error instanceof ApiError) {
//       return {
//         success: false,
//         error: error.message,
//       };
//     }

//     return {
//       success: false,
//       error: "Failed to fetch property numbers",
//     };
//   }
// }

export async function getTaxZonningByWardAction(
  wardNo: string,
  pageSize = 100,
  pageNumber = 1
): Promise<ActionResult<PagedResponse<TaxZonning>>> {
  try {
    const data = await getTaxZonningByWardServer(
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

export async function getAllTaxZonningAction(
  pageNumber: number,
  pageSize: number
): Promise<ActionResult<PagedResponse<TaxZonning>>> {
  try {
    const data = await getAllTaxZonningServer(pageNumber, pageSize);

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