import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAssetRoomForm } from "@/hooks/asset-masters/assetroomtype/useAssetRoomForm";
import type { AssetRoomType } from "@/types/asset-masters/asset-room-type.types";
import { ChangeEvent } from "react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/en/assets/configuration/master-data/asset-room-type",
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

vi.mock("@/app/[locale]/assets/configuration/master-data/asset-room-type/action", () => ({
  createAssetRoomAction: vi.fn(),
  updateAssetRoomAction: vi.fn(),
}));

describe("useAssetRoomForm", () => {
  const mockProps = {
    id: null,
    onSuccess: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default data when adding a new asset room type", () => {
    const { result } = renderHook(() => useAssetRoomForm(mockProps));

    expect(result.current.isEdit).toBe(false);
    expect(result.current.formData.roomTypeCode).toBe("");
    expect(result.current.formData.isActive).toBe(true);
  });

  it("should initialize with provided data when editing", () => {
    const initialData = {
      id: 12,
      roomTypeCode: "ROOM12",
      roomTypeName: "Room Name 12",
      description: "Desc 12",
      assetCategoryId: 1,
      assetTypeId: null,
      isActive: true,
    } as AssetRoomType;

    const { result } = renderHook(() =>
      useAssetRoomForm({ ...mockProps, id: 12, initialData })
    );

    expect(result.current.isEdit).toBe(true);
    expect(result.current.formData.roomTypeCode).toBe("ROOM12");
  });

  it("should update form data when handleChange is called", () => {
    const { result } = renderHook(() => useAssetRoomForm(mockProps));

    act(() => {
      result.current.handleChange({
        target: { name: "roomTypeName", value: "New Room Type Name" },
      } as ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.roomTypeName).toBe("New Room Type Name");
  });

  it("should sanitize and update form data on handleBlur", () => {
    const { result } = renderHook(() => useAssetRoomForm(mockProps));

    act(() => {
      result.current.handleBlur({
        target: { name: "roomTypeCode", value: "ROOM_#123" },
      } as unknown as React.FocusEvent<HTMLInputElement>);
    });

    expect(result.current.formData.roomTypeCode).toBe("ROOM_123");
  });

  it("should update status on handleToggleStatus", () => {
    const { result } = renderHook(() => useAssetRoomForm(mockProps));

    act(() => {
      result.current.handleToggleStatus(false);
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.formData.isActive).toBe(false);
  });
});
