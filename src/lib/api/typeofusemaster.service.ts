import { apiClient } from "@/services/api.service";
import type {
  TypeOfUseMasterData,
  UseGroup,
  UseGroupIconKey,
  UseStatus,
  UseType,
  UseSubType,
} from "@/types/typeOfUse.types";

/** -------------------- PAGED RESPONSE -------------------- */
export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

/** -------------------- ICON MAPPING (GROUP) -------------------- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function apiIconToKey(icon: any): UseGroupIconKey {
  const v = String(icon ?? "").toLowerCase();
  if (v.includes("home")) return "home";
  if (v.includes("briefcase")) return "building";
  if (v.includes("building")) return "building";
  if (v.includes("factory")) return "factory";
  if (v.includes("school") || v.includes("graduation")) return "school";
  if (v.includes("wheat") || v.includes("leaf")) return "leaf";
  if (v.includes("map") || v.includes("pin")) return "map";
  return "home";
}

function iconKeyToApi(iconKey: UseGroupIconKey): string {
  switch (iconKey) {
    case "home":
      return "home-icon";
    case "building":
      return "building-icon";
    case "factory":
      return "factory-icon";
    case "school":
      return "school-icon";
    case "leaf":
      return "wheat-icon";
    case "map":
      return "map-pin-icon";
    default:
      return "home-icon";
  }
}

/** -------------------- MAP API -> UI (GROUP) -------------------- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiGroupToUi(g: any): UseGroup {
  return {
    typeOfUseGroupId: Number(g.id ?? g.typeOfUseGroupId ?? g.typeOfUseGroupID ?? 0),
    typeOfUseGroupCode: String(g.typeOfUseGroupCode ?? ""),
    groupName: String(g.groupName ?? ""),
    groupIcon: String(g.groupIcon ?? "home-icon"),
    isActive: g.isActive ?? g.IsActive ?? true,
    createdDate: g.createdDate ?? g.CreatedDate ?? undefined,
    updatedDate: g.updatedDate ?? g.UpdatedDate ?? null,
    // UI computed field
    status: (g.isActive === false || g.IsActive === false) ? "Inactive" : "Active",
  };
}

/** -------------------- MAP API -> UI (TYPE) -------------------- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiTypeToUi(t: any): UseType {
  return {
    typeOfUseId: Number(t.id ?? t.typeOfUseId ?? t.typeOfUseID ?? 0),
    typeOfUseCode: String(t.typeOfUseCode ?? ""),
    description: String(t.description ?? ""),
    type: String(t.type ?? ""),
    typeOfUseGroupId: Number(t.typeOfUseGroupId ?? t.typeOfUseGroupID ?? t.groupId ?? 0),
    searchKey: String(t.searchKey ?? t.SearchKey ?? ""),
    searchSequence: Number(t.searchSequence ?? t.SearchSequence ?? 0),
    isActive: t.isActive ?? t.IsActive ?? true,
    createdDate: t.createdDate ?? t.CreatedDate ?? undefined,
    updatedDate: t.updatedDate ?? t.UpdatedDate ?? null,
    // UI computed field
    status: (t.isActive === false || t.IsActive === false) ? "Inactive" : "Active",
  };
}







/** -------------------- ✅ MASTER GET (Groups + Types) -------------------- */
export async function getTypeOfUseMaster(): Promise<TypeOfUseMasterData> {
  const [groupsPaged, typesPaged] = await Promise.all([
    getUseGroupsPagedServer({ pageNumber: 1, pageSize: 1000 }),
    getUseTypesPagedServer({ pageNumber: 1, pageSize: 5000 }),
  ]);

  return {
    groups: groupsPaged.items,
    types: typesPaged.items,
    subTypes: [], // ✅ keep empty (subtypes will load paged per type)
  };
}

/* ====================================================================== */
/* =============================== GROUP APIS ============================ */
/* ====================================================================== */

export async function getUseGroupsPagedServer(params: {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: string;
  filterLogic?: number;
  typeOfUseGroupId?: number;
}): Promise<PagedResponse<UseGroup>> {
  const qs = new URLSearchParams();
  qs.set("PageNumber", String(params.pageNumber));
  qs.set("PageSize", String(params.pageSize));
  if (params.searchTerm) qs.set("SearchTerm", params.searchTerm);
  if (params.sortBy) qs.set("SortBy", params.sortBy);
  if (params.sortOrder) qs.set("SortOrder", params.sortOrder);
  if (typeof params.filterLogic === "number") qs.set("FilterLogic", String(params.filterLogic));
  if (typeof params.typeOfUseGroupId === "number") qs.set("TypeOfUseGroupId", String(params.typeOfUseGroupId));

  const response = await apiClient.get<PagedResponse<any>>(`/TypeOfUseGroup?${qs.toString()}`, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    throw new Error(response.error ?? "Failed to fetch groups");
  }

  const data = response.data!;
  return { ...data, items: (data.items ?? []).map(mapApiGroupToUi) };
}

export async function getUseGroupById(id: string | number): Promise<UseGroup | null> {
  const response = await apiClient.get<any>(`/TypeOfUseGroup/${id}`, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    return null;
  }
  
  return response.data ? mapApiGroupToUi(response.data) : null;
}

export async function createUseGroupApi(input: {
  typeOfUseGroupCode: string;
  groupName: string;
  groupIcon: UseGroupIconKey;
  isActive: boolean;
  createdBy?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> {
  const payload = {
    typeOfUseGroupCode: input.typeOfUseGroupCode?.trim(),
    groupName: input.groupName?.trim(),
    groupIcon: iconKeyToApi(input.groupIcon),
    isActive: input.isActive,
    createdBy: Number(input.createdBy ?? "1"),
  };

  const response = await apiClient.post<any>("/TypeOfUseGroup", payload, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    throw new Error(response.error ?? "Create group failed");
  }
  
  return response.data;
}

export async function updateUseGroupApi(input: {
  typeOfUseGroupId: number;
  typeOfUseGroupCode: string;
  groupName: string;
  groupIcon: UseGroupIconKey;
  isActive: boolean;
  updatedBy?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> {
  const payload = {
    typeOfUseGroupId: input.typeOfUseGroupId,
    typeOfUseGroupCode: input.typeOfUseGroupCode?.trim(),
    groupName: input.groupName?.trim(),
    groupIcon: iconKeyToApi(input.groupIcon),
    isActive: input.isActive,
    updatedBy: Number(input.updatedBy ?? "1"),
  };

  const response = await apiClient.put<any>(`/TypeOfUseGroup/${input.typeOfUseGroupId}`, payload, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    throw new Error(response.error ?? "Update group failed");
  }
  
  return response.data;
}

export async function deleteUseGroupApi(id: string | number) {
  const response = await apiClient.delete<any>(`/TypeOfUseGroup/${id}`, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    throw new Error(response.error ?? "Delete group failed");
  }
  
  return true;
}

/* ====================================================================== */
/* =============================== TYPE APIS ============================= */
/* ====================================================================== */

export async function getUseTypesPagedServer(params: {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: string;
  filterLogic?: number;
  typeOfUseId?: number;
  type?: string;
  typeOfUseGroupId?: number;
}): Promise<PagedResponse<UseType>> {
  const qs = new URLSearchParams();
  qs.set("PageNumber", String(params.pageNumber));
  qs.set("PageSize", String(params.pageSize));
  if (params.searchTerm) qs.set("SearchTerm", params.searchTerm);
  if (params.sortBy) qs.set("SortBy", params.sortBy);
  if (params.sortOrder) qs.set("SortOrder", params.sortOrder);
  if (typeof params.filterLogic === "number") qs.set("FilterLogic", String(params.filterLogic));
  if (typeof params.typeOfUseId === "number") qs.set("TypeOfUseId", String(params.typeOfUseId));
  if (params.type) qs.set("Type", params.type);
  if (typeof params.typeOfUseGroupId === "number") qs.set("TypeOfUseGroupId", String(params.typeOfUseGroupId));

  const response = await apiClient.get<PagedResponse<any>>(`/TypeOfUse?${qs.toString()}`, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    throw new Error(response.error ?? "Failed to fetch types");
  }

  const data = response.data!;
  return { ...data, items: (data.items ?? []).map(mapApiTypeToUi) };
}

export async function getUseTypeById(id: string | number): Promise<UseType | null> {
  const response = await apiClient.get<any>(`/TypeOfUse/${id}`, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    return null;
  }
  
  return response.data ? mapApiTypeToUi(response.data) : null;
}

export async function createUseTypeApi(input: {
  typeOfUseCode: string;
  description: string;
  type: string;
  typeOfUseGroupId: number;
  searchKey: string;
  searchSequence: number;
  isActive: boolean;
  createdBy?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> {
  const payload = {
    typeofusecode: input.typeOfUseCode?.trim(),
    description: input.description?.trim(),
    type: input.type,
    typeOfUsegroupId: input.typeOfUseGroupId,
    searchKey: input.searchKey?.trim(),
    searchSequence: input.searchSequence,
    isActive: input.isActive,
    createdBy: Number(input.createdBy ?? "1"),
  };

  const response = await apiClient.post<any>("/TypeOfUse", payload, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    throw new Error(response.error ?? "Create type failed");
  }
  
  return response.data;
}

export async function updateUseTypeApi(input: {
  typeOfUseId: number;
  typeOfUseCode: string;
  description: string;
  type: string;
  typeOfUseGroupId: number;
  searchKey: string;
  searchSequence: number;
  isActive: boolean;
  updatedBy?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> {
  const payload = {
    typeOfUseId: input.typeOfUseId,
    typeofusecode: input.typeOfUseCode?.trim(),
    description: input.description?.trim(),
    type: input.type,
    typeOfUsegroupId: input.typeOfUseGroupId,
    searchKey: input.searchKey?.trim(),
    searchSequence: input.searchSequence,
    isActive: input.isActive,
    updatedBy: Number(input.updatedBy ?? "1"),
  };

  const response = await apiClient.put<any>(`/TypeOfUse/${input.typeOfUseId}`, payload, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    throw new Error(response.error ?? "Update type failed");
  }
  
  return response.data;
}

export async function deleteUseTypeApi(id: string) {
  const response = await apiClient.delete<any>(`/TypeOfUse/${id}`, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    throw new Error(response.error ?? "Delete type failed");
  }
  
  return true;
}

/* ====================================================================== */
/* ============================ ✅ SUBTYPE APIS ========================== */
/* ====================================================================== */

/**
 * Swagger fields (from your screenshot):
 * subTypeOfUseId, description, descriptionEnglish, typeOfUseID, createdBy, ...
 */
// function mapApiSubTypeToUi(s: any): UseSubType {
//   return {
//     id: String(s.subTypeOfUseId ?? s.id ?? ""),
//     typeId: String(s.typeOfUseID ?? s.typeOfUseId ?? ""),
//     nameReg: String(s.description ?? ""),            // regional
//     nameEn: String(s.descriptionEnglish ?? ""),      // english
//     status: (s.status ?? "Active") as UseStatus,

//      keyboardShortCutKey: String(s.keyboardShortCutKey ?? ""),
//     keyWiseSequence:
//       s.keyWiseSequence === null || s.keyWiseSequence === undefined
//         ? 0
//         : Number(s.keyWiseSequence),
//   };
// }
// function mapApiSubTypeToUi(s: any): UseSubType {
//   const reg = String(s.description ?? "");
//   const en = String(s.descriptionEnglish ?? "");

//   return {
//     id: String(s.subTypeOfUseId ?? s.id ?? ""),
//     typeId: String(s.typeOfUseID ?? ""),
//     nameReg: reg,
//     nameEn: en || reg, // ✅ fallback if english null
//     status: (s.status ?? "Active") as UseStatus,
//     keyboardShortCutKey: String(s.keyboardShortCutKey ?? ""),
//     keyWiseSequence:
//       s.keyWiseSequence === null || s.keyWiseSequence === undefined
//         ? 0
//         : Number(s.keyWiseSequence),
//   };
// }

// function mapApiSubTypeToUi(s: any): UseSubType {
//   const desc = s.description ?? "";
//   const descEn = s.descriptionEnglish ?? "";

//   return {
//     id: String(s.subTypeOfUseId ?? s.subTypeOfUseID ?? s.id ?? ""),
//     typeId: String(s.typeOfUseID ?? s.typeOfUseId ?? ""),

//     // ✅ fallback so table never looks blank
//     nameEn: String(descEn || desc || ""),
//     nameReg: String(desc || descEn || ""),

//     status: (s.status ?? "Active") as UseStatus,

//     // ✅ API field is keyboardShortCutKey (your swagger shows it)
//     keyboardShortCutKey: String(s.keyboardShortCutKey ?? ""),
//     keyWiseSequence:
//       s.keyWiseSequence === null || s.keyWiseSequence === undefined
//         ? 0
//         : Number(s.keyWiseSequence),
//   };
// }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiSubTypeToUi(s: any): UseSubType {
  return {
    subTypeOfUseId: Number(s.id ?? s.subTypeOfUseId ?? s.subTypeOfUseID ?? 0),
    description: String(s.description ?? ""),
    typeOfUseId: Number(s.typeOfUseId ?? s.typeOfUseID ?? s.typeId ?? 0),
    searchKey: String(s.searchKey ?? s.SearchKey ?? ""),
    searchSequence: Number(s.searchSequence ?? s.SearchSequence ?? 0),
    isActive: s.isActive ?? s.IsActive ?? true,
    createdDate: s.createdDate ?? s.CreatedDate ?? undefined,
    updatedDate: s.updatedDate ?? s.UpdatedDate ?? null,
    // UI computed field
    status: (s.isActive === false || s.IsActive === false) ? "Inactive" : "Active",
  };
}


/** GET SubTypes (paged) - /api/SubTypeOfUse */
// export async function getSubTypesPagedServer(params: {
//   pageNumber: number;
//   pageSize: number;
//   typeOfUseID?: string;
//   description?: string;
//   searchTerm?: string;
//   sortBy?: string;
//   sortOrder?: string;
//   filterLogic?: number;
// }): Promise<PagedResponse<UseSubType>> {
//   let fetchOptions: RequestInit = {
//     method: "GET",
//     headers: { "Content-Type": "application/json", Accept: "application/json" },
//     cache: "no-store",
//   };
//   fetchOptions = await withDevSsl(fetchOptions);

//   const qs = new URLSearchParams();
//   qs.set("PageNumber", String(params.pageNumber));
//   qs.set("PageSize", String(params.pageSize));

//   if (params.typeOfUseID) qs.set("TypeOfUseID", params.typeOfUseID);
//   // if (params.typeOfUseID) qs.set("TypeOfUseID", params.typeOfUseID);


//   if (params.description) qs.set("Description", params.description);

//   if (params.searchTerm) qs.set("SearchTerm", params.searchTerm);
//   if (params.sortBy) qs.set("SortBy", params.sortBy);
//   if (params.sortOrder) qs.set("SortOrder", params.sortOrder);
//   if (typeof params.filterLogic === "number") qs.set("FilterLogic", String(params.filterLogic));

//   const res = await fetch(`${appConfig.api.baseUrl}SubTypeOfUse?${qs.toString()}`, fetchOptions);
//   if (!res.ok) {
//     const raw = await res.text().catch(() => "");
//     throw new Error(`Failed to fetch sub-types: ${res.status} ${res.statusText} ${raw}`);
//   }

//   const data = (await res.json()) as PagedResponse<any>;
//   return { ...data, items: (data.items ?? []).map(mapApiSubTypeToUi) };
// }
export async function getSubTypesPagedServer(params: {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: string;
  filterLogic?: number;
  typeOfUseId?: number;
}): Promise<PagedResponse<UseSubType>> {
  const qs = new URLSearchParams();
  qs.set("PageNumber", String(params.pageNumber));
  qs.set("PageSize", String(params.pageSize));
  if (params.searchTerm) qs.set("SearchTerm", params.searchTerm);
  if (params.sortBy) qs.set("SortBy", params.sortBy);
  if (params.sortOrder) qs.set("SortOrder", params.sortOrder);
  if (typeof params.filterLogic === "number") qs.set("FilterLogic", String(params.filterLogic));
  if (typeof params.typeOfUseId === "number") qs.set("TypeOfUseId", String(params.typeOfUseId));

  const response = await apiClient.get<PagedResponse<any>>(`/SubTypeOfUse?${qs.toString()}`, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    throw new Error(response.error ?? "Failed to fetch sub-types");
  }

  const data = response.data!;
  return { ...data, items: (data.items ?? []).map(mapApiSubTypeToUi) };
}

export async function getSubTypeByIdApi(id: string | number): Promise<UseSubType | null> {
  const response = await apiClient.get<any>(`/SubTypeOfUse/${id}`, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    return null;
  }
  
  return response.data ? mapApiSubTypeToUi(response.data) : null;
}

export async function createSubTypeApi(input: {
  description: string;
  typeOfUseId: number;
  searchKey: string;
  searchSequence: number;
  isActive: boolean;
  createdBy?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> {
  const payload = {
    description: input.description?.trim(),
    typeOfUseId: input.typeOfUseId,
    searchKey: input.searchKey?.trim(),
    searchSequence: input.searchSequence,
    isActive: input.isActive,
    createdBy: Number(input.createdBy ?? "1"),
  };

  const response = await apiClient.post<any>("/SubTypeOfUse", payload, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    throw new Error(response.error ?? "Create sub-type failed");
  }
  
  return response.data;
}

export async function updateSubTypeApi(input: {
  subTypeOfUseId: number;
  description: string;
  typeOfUseId: number;
  searchKey: string;
  searchSequence: number;
  isActive: boolean;
  updatedBy?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> {
  const payload = {
    subTypeOfUseId: input.subTypeOfUseId,
    description: input.description?.trim(),
    typeOfUseId: input.typeOfUseId,
    searchKey: input.searchKey?.trim(),
    searchSequence: input.searchSequence,
    isActive: input.isActive,
    updatedBy: Number(input.updatedBy ?? "1"),
  };

  const response = await apiClient.put<any>(`/SubTypeOfUse/${input.subTypeOfUseId}`, payload, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    throw new Error(response.error ?? "Update sub-type failed");
  }
  
  return response.data;
}

/** DELETE SubType - /api/SubTypeOfUse/{id} */
export async function deleteSubTypeApi(id: string) {
  const response = await apiClient.delete<any>(`/SubTypeOfUse/${id}`, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    throw new Error(response.error ?? "Delete sub-type failed");
  }
  
  return true;
}

export async function getSubTypeCountByTypeIds(typeIds: string[]) {
  const response = await apiClient.post<{ [key: string]: number }>(
    "/SubTypeOfUse/CountByType",
    { typeIds },
    {
      cache: "no-store",
      headers: { "Accept": "application/json" },
    }
  );

  if (!response.success) {
    throw new Error(response.error ?? "Failed to fetch subtype counts");
  }

  return response.data; // { [typeId]: number }
}
