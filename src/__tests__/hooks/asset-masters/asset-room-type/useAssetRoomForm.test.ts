import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAssetRoomForm } from "@/hooks/asset-masters/assetroomtype/useAssetRoomForm";
import * as actions from "@/app/[locale]/assets/configuration/master-data/asset-room-type/action";
import { toast } from "sonner";
import type { AssetRoomType } from "@/types/asset-masters/asset-room-type.types";
import { ChangeEvent, FormEvent } from "react";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
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

  it("should initialize with default data when adding a new room type", () => {
    const { result } = renderHook(() => useAssetRoomForm(mockProps));

    expect(result.current.isEdit).toBe(false);
    expect(result.current.formData.roomTypeCode).toBe("");
    expect(result.current.formData.isActive).toBe(true);
  });

  it("should initialize with provided data when editing", () => {
    const initialData = {
      id: 5,
      roomTypeCode: "ROOM5",
      roomTypeName: "Room 5",
      description: "Desc 5",
      isActive: true,
      assetTypeId: 2,
    } as AssetRoomType;

    const { result } = renderHook(() =>
      useAssetRoomForm({ ...mockProps, id: 5, initialData })
    );

    expect(result.current.isEdit).toBe(true);
    expect(result.current.formData.roomTypeCode).toBe("ROOM5");
  });

  it("should update form data when handleChange is called", () => {
    const { result } = renderHook(() => useAssetRoomForm(mockProps));

    act(() => {
      result.current.handleChange({
        target: { name: "roomTypeName", value: "New Room Name" },
      } as ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.roomTypeName).toBe("New Room Name");
  });

  it("should toggle status", () => {
    const { result } = renderHook(() => useAssetRoomForm(mockProps));

    act(() => {
      result.current.handleToggleStatus();
    });
    expect(result.current.formData.isActive).toBe(false);

    act(() => {
      result.current.handleToggleStatus();
    });
    expect(result.current.formData.isActive).toBe(true);
  });

  it("should call createAssetRoomAction on submit when adding", async () => {
    const mockResult = { success: true, message: "" };
    vi.mocked(actions.createAssetRoomAction).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useAssetRoomForm(mockProps));

    act(() => {
      result.current.handleChange({
        target: { name: "roomTypeCode", value: "TEST" },
      } as ChangeEvent<HTMLInputElement>);
      result.current.handleChange({
        target: { name: "roomTypeName", value: "Test Name" },
      } as ChangeEvent<HTMLInputElement>);
      result.current.handleChange({
        target: { name: "description", value: "Test description" },
      } as ChangeEvent<HTMLInputElement>);
      result.current.handleSelectChange("assetTypeId", "2");
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as FormEvent);
    });

    expect(actions.createAssetRoomAction).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
    expect(mockProps.onSuccess).toHaveBeenCalled();
  });
});
