import { MASTER_IDS, type MasterDataRecord } from "@/types/asset-masters/master-data.types";
import { ownershipTypeService } from "./ownership-type.service";


interface ApiItem {
  id: number;
  typeCode?: string;
  code?: string;
  categoryCode?: string;
  modelCode?: string;
  subTypeCode?: string;
  typeName?: string;
  name?: string;
  categoryName?: string;
  modelName?: string;
  subTypeName?: string;
  description?: string;
  isActive?: boolean | number;
  [key: string]: unknown;
}
export async function getAssetMasterDataProvider(
  masterId: string,
  _selectedGroup: string,
  pageNumber: number = 1,
  pageSize: number = 10,
  searchTerm: string = "",
  _sortBy: string = "",
  _sortOrder: "asc" | "desc" = "asc"
) {
  try {
    let data: { records: MasterDataRecord[]; totalCount: number; totalPages: number; pageNumber: number; pageSize: number } = { records: [], totalCount: 0, totalPages: 1, pageNumber, pageSize };

    if (masterId === MASTER_IDS.OWNERSHIP_TYPE) {
      const res = await ownershipTypeService.getAll({
        PageNumber: pageNumber,
        PageSize: pageSize,
        SearchTerm: searchTerm,
      });
      data = {
        records: (res.items as unknown as ApiItem[])?.map((item) => ({
          ...item,
          id: String(item.id),
          code: (item.code || String(item.id)) as string,
          name: (item.ownershipTypeName || item.name || "") as string,
          description: item.description as string,
          status: (item.status === "Inactive" || item.isActive === false || String(item.isActive) === "false" || item.isActive === 0 || item.IsActive === false || item.IsActive === 0) ? "Inactive" : "Active",
        })) as MasterDataRecord[] || [],
        totalCount: res.totalCount,
        totalPages: res.totalPages,
        pageNumber: res.pageNumber,
        pageSize: res.pageSize,
      };
    }

    return { success: true, data };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch master data" };
  }
}
