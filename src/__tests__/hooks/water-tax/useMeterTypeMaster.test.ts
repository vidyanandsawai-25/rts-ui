import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useMeterTypeMaster } from "@/hooks/water-tax/meter-type-master/useMeterTypeMaster";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { createMeterTypeAction } from "@/app/[locale]/water-bill/metertypemaster/action";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/components/common/ConfirmProvider", () => ({
  useConfirm: vi.fn(),
}));

vi.mock("@/app/[locale]/water-bill/metertypemaster/action", () => ({
  createMeterTypeAction: vi.fn(),
  updateMeterTypeAction: vi.fn(),
  deleteMeterTypeAction: vi.fn(),
}));

describe("useMeterTypeMaster", () => {
  const mockRouter = {
    push: vi.fn(),
    refresh: vi.fn(),
  };

  const mockConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(mockRouter as unknown as ReturnType<typeof useRouter>);
    vi.mocked(useTranslations).mockReturnValue(((key: string) => key) as unknown as ReturnType<typeof useTranslations>);
    vi.mocked(useConfirm).mockReturnValue({ confirm: mockConfirm } as unknown as ReturnType<typeof useConfirm>);
  });

  const defaultProps = {
    data: [],
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
    sortBy: "meterTypeCode",
    sortOrder: "asc",
  };

  it("should initialize master hook state", () => {
    const { result } = renderHook(() => useMeterTypeMaster(defaultProps));

    expect(result.current.searchTerm).toBe("");
    expect(result.current.drawerOpen).toBe(false);
    expect(result.current.editingItem).toBeNull();
    expect(result.current.columns.length).toBeGreaterThan(0);
  });

  it("should sanitize search input and push query", () => {
    const { result } = renderHook(() => useMeterTypeMaster(defaultProps));

    act(() => {
      result.current.handleSearchChange("AMR system<#>");
    });

    expect(result.current.searchTerm).toBe("AMR system");
    expect(mockRouter.push).toHaveBeenCalledWith(expect.stringContaining("q=AMR+system"));
  });

  it("should open add and edit drawers", () => {
    const { result } = renderHook(() => useMeterTypeMaster(defaultProps));

    act(() => {
      result.current.handleOpenAdd();
    });
    expect(result.current.drawerOpen).toBe(true);

    const item = { id: 2, meterTypeCode: "AMR", meterType: "AMR Meter", description: "Desc", isActive: true };
    act(() => {
      result.current.handleOpenEdit(item);
    });
    expect(result.current.drawerOpen).toBe(true);
    expect(result.current.editingItem).toEqual(item);
  });

  it("should handle successful create submission", async () => {
    vi.mocked(createMeterTypeAction).mockResolvedValue({ success: true });
    const { result } = renderHook(() => useMeterTypeMaster(defaultProps));

    await act(async () => {
      await result.current.handleFormSubmit({
        code: "AMI",
        meterTypeCode: "AMI",
        meterType: "AMI Smart Meter",
        description: "Advanced Metering Infrastructure",
        isActive: true,
      });
    });

    expect(createMeterTypeAction).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("messages.createSuccess");
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it("should map duplicate API error to localized error toast", async () => {
    vi.mocked(createMeterTypeAction).mockResolvedValue({
      success: false,
      statusCode: 409,
      message: "MeterTypeCode 'MECH' already exists.",
    });

    const { result } = renderHook(() => useMeterTypeMaster(defaultProps));

    await expect(
      act(async () => {
        await result.current.handleFormSubmit({
          code: "MECH",
          meterTypeCode: "MECH",
          meterType: "Mechanical",
          description: "Desc",
          isActive: true,
        });
      })
    ).rejects.toThrow("messages.duplicateRecord");

    expect(toast.error).toHaveBeenCalledWith("messages.duplicateRecord");
  });

  it("should open delete confirm modal", () => {
    const { result } = renderHook(() => useMeterTypeMaster(defaultProps));

    const item = { id: 3, meterTypeCode: "MECH", meterType: "Mechanical", description: "Desc", isActive: true };
    act(() => {
      result.current.handleDelete(item);
    });

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "delete",
      })
    );
  });
});
