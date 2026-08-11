import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAssetGrievanceCategories,
  getAssetGrievanceCategoryPaged,
  getAssetGrievanceCategoryById,
  createAssetGrievanceCategory,
  updateAssetGrievanceCategory,
  deleteAssetGrievanceCategory,
} from "@/lib/api/asset-masters/asset-grievance-category-crud.service";
import { apiClient } from "@/services/api.service";

vi.mock("@/services/api.service", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Grievance Category API Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAssetGrievanceCategories", () => {
    it("should fetch active categories successfully", async () => {
      const mockApiResponse = {
        success: true,
        data: {
          items: [{ id: 1, categoryName: "C1", description: "D1", resolutionSlaDays: 3, isActive: true }],
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const result = await getAssetGrievanceCategories();
      expect(apiClient.get).toHaveBeenCalledWith("/asset-management/asset-grievance-category?IsActive=true&PageSize=-1");
      expect(result).toEqual(mockApiResponse.data.items);
    });
  });

  describe("getAssetGrievanceCategoryPaged", () => {
    it("should request and fetch paged categories successfully", async () => {
      const mockApiResponse = {
        success: true,
        data: {
          items: [{ id: 1, categoryName: "C1", description: "D1", resolutionSlaDays: 3, isActive: true }],
          totalCount: 1,
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
          hasPrevious: false,
          hasNext: false,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const result = await getAssetGrievanceCategoryPaged(1, 10, "query", "categoryName", "asc");
      expect(apiClient.get).toHaveBeenCalledWith("/asset-management/asset-grievance-category?PageNumber=1&PageSize=10&MarkedForDeletion=false&IsActive=&SearchTerm=query&SortBy=categoryName&SortOrder=asc");
      expect(result).toEqual(mockApiResponse.data);
    });
  });

  describe("getAssetGrievanceCategoryById", () => {
    it("should fetch category details successfully", async () => {
      const mockApiResponse = {
        success: true,
        data: { id: 1, categoryName: "C1", description: "D1", resolutionSlaDays: 3, isActive: true },
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const result = await getAssetGrievanceCategoryById(1);
      expect(apiClient.get).toHaveBeenCalledWith("/asset-management/asset-grievance-category/1");
      expect(result).toEqual(mockApiResponse.data);
    });
  });

  describe("createAssetGrievanceCategory", () => {
    it("should create category successfully", async () => {
      const mockApiResponse = {
        success: true,
        data: { message: "Grievance category created successfully" },
      };
      vi.mocked(apiClient.post).mockResolvedValue(mockApiResponse);

      const payload = {
        categoryName: "Water Leakage",
        description: "Pipe issue",
        resolutionSlaDays: 5,
        isActive: true,
      };

      const result = await createAssetGrievanceCategory({ ...payload, createdBy: 1 });
      expect(apiClient.post).toHaveBeenCalledWith("/asset-management/asset-grievance-category", {
        ...payload,
        categoryName: "Water Leakage",
        description: "Pipe issue",
        resolutionSlaDays: 5,
        isActive: true,
        createdBy: 1,
      });
      expect(result).toBe("Grievance category created successfully");
    });
  });

  describe("updateAssetGrievanceCategory", () => {
    it("should update category successfully", async () => {
      const mockApiResponse = {
        success: true,
        data: { message: "Grievance category updated successfully" },
      };
      vi.mocked(apiClient.put).mockResolvedValue(mockApiResponse);

      const payload = {
        id: 1,
        categoryName: "Water Leakage",
        description: "Pipe issue",
        resolutionSlaDays: 5,
        isActive: true,
      };

      const result = await updateAssetGrievanceCategory({ ...payload, updatedBy: 1 });
      expect(apiClient.put).toHaveBeenCalledWith("/asset-management/asset-grievance-category/1", {
        id: 1,
        categoryName: "Water Leakage",
        description: "Pipe issue",
        resolutionSlaDays: 5,
        isActive: true,
        updatedBy: 1,
      });
      expect(result).toBe("Grievance category updated successfully");
    });
  });

  describe("deleteAssetGrievanceCategory", () => {
    it("should delete category successfully", async () => {
      const mockApiResponse = {
        success: true,
      };
      vi.mocked(apiClient.delete).mockResolvedValue(mockApiResponse);

      await deleteAssetGrievanceCategory(1);
      expect(apiClient.delete).toHaveBeenCalledWith("/asset-management/asset-grievance-category/1");
    });
  });
});
