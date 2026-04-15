
import { appConfig } from "@/config/app.config";
import type { AssessmentYearCV,  AssessmentYearPagedResponseCV } from "@/types/assessmentYearMaster.types";


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
  const options: RequestInit = {
    method,
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  };

  if (body) options.body = JSON.stringify(body);
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
export async function getAssessmentYearsPagedServerCV(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
): Promise<AssessmentYearPagedResponseCV> {
  const fetchOptions = await createFetchOptions("GET");

  const params = new URLSearchParams({
    PageNumber: pageNumber.toString(),
    PageSize: pageSize.toString(),
  });

  if (searchTerm?.trim()) params.append("SearchTerm", searchTerm.trim());

  const response = await fetch(
    `${appConfig.api.baseUrl}/AssessmentYearRangeCV?${params.toString()}`,
    { ...fetchOptions, cache: "no-store" }
  );

  await validateResponse(response, "Fetch assessment years CV (server-paged)");
  const data = await response.json();
  
  // Handle case where API might return items directly or in a different structure
  if (Array.isArray(data)) {
    const items: AssessmentYearCV[] = data.map((item: unknown) => {
      if (typeof item === "object" && item !== null) {
        const record = item as Record<string, unknown>;
        const yearRangeCVId = record.yearRangeCVId;
        return {
          ...record,
          yearId: typeof yearRangeCVId === "number" ? yearRangeCVId : record.yearId,
        } as AssessmentYearCV;
      }
      return item as AssessmentYearCV;
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
      if (typeof item === "object" && item !== null) {
        const i = item as Record<string, unknown>;
        return {
          ...i,
          yearId: typeof i.yearRangeCVId === "number" ? i.yearRangeCVId : i.yearId,
        };
      }
      return item;
    });
  }

  return data;
}

export async function createAssessmentYearCV(data: Partial<AssessmentYearCV>): Promise<AssessmentYearCV> {
  const payload = { ...data, yearRangeCVId: data.yearId };
  const fetchOptions = await createFetchOptions("POST", payload);
  const response = await fetch(
    `${appConfig.api.baseUrl}/AssessmentYearRangeCV`,
    fetchOptions
  );
  await validateResponse(response, "Create assessment year CV");
  const resJson = await response.json();
  const item = (resJson.items ?? resJson);
  return { ...item, yearId: item.yearRangeCVId || item.yearId } as AssessmentYearCV;
}

export async function updateAssessmentYearCV(data: AssessmentYearCV): Promise<AssessmentYearCV> {
  // Derive identifier from yearId or yearRangeCVId
  const id = data.yearId ?? data.yearRangeCVId;
  if (id == null) {
    throw new ApiError(400, "", "Update assessment year CV: Missing identifier (yearId/yearRangeCVId)");
  }

  const payload = {
    ...data,
    ...(data.yearId != null ? { yearRangeCVId: data.yearId } : {}),
  };
  const fetchOptions = await createFetchOptions("PUT", payload);
  const response = await fetch(
    `${appConfig.api.baseUrl}/AssessmentYearRangeCV/${id}`,
    fetchOptions
  );
  await validateResponse(response, "Update assessment year CV");
  const resJson = await response.json();
  const item = (resJson.items ?? resJson);
  return { ...item, yearId: item.yearRangeCVId || item.yearId } as AssessmentYearCV;
}

export async function deleteAssessmentYearCV(id: number): Promise<void> {
  const fetchOptions = await createFetchOptions("DELETE");
  const response = await fetch(
    `${appConfig.api.baseUrl}/AssessmentYearRangeCV/${id}`,
    fetchOptions
  );
  await validateResponse(response, "Delete assessment year CV");
}

export async function getAssessmentYearByIdCV(id: number): Promise<AssessmentYearCV> {
  const fetchOptions = await createFetchOptions("GET");
  const response = await fetch(
    `${appConfig.api.baseUrl}/AssessmentYearRangeCV/${id}`,
    fetchOptions
  );
  await validateResponse(response, "Get assessment year CV by id");
  const resJson = await response.json();
  const item = (resJson.items ?? resJson);
  return { ...item, yearId: item.yearRangeCVId || item.yearId } as AssessmentYearCV;
}
