import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAssetPhotoForm } from "@/hooks/asset-masters/assetphototype/useAssetPhotoForm";
import type { AssetPhotoType } from "@/types/asset-masters/asset-photo-type.types";
import { ChangeEvent } from "react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/en/assets/configuration/master-data/asset-photo-type",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/app/[locale]/assets/configuration/master-data/asset-photo-type/action", () => ({
  createAssetPhotoAction: vi.fn(),
  updateAssetPhotoAction: vi.fn(),
}));

describe("useAssetPhotoForm", () => {
  const mockProps = {
    id: null,
    onSuccess: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default data when adding a new asset photo type", () => {
    const { result } = renderHook(() => useAssetPhotoForm(mockProps));

    expect(result.current.isEdit).toBe(false);
    expect(result.current.formData.photoTypeCode).toBe("");
    expect(result.current.formData.isActive).toBe(true);
  });

  it("should initialize with provided data when editing", () => {
    const initialData = {
      id: 8,
      photoTypeCode: "PHOTO8",
      photoTypeName: "Photo Name 8",
      description: "Desc 8",
      displayOrder: 2,
      assetCategoryId: 1,
      assetTypeId: null,
      isRequired: true,
      isSubUnit: false,
      isActive: true,
    } as AssetPhotoType;

    const { result } = renderHook(() =>
      useAssetPhotoForm({ ...mockProps, id: 8, initialData })
    );

    expect(result.current.isEdit).toBe(true);
    expect(result.current.formData.photoTypeCode).toBe("PHOTO8");
    expect(result.current.formData.isRequired).toBe(true);
  });

  it("should update form data when handleChange is called", () => {
    const { result } = renderHook(() => useAssetPhotoForm(mockProps));

    act(() => {
      result.current.handleChange({
        target: { name: "photoTypeName", value: "New Photo Type Name" },
      } as ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.photoTypeName).toBe("New Photo Type Name");
  });

  it("should sanitize and update form data on handleBlur", () => {
    const { result } = renderHook(() => useAssetPhotoForm(mockProps));

    act(() => {
      result.current.handleBlur({
        target: { name: "photoTypeCode", value: "PHOTO_#123" },
      } as unknown as React.FocusEvent<HTMLInputElement>);
    });

    expect(result.current.formData.photoTypeCode).toBe("PHOTO_123");
  });

  it("should update status on handleToggleStatus", () => {
    const { result } = renderHook(() => useAssetPhotoForm(mockProps));

    act(() => {
      result.current.handleToggleStatus(false);
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.formData.isActive).toBe(false);
  });
});
