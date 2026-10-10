import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getTariffWorkbenchesPaged,
  getTariffWorkbenchById,
  createTariffWorkbench,
  updateTariffWorkbench,
  purgeTariffWorkbench,
} from "@/lib/api/water-bill/tariff-workbench/tariffWorkbench.service";
import { apiClient } from "@/services/api.service";
import type {
  CreateTariffWorkbenchDto,
  UpdateTariffWorkbenchDto,
} from "@/types/water-bill/tariff-workbench/tariffWorkbench.types";

vi.mock("next-intl/server", () => ({
  getTranslations: () => Promise.resolve((key: string) => `tariffWorkbench.${key}`),
}));

vi.mock("@/services/api.service", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("tariffWorkbench.service Tests", () => {
  const samplePagedData = {
    items: [
      {
        id: 1,
        tariffCode: "RES-MTR-2026",
        tariffName: "Residential Metered 2026-27",
        financialYearId: 1,
        connectionTypeId: 1,
        connectionCategoryId: 1,
        billingMethod: "Metered",
        effectiveFrom: "2026-04-01",
        effectiveTo: "2027-03-31",
        versionNo: 1,
        status: "Published",
        description: "Test Description",
        isActive: true,
      },
    ],
    totalCount: 1,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch paged tariff workbenches with query parameters", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      success: true,
      data: samplePagedData,
      statusCode: 200,
    });

    const response = await getTariffWorkbenchesPaged({
      pageNumber: 1,
      pageSize: 10,
      searchTerm: "RES",
      sortBy: "tariffCode",
      sortOrder: "asc",
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining("/TariffMaster?PageNumber=1&PageSize=10&SearchTerm=RES&SortBy=tariffCode&SortOrder=asc")
    );
    expect(response.success).toBe(true);
    expect(response.data?.items.length).toBe(1);
  });

  it("should handle error when fetching paged list fails", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error("Network Error"));

    const response = await getTariffWorkbenchesPaged();

    expect(response.success).toBe(false);
    expect(response.error).toBe("Network Error");
    expect(response.statusCode).toBe(500);
  });

  it("should fetch a single tariff workbench by ID", async () => {
    const sampleItem = samplePagedData.items[0];
    vi.mocked(apiClient.get).mockResolvedValue({
      success: true,
      data: sampleItem,
      statusCode: 200,
    });

    const response = await getTariffWorkbenchById(1);

    expect(apiClient.get).toHaveBeenCalledWith("/TariffMaster/1");
    expect(response.success).toBe(true);
    expect(response.data?.id).toBe(1);
  });

  it("should handle 404 when tariff workbench is not found", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      success: false,
      error: "Not found",
      statusCode: 404,
    });

    const response = await getTariffWorkbenchById(999);

    expect(response.success).toBe(false);
    expect(response.statusCode).toBe(404);
  });

  it("should send POST request when creating a new tariff workbench", async () => {
    const dto: CreateTariffWorkbenchDto = {
      tariffCode: "RES-MTR-2027",
      tariffName: "Residential Metered 2027-28",
      financialYearId: 2,
      connectionTypeId: 1,
      connectionCategoryId: 1,
      billingMethod: "Metered",
      effectiveFrom: "2027-04-01",
      versionNo: 1,
      status: "Draft",
      isActive: true,
    };

    vi.mocked(apiClient.post).mockResolvedValue({
      success: true,
      data: { id: 2, ...dto },
      statusCode: 201,
    });

    const response = await createTariffWorkbench(dto);

    expect(apiClient.post).toHaveBeenCalledWith("/TariffMaster", expect.objectContaining(dto));
    expect(response.success).toBe(true);
    expect(response.data?.id).toBe(2);
  });

  it("should send PUT request when updating an existing tariff workbench", async () => {
    const dto: UpdateTariffWorkbenchDto = {
      id: 1,
      tariffCode: "RES-MTR-2026-UPD",
      tariffName: "Updated Tariff Name",
      financialYearId: 1,
      connectionTypeId: 1,
      connectionCategoryId: 1,
      billingMethod: "Metered",
      effectiveFrom: "2026-04-01",
      versionNo: 1,
      status: "Draft",
      isActive: true,
    };

    vi.mocked(apiClient.put).mockResolvedValue({
      success: true,
      data: { ...dto },
      statusCode: 200,
    });

    const response = await updateTariffWorkbench(1, dto);

    expect(apiClient.put).toHaveBeenCalledWith("/TariffMaster/1", expect.objectContaining(dto));
    expect(response.success).toBe(true);
  });

  it("should send DELETE request to purge endpoint when purging a tariff workbench", async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({
      success: true,
      statusCode: 200,
    });

    const response = await purgeTariffWorkbench(1);

    expect(apiClient.delete).toHaveBeenCalledWith("/TariffMaster/1");
    expect(response.success).toBe(true);
  });
});
