import { MASTER_IDS, type MasterDataRecord } from "@/types/asset-masters/master-data.types";
import { assetTypeService } from "./asset-type-crud.service";
import { assetCategoryService } from "./asset-category-crud.service";

interface ApiItem {
  id: number;
  typeCode?: string;
  code?: string;
  categoryCode?: string;
  typeName?: string;
  name?: string;
  categoryName?: string;
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
  sortBy: string = "",
  sortOrder: "asc" | "desc" = "asc"
) {
  try {
    let data: { records: MasterDataRecord[]; totalCount: number; totalPages: number; pageNumber: number; pageSize: number } = { records: [], totalCount: 0, totalPages: 1, pageNumber, pageSize };

    if (masterId === MASTER_IDS.TYPE) {
      const res = await assetTypeService.getAll({ PageNumber: pageNumber, PageSize: pageSize, SearchTerm: searchTerm, SortBy: sortBy, SortOrder: sortOrder });
      data = {
        records: (res.items as unknown as ApiItem[])?.map((item) => ({
          ...item,
          id: String(item.id),
          code: item.typeCode || item.code,
          name: item.typeName || item.name,
          description: item.description,
          status: (item.status === "Inactive" || item.isActive === false || String(item.isActive) === "false" || item.isActive === 0 || item.IsActive === false || item.IsActive === 0) ? "Inactive" : "Active",
        })) as MasterDataRecord[] || [],
        totalCount: res.totalCount,
        totalPages: res.totalPages,
        pageNumber: res.pageNumber,
        pageSize: res.pageSize,
      };
    } else if (masterId === MASTER_IDS.CATEGORY) {
      const res = await assetCategoryService.getAll({ PageNumber: pageNumber, PageSize: pageSize, SearchTerm: searchTerm, SortBy: sortBy, SortOrder: sortOrder });
      data = {
        records: (res.items as unknown as ApiItem[])?.map((item) => ({
          ...item,
          id: String(item.id),
          code: item.categoryCode || item.code,
          name: item.categoryName || item.name,
          description: item.description,
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
