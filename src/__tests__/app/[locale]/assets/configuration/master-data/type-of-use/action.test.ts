import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError } from "@/lib/utils/api";
import {
  fetchTypeOfUseGroupsPagedAction,
  fetchAssetTypeOfUsesAction,
  fetchAssetSubTypeOfUsesAction,
  fetchTypeOfUseGroupByIdAction,
  fetchAssetTypeOfUseByIdAction,
  fetchAssetSubTypeOfUseByIdAction,
} from "@/app/[locale]/assets/configuration/master-data/type-of-use/action";

const mockRevalidatePath = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/utils/cookie", () => ({
  getUserIdFromCookies: vi.fn(() => 99),
}));

vi.mock("@/lib/utils/server-logger", () => ({
  createLogger: () => ({
    error: vi.fn(),
  }),
}));

vi.mock("@/lib/api/asset-masters/type-of-use.service", () => ({
  getTypeOfUseGroupsPaged: vi.fn(),
  getTypeOfUseGroupsAllActive: vi.fn(),
  getTypeOfUseGroupById: vi.fn(),
  createTypeOfUseGroup: vi.fn(),
  updateTypeOfUseGroup: vi.fn(),
  deleteTypeOfUseGroup: vi.fn(),
  getAssetTypeOfUses: vi.fn(),
  getAssetTypeOfUseById: vi.fn(),
  createAssetTypeOfUse: vi.fn(),
  updateAssetTypeOfUse: vi.fn(),
  deleteAssetTypeOfUse: vi.fn(),
  getAssetSubTypeOfUses: vi.fn(),
  getAssetSubTypeOfUseById: vi.fn(),
  createAssetSubTypeOfUse: vi.fn(),
  updateAssetSubTypeOfUse: vi.fn(),
  deleteAssetSubTypeOfUse: vi.fn(),
  getAssetTypeOfUsesAllActive: vi.fn(),
  getAssetTypeOfUsesPaged: vi.fn(),
  getAssetSubTypeOfUsesPaged: vi.fn(),
}));

describe("type-of-use actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid paged group params", async () => {
    await expect(fetchTypeOfUseGroupsPagedAction(0, 10)).rejects.toBeInstanceOf(ApiError);
  });

  it("fetches type of use rows with the provided service", async () => {
    const service = await import("@/lib/api/asset-masters/type-of-use.service");
    vi.mocked(service.getAssetTypeOfUses).mockResolvedValue([{ id: 1 }] as never);

    const result = await fetchAssetTypeOfUsesAction(12, true);

    expect(service.getAssetTypeOfUses).toHaveBeenCalledWith(12, true);
    expect(result).toEqual([{ id: 1 }]);
  });

  it("fetches sub-type rows with the provided service", async () => {
    const service = await import("@/lib/api/asset-masters/type-of-use.service");
    vi.mocked(service.getAssetSubTypeOfUses).mockResolvedValue([{ id: 2 }] as never);

    const result = await fetchAssetSubTypeOfUsesAction(44, false);

    expect(service.getAssetSubTypeOfUses).toHaveBeenCalledWith(44, false);
    expect(result).toEqual([{ id: 2 }]);
  });

  it("rejects invalid group id lookups", async () => {
    await expect(fetchTypeOfUseGroupByIdAction(0)).rejects.toBeInstanceOf(ApiError);
  });

  it("rejects invalid type id lookups", async () => {
    await expect(fetchAssetTypeOfUseByIdAction(0)).rejects.toBeInstanceOf(ApiError);
  });

  it("rejects invalid subtype id lookups", async () => {
    await expect(fetchAssetSubTypeOfUseByIdAction(0)).rejects.toBeInstanceOf(ApiError);
  });
});
