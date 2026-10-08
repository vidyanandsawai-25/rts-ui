import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getChargeHeadsPaged,
  getChargeHeadById,
  createChargeHead,
  updateChargeHead,
  deleteChargeHead,
  purgeChargeHead,
} from "@/lib/api/water-bill/chargeHeads.service";
import { apiClient } from "@/services/api.service";

vi.mock("next-intl/server", () => ({
  getTranslations: () => Promise.resolve((key: string) => `common.${key}`),
}));

vi.mock("@/services/api.service", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("chargeHeads.service Tests", () => {
  const samplePagedData = {
    items: [
      {
        id: 1,
        code: "WTR_CHG",
        name: "Water Charge",
        chargeType: "Charge",
        isTax: false,
        isPenalty: false,
        isRefundable: false,
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

  it("should fetch paged charge heads with query parameters", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      success: true,
      data: samplePagedData,
      statusCode: 200,
    });

    const response = await getChargeHeadsPaged({
      pageNumber: 1,
      pageSize: 10,
      searchTerm: "WTR",
      sortBy: "name",
      sortOrder: "asc",
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining("/ChargeHeadMaster?PageNumber=1&PageSize=10&SearchTerm=WTR&SortBy=name&SortOrder=asc")
    );
    expect(response.success).toBe(true);
    expect(response.data?.items.length).toBe(1);
  });

  it("should handle error response when fetching paged list fails", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error("Database connection error"));

    const response = await getChargeHeadsPaged();

    expect(response.success).toBe(false);
    expect(response.error).toBe("Database connection error");
    expect(response.statusCode).toBe(500);
  });

  it("should fetch a single charge head by ID", async () => {
    const sampleItem = samplePagedData.items[0];
    vi.mocked(apiClient.get).mockResolvedValue({
      success: true,
      data: sampleItem,
      statusCode: 200,
    });

    const response = await getChargeHeadById(1);

    expect(apiClient.get).toHaveBeenCalledWith("/ChargeHeadMaster/1");
    expect(response.success).toBe(true);
    expect(response.data?.id).toBe(1);
  });

  it("should handle 404 when charge head is not found", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      success: false,
      error: "Not found",
      statusCode: 404,
    });

    const response = await getChargeHeadById(999);

    expect(response.success).toBe(false);
    expect(response.statusCode).toBe(404);
  });

  it("should send POST request when creating a new charge head", async () => {
    const dto = {
      code: "WTR_FEE",
      name: "Water Connection Fee",
      chargeType: "Fee",
      isTax: false,
      isPenalty: false,
      isRefundable: false,
      isActive: true,
    };

    vi.mocked(apiClient.post).mockResolvedValue({
      success: true,
      data: { id: 2, ...dto },
      statusCode: 201,
    });

    const response = await createChargeHead(dto);

    expect(apiClient.post).toHaveBeenCalledWith("/ChargeHeadMaster", expect.objectContaining(dto));
    expect(response.success).toBe(true);
    expect(response.data?.id).toBe(2);
  });

  it("should send PUT request when updating an existing charge head", async () => {
    const dto = {
      id: 1,
      code: "WTR_CHG_UPD",
      name: "Water Charge Updated",
      chargeType: "Charge",
      isTax: false,
      isPenalty: false,
      isRefundable: false,
      isActive: true,
    };

    vi.mocked(apiClient.put).mockResolvedValue({
      success: true,
      data: { ...dto },
      statusCode: 200,
    });

    const response = await updateChargeHead(1, dto);

    expect(apiClient.put).toHaveBeenCalledWith("/ChargeHeadMaster/1", expect.objectContaining(dto));
    expect(response.success).toBe(true);
  });

  it("should attempt DELETE request when deleting a charge head", async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({
      success: true,
      statusCode: 200,
    });

    const response = await deleteChargeHead(1);

    expect(apiClient.delete).toHaveBeenCalledWith("/ChargeHeadMaster/1");
    expect(response.success).toBe(true);
  });

  it("should send DELETE request to purge endpoint when purging a charge head", async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({
      success: true,
      statusCode: 200,
    });

    const response = await purgeChargeHead(1);

    expect(apiClient.delete).toHaveBeenCalledWith("/ChargeHeadMaster/1");
    expect(response.success).toBe(true);
  });

  it("should normalize PascalCase and DTO-prefixed backend response properties", async () => {
    const rawPascalData = {
      Items: [
        {
          Id: 10,
          Code: "WTR_TAX",
          Name: "Water Tax",
          ChargeType: "Tax",
          IsTax: true,
          IsPenalty: false,
          IsRefundable: true,
          IsActive: true,
        },
      ],
      TotalCount: 1,
      PageNumber: 1,
      PageSize: 10,
      TotalPages: 1,
      HasPreviousPage: false,
      HasNextPage: false,
    };

    vi.mocked(apiClient.get).mockResolvedValue({
      success: true,
      data: rawPascalData,
      statusCode: 200,
    });

    const response = await getChargeHeadsPaged();

    expect(response.success).toBe(true);
    expect(response.data?.items.length).toBe(1);

    const item = response.data?.items[0];
    expect(item?.id).toBe(10);
    expect(item?.code).toBe("WTR_TAX");
    expect(item?.name).toBe("Water Tax");
    expect(item?.chargeType).toBe("Tax");
    expect(item?.isTax).toBe(true);
    expect(item?.isPenalty).toBe(false);
    expect(item?.isRefundable).toBe(true);
    expect(item?.isActive).toBe(true);
  });
});
