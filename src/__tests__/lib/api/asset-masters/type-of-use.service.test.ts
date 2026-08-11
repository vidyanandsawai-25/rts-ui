import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getTypeOfUseGroupsPaged,
  createTypeOfUseGroup,
  updateTypeOfUseGroup,
  deleteTypeOfUseGroup,
  getAssetTypeOfUses,
  getAssetSubTypeOfUses,
} from "@/lib/api/asset-masters/type-of-use.service";
import { apiClient } from "@/services/api.service";
import { ApiError } from "@/lib/utils/api";

vi.mock("@/services/api.service", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Type of Use API Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTypeOfUseGroupsPaged", () => {
    it("should fetch groups successfully", async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [{ id: 1, typeOfUseGroupCode: "G1", groupName: "Group 1", isActive: true }],
          totalCount: 1,
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await getTypeOfUseGroupsPaged(1, 10, "query", "groupName", "asc");
      expect(apiClient.get).toHaveBeenCalledWith(
        "/asset-management/type-of-use-group?PageNumber=1&PageSize=10&MarkedForDeletion=false&SearchTerm=query&SortBy=groupName&SortOrder=asc"
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw ApiError when request fails", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        success: false,
        statusCode: 400,
        error: "Bad Request",
      });
      await expect(getTypeOfUseGroupsPaged(1, 10)).rejects.toThrow(ApiError);
    });
  });

  describe("createTypeOfUseGroup", () => {
    it("should create a group successfully", async () => {
      const mockResponse = {
        success: true,
        data: { id: 1 },
      };
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const payload = {
        typeOfUseGroupCode: "G1",
        groupName: "Group 1",
        groupIcon: "home",
        isActive: true,
      };
      await createTypeOfUseGroup(payload);
      expect(apiClient.post).toHaveBeenCalledWith("/asset-management/type-of-use-group", {
        ...payload,
        createdBy: null,
      });
    });
  });

  describe("updateTypeOfUseGroup", () => {
    it("should update a group successfully", async () => {
      const mockResponse = {
        success: true,
        data: { id: 1 },
      };
      vi.mocked(apiClient.put).mockResolvedValue(mockResponse);

      const payload = {
        id: 1,
        typeOfUseGroupCode: "G1",
        groupName: "Group 1",
        groupIcon: "home",
        isActive: true,
      };
      await updateTypeOfUseGroup(payload);
      expect(apiClient.put).toHaveBeenCalledWith("/asset-management/type-of-use-group/1", {
        ...payload,
        updatedBy: null,
      });
    });
  });

  describe("deleteTypeOfUseGroup", () => {
    it("should delete a group successfully", async () => {
      const mockResponse = {
        success: true,
      };
      vi.mocked(apiClient.delete).mockResolvedValue(mockResponse);

      await deleteTypeOfUseGroup(1);
      expect(apiClient.delete).toHaveBeenCalledWith("/asset-management/type-of-use-group/1");
    });
  });

  describe("getAssetTypeOfUses", () => {
    it("should fetch types successfully", async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [{ id: 1, typeOfUseCode: "T1", description: "Type 1", typeOfUseGroupId: 1, isActive: true }],
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await getAssetTypeOfUses(1);
      expect(apiClient.get).toHaveBeenCalledWith(
        "/asset-management/asset-type-of-use?TypeOfUseGroupId=1&MarkedForDeletion=false&PageSize=-1"
      );
      expect(result).toEqual(mockResponse.data.items);
    });
  });

  describe("getAssetSubTypeOfUses", () => {
    it("should fetch sub-types successfully", async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [{ id: 1, subTypeName: "Sub 1", typeOfUseId: 1, isActive: true }],
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await getAssetSubTypeOfUses(1);
      expect(apiClient.get).toHaveBeenCalledWith(
        "/asset-management/asset-sub-type-of-use?TypeOfUseId=1&MarkedForDeletion=false&PageSize=-1"
      );
      expect(result).toEqual(mockResponse.data.items);
    });
  });
});
