import { appConfig } from "@/config/app.config";
import type { AssessmentYearPagedResponseRV, AssessmentYearRV } from "@/types/assessmentYearMaster.types";
 
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public responseText: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}
 
export async function createFetchOptions(
  method: string = "GET",
  body?: unknown
): Promise<RequestInit> {

  const options: RequestInit = {
    method,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
  };

  // Attach body if provided
  if (body !== undefined && body !== null) {
    options.body = JSON.stringify(body);
  }

  return options;
}
 
export async function validateResponse(response: Response, context: string): Promise<void> {
  if (!response.ok) {
    const responseText = await response.text();
    throw new ApiError(
      response.status,
      responseText,
      `${context}: ${response.status} ${response.statusText}`
    );
  }
}
 
/** GET paged (server) */
export async function getAssessmentYearsPagedServer(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
): Promise<AssessmentYearPagedResponseRV> {
  const fetchOptions = await createFetchOptions("GET");
 
  const params = new URLSearchParams({
    PageNumber: pageNumber.toString(),
    PageSize: pageSize.toString(),
  });
 
  if (searchTerm?.trim()) params.append("SearchTerm", searchTerm.trim());
 
  const response = await fetch(
    `${appConfig.api.baseUrl}/AssessmentYearRange?${params.toString()}`,
    { ...fetchOptions, cache: "no-store" }
  );
 
  await validateResponse(response, "Fetch assessment years (server-paged)");
  const data = await response.json();
 
  // Handle case where API might return items directly or in a different structure
  if (Array.isArray(data)) {
    const allItems: AssessmentYearRV[] = data.map((item: unknown) => {
      const assessmentItem = item as AssessmentYearRV;
      return {
        ...assessmentItem,
        yearId: assessmentItem.yearRangeRVId || assessmentItem.yearId,
      } as AssessmentYearRV;
    });

    const totalCount = allItems.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = allItems.slice(startIndex, endIndex);

    return {
      items,
      totalCount,
      pageNumber: pageNumber,
      pageSize: pageSize,
      totalPages,
      hasPrevious: pageNumber > 1,
      hasNext: pageNumber < totalPages
    };
  }
 
  if (data.items && Array.isArray(data.items)) {
    data.items = data.items.map((item: unknown) => {
      const assessmentItem = item as AssessmentYearRV;
      return {
        ...assessmentItem,
        yearId: assessmentItem.yearRangeRVId || assessmentItem.yearId,
      } as AssessmentYearRV;
    });
  }
 
  return data;
}
 
export async function createAssessmentYear(data: Partial<AssessmentYearRV>): Promise<AssessmentYearRV> {
  const payload = { ...data, yearRangeRVId: data.yearRangeRVId ?? data.yearId };
  const fetchOptions = await createFetchOptions("POST", payload);
  const response = await fetch(
    `${appConfig.api.baseUrl}/AssessmentYearRange`,
    fetchOptions
  );
  await validateResponse(response, "Create assessment year");
  const resJson = await response.json();
  const item = (resJson.items ?? resJson);
  return { ...item, yearId: item.yearRangeRVId || item.yearId } as AssessmentYearRV;
}
 
export async function updateAssessmentYear(data: AssessmentYearRV): Promise<AssessmentYearRV> {
  // Use yearRangeId or yearId as canonical identifier
  const id = data.yearRangeRVId ?? data.yearId;
  if (id == null) {
    throw new Error("updateAssessmentYear: yearRangeRVId or yearId must be provided.");
  }

  const payload = {
    ...data,
    yearRangeRVId: data.yearRangeRVId ?? data.yearId,
  };
  const fetchOptions = await createFetchOptions("PUT", payload);
  const response = await fetch(
    `${appConfig.api.baseUrl}/AssessmentYearRange/${id}`,
    fetchOptions
  );
  await validateResponse(response, "Update assessment year");
  const resJson = await response.json();
  const item = (resJson.items ?? resJson);
  return { ...item, yearId: item.yearRangeRVId || item.yearId } as AssessmentYearRV;
}
 
export async function deleteAssessmentYear(id: number): Promise<void> {
  const fetchOptions = await createFetchOptions("DELETE");
  const response = await fetch(
    `${appConfig.api.baseUrl}/AssessmentYearRange/${id}`,
    fetchOptions
  );
  await validateResponse(response, "Delete assessment year");
}
 
export async function getAssessmentYearById(id: number): Promise<AssessmentYearRV> {
  const fetchOptions = await createFetchOptions("GET");
  const response = await fetch(
    `${appConfig.api.baseUrl}/AssessmentYearRange/${id}`,
    fetchOptions
  );
  await validateResponse(response, "Get assessment year by id");
  const resJson = await response.json();
  const item = (resJson.items ?? resJson);
  return { ...item, yearId: item.yearRangeRVId || item.yearId } as AssessmentYearRV;
}