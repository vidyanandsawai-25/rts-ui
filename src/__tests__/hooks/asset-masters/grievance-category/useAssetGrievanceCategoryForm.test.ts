import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAssetGrievanceCategoryForm } from "@/hooks/asset-masters/grievance-category/useAssetGrievanceCategoryForm";

const mockPush = vi.fn();
const mockToastError = vi.fn();
const mockToastSuccess = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useLocale: () => "en",
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

vi.mock("sonner", () => ({
  toast: {
    error: (msg: string) => mockToastError(msg),
    success: (msg: string) => mockToastSuccess(msg),
  },
}));

vi.mock("@/app/[locale]/assets/configuration/master-data/grievance-category-master/action", () => ({
  createAssetGrievanceCategoryAction: vi.fn().mockResolvedValue({ success: true, message: "Created successfully" }),
  updateAssetGrievanceCategoryAction: vi.fn().mockResolvedValue({ success: true, message: "Updated successfully" }),
}));

describe("useAssetGrievanceCategoryForm", () => {
  const defaultProps = {
    id: null,
    onSuccess: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default empty form data when not editing", () => {
    const { result } = renderHook(() => useAssetGrievanceCategoryForm(defaultProps));

    expect(result.current.formData).toEqual({
      id: undefined,
      categoryName: "",
      description: "",
      resolutionSlaDays: NaN,
      isActive: true,
    });
    expect(result.current.isEdit).toBe(false);
  });

  it("should initialize with provided initialData when editing", () => {
    const initialData = {
      id: 5,
      categoryName: "Water Issue",
      description: "Leakage issues",
      resolutionSlaDays: 3,
      isActive: false,
      markedForDeletion: false,
      createdDate: "2026-08-05T00:00:00Z",
      updatedDate: null,
    };
    const { result } = renderHook(() => useAssetGrievanceCategoryForm({ ...defaultProps, id: 5, initialData }));

    expect(result.current.formData).toEqual({
      id: 5,
      categoryName: "Water Issue",
      description: "Leakage issues",
      resolutionSlaDays: 3,
      isActive: false,
    });
    expect(result.current.isEdit).toBe(true);
    expect(result.current.isActive).toBe(false);
  });

  it("should update form state correctly on handleChange", () => {
    const { result } = renderHook(() => useAssetGrievanceCategoryForm(defaultProps));

    act(() => {
      result.current.handleChange({
        target: { name: "categoryName", value: "New Category" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.categoryName).toBe("New Category");
  });

  it("should toggle isActive state when handleToggleStatus is called", () => {
    const { result } = renderHook(() => useAssetGrievanceCategoryForm(defaultProps));

    act(() => {
      result.current.handleToggleStatus(false);
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.formData.isActive).toBe(false);
  });
});
