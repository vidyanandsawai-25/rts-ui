"use server";

import { assetMasterService } from "@/lib/api/asset/municipal-Asset/new-add-new-asset/asset-master.service";
import { revalidatePath } from "next/cache";

/**
 * Server action to activate an asset and all its child records.
 * Calls PUT /AssetMaster/{id}/activate
 * This should be called only on Final Submit after all steps are complete.
 */
export async function activateAssetAction(assetId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await assetMasterService.activateAsset(assetId);
    if (response.success) {
      revalidatePath("/[locale]/assets/municipal-Asset", "page");
      return { success: true };
    }
    return { success: false, error: response.error || "Activation failed." };
  } catch (error) {

    return {
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error during asset activation."
    };
  }
}
