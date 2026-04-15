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
 
async function createFetchOptions(method: string = "GET", body?: unknown): Promise<RequestInit> {
  const headers: Record<string, string> = {
    "Accept": "application/json",
  };
 
  if (body) {
    headers["Content-Type"] = "application/json";
  }
  
  const options: RequestInit = {
    method,
    cache: "no-store",
    headers,
  };

  // For development with self-signed certificates, we need to use a custom agent
  if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
    try {
        const https = await import('https');
        const agent = new https.Agent({
          rejectUnauthorized: false,
        });
        // @ts-expect-error - Node.js fetch accepts agent
        options.agent = agent;
    } catch {
        // Ignore if https module is not available
    }
  }
  
  if (body) {
    options.body = JSON.stringify(body);
  }
 
  return options;
}
 
async function validateResponse(response: Response, context: string): Promise<void> {
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
    const items: AssessmentYearRV[] = data.map((item: unknown) => {
      const assessmentItem = item as AssessmentYearRV;
      return {
        ...assessmentItem,
        yearId: assessmentItem.yearRangeRVId || assessmentItem.yearId,
      } as AssessmentYearRV;
    });
    return {
      items,
      totalCount: data.length,
      pageNumber: pageNumber,
      pageSize: pageSize,
      totalPages: Math.ceil(data.length / pageSize),
      hasPrevious: pageNumber > 1,
      hasNext: pageNumber < Math.ceil(data.length / pageSize)
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
  const payload = { ...data, yearRangeRVId: data.yearId };
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