"use server";

import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import {
    createAssetPhotoType,
    deleteAssetPhotoType,
    getAssetPhotoPaged,
    getAssetPhotoTypeById,
    updateAssetPhotoType,
    getAssetCategories,
    getAssetTypes
} from "@/lib/api/asset-masters/asset-photo-crud.service";
import { ApiError } from "@/lib/utils/api";
import { AssetPhotoType, AssetPhotoTypeFormModel } from "@/types/asset-masters/asset-photo-type.types";
import { PagedResponse } from "@/types/common.types";
import { cookies } from "next/headers";
import { getUserIdFromCookies } from "@/lib/utils/cookie";
import { createLogger } from "@/lib/utils/server-logger";

const logger = createLogger("AssetPhotoTypeActions");


export async function fetchAssetPhotoPagedServerAction(
    pageNumber: number,
    pageSize: number,
    searchTerm?: string,
    sortBy?: string,
    sortOrder?: string
): Promise<PagedResponse<AssetPhotoType>> {
    try {
        const MAX_PAGE_SIZE = 100;
        const MAX_PAGE_NUMBER = 10000;
        if (
            !Number.isFinite(pageNumber) ||
            !Number.isFinite(pageSize) ||
            pageNumber <= 0 ||
            pageSize <= 0 ||
            pageSize > MAX_PAGE_SIZE ||
            pageNumber > MAX_PAGE_NUMBER
        ) {
            throw new ApiError(400, "Invalid pagination parameters", "Validation failed");
        }

        const allowedSortColumns = ["photoTypeCode", "photoTypeName", "displayOrder", "description"];
        const validSortBy = sortBy && allowedSortColumns.includes(sortBy) ? sortBy : undefined;
        const validSortOrder = sortOrder && ["asc", "desc"].includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : undefined;

        const result = await getAssetPhotoPaged(pageNumber, pageSize, searchTerm, validSortBy, validSortOrder);
        return result;
    } catch (error: unknown) {
        logger.error("Failed to fetch asset photo types paged", { pageNumber, pageSize, searchTerm, sortBy, sortOrder }, error);
        throw error;
    }
}

export async function createAssetPhotoAction(
    data: AssetPhotoTypeFormModel
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
    try {
        const cookieStore = await cookies();
        const userId = getUserIdFromCookies(cookieStore);
        if (userId) {
            data.createdBy = userId;
        }
        const msg = await createAssetPhotoType(data);

        for (const locale of locales) {
            revalidatePath(`/${locale}/assets/configuration/master-data/asset-photo-type`, "page");
        }
        return { success: true, message: msg };
    } catch (error: unknown) {
        if (error instanceof ApiError) {
            return {
                success: false,
                message: error.responseText,
                statusCode: error.statusCode
            };
        }
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: "Failed to create asset photo type" };
    }
}

export async function updateAssetPhotoAction(
    data: AssetPhotoTypeFormModel
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
    try {
        const cookieStore = await cookies();
        const userId = getUserIdFromCookies(cookieStore);
        if (userId) {
            data.updatedBy = userId;
        }
        const msg = await updateAssetPhotoType(data);

        for (const locale of locales) {
            revalidatePath(`/${locale}/assets/configuration/master-data/asset-photo-type`, "page");
        }
        return { success: true, message: msg };
    } catch (error: unknown) {
        if (error instanceof ApiError) {
            return {
                success: false,
                message: error.responseText,
                statusCode: error.statusCode
            };
        }
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: "Failed to update asset photo type" };
    }
}

export async function deleteAssetPhotoTypeAction(
    formData: FormData
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
    const rawId = formData.get("id");
    const id = typeof rawId === "string" ? parseInt(rawId, 10) : 0;

    if (!id || id <= 0) {
        return {
            success: false,
            message: "Valid Asset Photo Type ID is required",
            statusCode: 400,
        };
    }

    try {
        await deleteAssetPhotoType(id);

        for (const locale of locales) {
            revalidatePath(`/${locale}/assets/configuration/master-data/asset-photo-type`, "page");
        }
        return {
            success: true,
            message: "Asset photo type deleted successfully",
        };
    } catch (error) {
        if (error instanceof ApiError) {
            return {
                success: false,
                message: error.responseText,
                statusCode: error.statusCode,
            };
        }
        return {
            success: false,
            message: "Failed to delete asset photo type",
        };
    }
}

export async function getAssetPhotoTypeByIdAction(
    id: number
): Promise<AssetPhotoType> {
    try {
        if (!id || id <= 0) {
            throw new ApiError(400, "Valid Asset Photo Type ID is required", "Validation failed");
        }
        const result = await getAssetPhotoTypeById(id);
        if (!result) {
            throw new ApiError(404, "Asset Photo Type not found", "Not Found");
        }
        return result;
    } catch (error) {
        logger.error("Failed to fetch asset photo type by ID", { id }, error);
        throw error;
    }
}

export async function getAssetCategoriesAction() {
    try {
        return await getAssetCategories();
    } catch (error) {
        logger.error("Failed to fetch asset categories", {}, error);
        throw error;
    }
}

export async function getAssetTypesAction() {
    try {
        return await getAssetTypes();
    } catch (error) {
        logger.error("Failed to fetch asset types", {}, error);
        throw error;
    }
}

export async function getAssetTypesByCategoryAction(assetCategoryId?: number) {
    try {
        return await getAssetTypes(assetCategoryId);
    } catch (error) {
        logger.error("Failed to fetch asset types by category", { assetCategoryId }, error);
        throw error;
    }
}
