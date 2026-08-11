import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSubTypeOfUseForm } from "@/hooks/asset-masters/type-of-use/useSubTypeOfUseForm";
import type { AssetSubTypeOfUse } from "@/types/asset-masters/type-of-use.types";

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
  createAssetSubTypeOfUseAction: vi.fn(),
  updateAssetSubTypeOfUseAction: vi.fn(),
}));

describe("useSubTypeOfUseForm", () => {
  const mockProps = {
    id: null,
    onSuccess: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes default values for a new Sub-Type of Use", () => {
    const { result } = renderHook(() => useSubTypeOfUseForm(mockProps));

    expect(result.current.isEdit).toBe(false);
    expect(result.current.formData.typeOfUseId).toBe(0);
    expect(result.current.formData.description).toBe("");
    expect(result.current.formData.searchSequence).toBe(1);
    expect(result.current.formData.isActive).toBe(true);
  });

  it("initializes from provided edit data", () => {
    const initialData = {
      id: 31,
      isActive: false,
      typeOfUseId: 14,
      description: "Apartment",
      searchSequence: 2,
    } as AssetSubTypeOfUse;

    const { result } = renderHook(() =>
      useSubTypeOfUseForm({ ...mockProps, id: 31, initialData })
    );

    expect(result.current.isEdit).toBe(true);
    expect(result.current.formData.typeOfUseId).toBe(14);
    expect(result.current.formData.description).toBe("Apartment");
    expect(result.current.formData.searchSequence).toBe(2);
    expect(result.current.formData.isActive).toBe(false);
  });
});
