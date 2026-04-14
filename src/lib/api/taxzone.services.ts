import { appConfig } from "@/config/app.config";
import type { PagedResponse, TaxZone, TaxZoneFormModel } from "@/types/taxzone.types";

// ⚠️ Dev only
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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

async function getHttpsAgent(): Promise<undefined> {
  return undefined;
}

async function createFetchOptions(method: string = "GET", body?: unknown): Promise<RequestInit> {
  const options: RequestInit = {
    method,
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  };

  if (body) options.body = JSON.stringify(body);

  await getHttpsAgent(); // no-op
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
  const fetchOptions = await createFetchOptions("GET");

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
  if (!taxZoneId) throw new Error("TaxZoneId is required");

  const fetchOptions = await createFetchOptions("GET");

  const response = await fetch(
    `${appConfig.api.baseUrl}/TaxZone/${taxZoneId}`,
    fetchOptions
  );

  await validateResponse(response, `Fetch tax zone ${taxZoneId}`);
  return response.json();
}

/** POST create */
// export async function createTaxZone(data: TaxZoneFormModel): Promise<void> {
//   if (!data.taxZoneNo?.trim()) throw new Error("Zone No is required");
//   if (!data.taxZoneType?.trim()) throw new Error("Zone Type is required");

//   const payload = {
//     taxZoneNo: data.taxZoneNo.trim(),
//     taxZoneType: data.taxZoneType.trim(),
//     remark: data.remark?.trim() || "",
//     createdBy: 1, // TODO: replace with auth user id
//   };

//   const fetchOptions = await createFetchOptions("POST", payload);

//   const response = await fetch(`${appConfig.api.baseUrl}/TaxZone`, fetchOptions);
//   await validateResponse(response, "Create tax zone");
// }

export async function createTaxZone(data: TaxZoneFormModel): Promise<void> {
  if (!data.taxZoneNo?.trim()) throw new Error("Zone No is required");
  if (!data.taxZoneType?.trim()) throw new Error("Zone Type is required");

  const payload = {
    taxZoneNo: data.taxZoneNo.trim(),
    taxZoneType: data.taxZoneType.trim(),
    remark: data.remark?.trim() || "",
    createdBy: 1,
    isActive: data.isActive, // ✅ added
  };

  const fetchOptions = await createFetchOptions("POST", payload);
  const response = await fetch(`${appConfig.api.baseUrl}/TaxZone`, fetchOptions);

  await validateResponse(response, "Create tax zone");
}


/** PUT update */
// export async function updateTaxZone(data: TaxZoneFormModel): Promise<void> {
//   if (!data.taxZoneNo?.trim()) throw new Error("Zone No is required for update");
//   if (!data.taxZoneType?.trim()) throw new Error("Zone Type is required");

//   const payload = {
//     taxZoneNo: data.taxZoneNo.trim(),
//     taxZoneType: data.taxZoneType.trim(),
//     remark: data.remark?.trim() || "",
//     updatedBy: 1, // TODO: replace with auth user id
//   };

//   const fetchOptions = await createFetchOptions("PUT", payload);

//   const response = await fetch(
//     `${appConfig.api.baseUrl}/TaxZone/${data.taxZoneNo}`,
//     fetchOptions
//   );

//   await validateResponse(response, "Update tax zone");
// }


export async function updateTaxZone(data: TaxZoneFormModel): Promise<void> {
  if (!data.taxZoneId) throw new Error("TaxZoneId is required for update");
  if (!data.taxZoneNo?.trim()) throw new Error("Zone No is required");
  if (!data.taxZoneType?.trim()) throw new Error("Zone Type is required");

  const payload = {
    taxZoneId: data.taxZoneId,
    taxZoneNo: data.taxZoneNo.trim(),
    taxZoneType: data.taxZoneType.trim(),
    remark: data.remark?.trim() || "",
    updatedBy: 1,
    isActive: data.isActive, // ✅ added
  };

  const fetchOptions = await createFetchOptions("PUT", payload);
  const response = await fetch(
    `${appConfig.api.baseUrl}/TaxZone/${data.taxZoneId}`,
    fetchOptions
  );

  await validateResponse(response, "Update tax zone");
}


/** DELETE */
export async function deleteTaxZone(taxZoneId: string | number): Promise<void> {
  if (!taxZoneId) throw new Error("Valid taxZoneId is required");

  const fetchOptions = await createFetchOptions("DELETE");

  const response = await fetch(
    `${appConfig.api.baseUrl}/TaxZone/${taxZoneId}`,
    fetchOptions
  );

  await validateResponse(response, `Delete tax zone ${taxZoneId}`);
}


export async function getAllTaxZonesSafe(): Promise<TaxZone[]> {
  try {
    const pageSize = 100; // adjust if needed
    let page = 1;
    const collected: TaxZone[] = [];

    while (page <= 50) { // safety cap
      const res = await getTaxZonePagedServer(page, pageSize);
      collected.push(...(res.items ?? []));

      if (!res.hasNext) break;
      page++;
    }

    return collected;
  } catch {
    return [];
  }
}

export async function checkTaxZoneNoExists(
  taxZoneNo: string,
  excludeTaxZoneId?: number
): Promise<boolean> {
  if (!taxZoneNo?.trim()) return false;

  const list = await getAllTaxZonesSafe();
  const search = taxZoneNo.trim().toLowerCase();

  return list.some((x) => {
    const id = (x.taxZoneNo ?? "").toLowerCase();
    if (excludeTaxZoneId && x.taxZoneId === excludeTaxZoneId) return false;
    return id === search;
  });
}

export async function checkTaxZoneTypeExists(
  taxZoneType: string,
  excludeTaxZoneId?: number
): Promise<boolean> {
  if (!taxZoneType?.trim()) return false;

  const list = await getAllTaxZonesSafe();
  const search = taxZoneType.trim().toLowerCase();

  return list.some((x) => {
    const type = (x.taxZoneType ?? "").toLowerCase();
    // If editing, allow same record’s own type
    if (excludeTaxZoneId && x.taxZoneId === excludeTaxZoneId) {
      return false;
    }
    return type === search;
  });
}
