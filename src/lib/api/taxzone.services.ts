import { appConfig } from "@/config/app.config";
import type { PagedResponse, TaxZone, TaxZoneFormModel } from "@/types/taxzone.types";

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

function createFetchOptions(method: string = "GET", body?: unknown): RequestInit {
  const options: RequestInit = {
    method,
    cache: "no-store",
  };

  if (body) {
    options.body = JSON.stringify(body);
    options.headers = { "Content-Type": "application/json" };
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
export async function getTaxZonePagedServer(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
): Promise<PagedResponse<TaxZone>> {
  const fetchOptions = createFetchOptions("GET");

  const params = new URLSearchParams({
    PageNumber: pageNumber.toString(),
    PageSize: pageSize.toString(),
  });

  if (searchTerm?.trim()) params.append("SearchTerm", searchTerm.trim());

  const response = await fetch(
    `${appConfig.api.baseUrl}/TaxZone?${params.toString()}`,
    { ...fetchOptions, cache: "no-store" }
  );

  await validateResponse(response, "Fetch tax zones (server-paged)");
  return response.json();
}

/** GET by id */
export async function getTaxZoneById(taxZoneId: string | number): Promise<TaxZone> {
  const fetchOptions = createFetchOptions("GET");

  const response = await fetch(
    `${appConfig.api.baseUrl}/TaxZone/${taxZoneId}`,
    fetchOptions
  );

  await validateResponse(response, `Fetch tax zone ${taxZoneId}`);
  return response.json();
}

export async function createTaxZone(data: TaxZoneFormModel): Promise<void> {
  const payload = {
    taxZoneNo: data.taxZoneNo?.trim() || "",
    taxZoneType: data.taxZoneType?.trim() || "",
    remark: data.remark?.trim() || "",
    isActive: data.isActive,
  };

  const fetchOptions = createFetchOptions("POST", payload);
  const response = await fetch(`${appConfig.api.baseUrl}/TaxZone`, fetchOptions);

  await validateResponse(response, "Create tax zone");
}


export async function updateTaxZone(data: TaxZoneFormModel): Promise<void> {
  const payload = {
    taxZoneId: data.taxZoneId,
    taxZoneNo: data.taxZoneNo?.trim() || "",
    taxZoneType: data.taxZoneType?.trim() || "",
    remark: data.remark?.trim() || "",
    isActive: data.isActive,
  };

  const fetchOptions = createFetchOptions("PUT", payload);
  const response = await fetch(
    `${appConfig.api.baseUrl}/TaxZone/${data.taxZoneId}`,
    fetchOptions
  );

  await validateResponse(response, "Update tax zone");
}


/** DELETE */
export async function deleteTaxZone(taxZoneId: string | number): Promise<void> {
  const fetchOptions = createFetchOptions("DELETE");

  const response = await fetch(
    `${appConfig.api.baseUrl}/TaxZone/${taxZoneId}`,
    fetchOptions
  );

  await validateResponse(response, `Delete tax zone ${taxZoneId}`);
}



