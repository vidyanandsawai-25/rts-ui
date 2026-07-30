import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTypeOfUseForm } from "@/hooks/asset-masters/type-of-use/useTypeOfUseForm";
import type { AssetTypeOfUse } from "@/types/asset-masters/type-of-use.types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, string | number | Date>) =>
    values?.default ? String(values.default) : key,
  useLocale: () => "en",
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/app/[locale]/assets/configuration/master-data/type-of-use/action", () => ({
  createAssetTypeOfUseAction: vi.fn(),
  updateAssetTypeOfUseAction: vi.fn(),
}));

describe("useTypeOfUseForm", () => {
  const mockProps = {
    id: null,
    onSuccess: vi.fn(),
    onCancel: vi.fn(),
    initialTypes: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes default values for a new Type of Use", () => {
    const { result } = renderHook(() => useTypeOfUseForm(mockProps));

    expect(result.current.isEdit).toBe(false);
    expect(result.current.formData.assetCategoryId).toBe(0);
    expect(result.current.formData.assetTypeId).toBe(0);
    expect(result.current.formData.typeOfUseGroupId).toBe(0);
    expect(result.current.formData.typeOfUseCode).toBe("");
    expect(result.current.formData.description).toBe("");
    expect(result.current.formData.searchSequence).toBe(1);
    expect(result.current.formData.type).toBe("");
  });

  it("initializes from provided edit data", () => {
    const initialData = {
      id: 17,
      isActive: false,
      assetCategoryId: 5,
      assetTypeId: 8,
      typeOfUseGroupId: 12,
      typeOfUseCode: "RES",
      description: "Residential",
      type: "R",
      searchSequence: 4,
    } as AssetTypeOfUse;

    const { result } = renderHook(() =>
      useTypeOfUseForm({ ...mockProps, id: 17, initialData })
    );

    expect(result.current.isEdit).toBe(true);
    expect(result.current.formData.assetCategoryId).toBe(5);
    expect(result.current.formData.assetTypeId).toBe(8);
    expect(result.current.formData.typeOfUseGroupId).toBe(12);
    expect(result.current.formData.typeOfUseCode).toBe("RES");
    expect(result.current.formData.description).toBe("Residential");
    expect(result.current.formData.isActive).toBe(false);
  });
});
