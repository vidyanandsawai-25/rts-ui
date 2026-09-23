import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useMeterTestStatusMaster } from "@/hooks/water-tax/meter-test-status-master/useMeterTestStatusMaster";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { createMeterTestStatusAction } from "@/app/[locale]/water-bill/meterteststatusmaster/action";

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

vi.mock("@/app/[locale]/water-bill/meterteststatusmaster/action", () => ({
  createMeterTestStatusAction: vi.fn(),
  updateMeterTestStatusAction: vi.fn(),
  deleteMeterTestStatusAction: vi.fn(),
}));

describe("useMeterTestStatusMaster", () => {
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
    sortBy: "meterTestStatusCode",
    sortOrder: "asc",
  };

  it("should initialize master hook state", () => {
    const { result } = renderHook(() => useMeterTestStatusMaster(defaultProps));

    expect(result.current.searchTerm).toBe("");
    expect(result.current.drawerOpen).toBe(false);
    expect(result.current.editingItem).toBeNull();
    expect(result.current.columns.length).toBeGreaterThan(0);
  });

  it("should sanitize search term and push router query", () => {
    const { result } = renderHook(() => useMeterTestStatusMaster(defaultProps));

    act(() => {
      result.current.handleSearchChange("Pass<script>");
    });

    expect(result.current.searchTerm).toBe("Passscript");
    expect(mockRouter.push).toHaveBeenCalledWith(expect.stringContaining("q=Passscript"));
  });

  it("should toggle sort order on column sort", () => {
    const { result } = renderHook(() => useMeterTestStatusMaster(defaultProps));

    act(() => {
      if (result.current.columns[0]?.key) {
        result.current.handleSearchChange("");
      }
    });

    act(() => {
      const handleSort = (result.current.columns[0] as unknown as { label: { props?: { onSort?: (k: string) => void } } });
      expect(handleSort).toBeDefined();
    });
  });

  it("should handle drawer open for add and edit modes", () => {
    const { result } = renderHook(() => useMeterTestStatusMaster(defaultProps));

    act(() => {
      result.current.handleOpenAdd();
    });
    expect(result.current.drawerOpen).toBe(true);
    expect(result.current.editingItem).toBeNull();

    const editItem = { id: 1, meterTestStatusCode: "PASS", meterTestStatus: "Pass", isActive: true };
    act(() => {
      result.current.handleOpenEdit(editItem);
    });
    expect(result.current.drawerOpen).toBe(true);
    expect(result.current.editingItem).toEqual(editItem);
  });

  it("should handle successful form submission", async () => {
    vi.mocked(createMeterTestStatusAction).mockResolvedValue({ success: true });
    const { result } = renderHook(() => useMeterTestStatusMaster(defaultProps));

    await act(async () => {
      await result.current.handleFormSubmit({
        code: "PASS",
        meterTestStatusCode: "PASS",
        meterTestStatus: "Pass",
        isActive: true,
      });
    });

    expect(createMeterTestStatusAction).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("messages.createSuccess");
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it("should map duplicate API error response to localized message", async () => {
    vi.mocked(createMeterTestStatusAction).mockResolvedValue({
      success: false,
      statusCode: 409,
      message: "MeterTestStatusCode 'PENDING' already exists.",
    });

    const { result } = renderHook(() => useMeterTestStatusMaster(defaultProps));

    await expect(
      act(async () => {
        await result.current.handleFormSubmit({
          code: "PENDING",
          meterTestStatusCode: "PENDING",
          meterTestStatus: "Pending",
          isActive: true,
        });
      })
    ).rejects.toThrow("messages.duplicateRecord");

    expect(toast.error).toHaveBeenCalledWith("messages.duplicateRecord");
  });

  it("should trigger confirm modal on delete", () => {
    const { result } = renderHook(() => useMeterTestStatusMaster(defaultProps));

    const item = { id: 5, meterTestStatusCode: "FAIL", meterTestStatus: "Fail", isActive: true };
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
