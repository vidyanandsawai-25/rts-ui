import { apiClient } from "@/services/api.service";
import { ModuleMaster } from "@/types/home/module-master.types";
import { PagedResponse } from "@/types/common.types";
import { handleApiResponse, ApiError } from "@/lib/utils/api";
import { isModuleMasterShape, normalizeModuleMaster } from "./module-master-guard";

/**
 * Fetches home services data from the ModuleMaster API
 * Follows the standard project pattern with guards and normalization
 */
export async function getModuleMaster(): Promise<PagedResponse<ModuleMaster>> {
    try {
        // Fetch raw data as PagedResponse<unknown> to allow for normalization/guarding
        const response = await apiClient.get<PagedResponse<unknown>>("/ModuleMaster");
        
        if (process.env.NODE_ENV === 'development') {
            console.log("[getModuleMaster] API Response Status:", response.success ? "Success" : "Failure", 
                response.statusCode, response.error || "");
        }

        const data = handleApiResponse(response, "Failed to fetch module master data");
        
        if (!data || !Array.isArray(data.items)) {
            throw new ApiError(500, "Invalid data structure: items array missing", "ModuleMaster Fetch Error");
        }

        // Apply guards and normalization
        const normalizedItems = (data.items as unknown[])
            .filter(isModuleMasterShape)
            .map(normalizeModuleMaster);

        return {
            ...data,
            items: normalizedItems
        };
    } catch (error) {
        console.error("ModuleMaster Service Error:", error);
        throw error;
    }
}
