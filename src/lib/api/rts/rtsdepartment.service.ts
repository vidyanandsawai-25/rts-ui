import "server-only";

import { apiClient } from "@/services/api.service";
import type { PagedResponse } from "@/types/common.types";
import type { RtsDepartmentApiItem, RtsDepartmentQueryParams } from "@/types/rts/departments.types";

function buildUrl(params: RtsDepartmentQueryParams = {}): string {
  const searchParams = new URLSearchParams();

  if (params.DepartmentName) searchParams.set("DepartmentName", params.DepartmentName);
  if (params.PageNumber !== undefined) searchParams.set("PageNumber", String(params.PageNumber));
  if (params.PageSize !== undefined) searchParams.set("PageSize", String(params.PageSize));
  if (params.SearchTerm) searchParams.set("SearchTerm", params.SearchTerm);

  const query = searchParams.toString();
  return `/RTSDepartment${query ? `?${query}` : ""}`;
}

export async function getRtsDepartments(
  params: RtsDepartmentQueryParams = {}
): Promise<PagedResponse<RtsDepartmentApiItem>> {
  const response = await apiClient.get<PagedResponse<RtsDepartmentApiItem>>(buildUrl(params), {
    cache: "no-store",
  }, false);

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch RTS departments");
  }

  return response.data;
}

export async function getAllRtsDepartments(): Promise<RtsDepartmentApiItem[]> {
  const response = await getRtsDepartments({
    PageNumber: 1,
    PageSize: -1,
  });

  return response.items;
}
