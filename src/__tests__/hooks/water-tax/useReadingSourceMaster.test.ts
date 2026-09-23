import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useReadingSourceMaster } from "@/hooks/water-tax/reading-source-master/useReadingSourceMaster";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { createReadingSourceAction } from "@/app/[locale]/water-bill/readingsourcemaster/action";

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

vi.mock("@/app/[locale]/water-bill/readingsourcemaster/action", () => ({
  createReadingSourceAction: vi.fn(),
  updateReadingSourceAction: vi.fn(),
  deleteReadingSourceAction: vi.fn(),
}));

describe("useReadingSourceMaster", () => {
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
    sortBy: "readingSourceCode",
    sortOrder: "asc",
  };

  it("should initialize master hook state", () => {
    const { result } = renderHook(() => useReadingSourceMaster(defaultProps));

    expect(result.current.searchTerm).toBe("");
    expect(result.current.drawerOpen).toBe(false);
    expect(result.current.editingItem).toBeNull();
    expect(result.current.columns.length).toBeGreaterThan(0);
  });

  it("should sanitize search input and push query", () => {
    const { result } = renderHook(() => useReadingSourceMaster(defaultProps));

    act(() => {
      result.current.handleSearchChange("Field <inspection>");
    });

    expect(result.current.searchTerm).toBe("Field inspection");
    expect(mockRouter.push).toHaveBeenCalledWith(expect.stringContaining("q=Field+inspection"));
  });

  it("should open add and edit drawers", () => {
    const { result } = renderHook(() => useReadingSourceMaster(defaultProps));

    act(() => {
      result.current.handleOpenAdd();
    });
    expect(result.current.drawerOpen).toBe(true);

    const item = { id: 4, readingSourceCode: "FIELD", readingSource: "Field Visit", isActive: true };
    act(() => {
      result.current.handleOpenEdit(item);
    });
    expect(result.current.drawerOpen).toBe(true);
    expect(result.current.editingItem).toEqual(item);
  });

  it("should handle successful create submission", async () => {
    vi.mocked(createReadingSourceAction).mockResolvedValue({ success: true });
    const { result } = renderHook(() => useReadingSourceMaster(defaultProps));

    await act(async () => {
      await result.current.handleFormSubmit({
        code: "IMPORT",
        readingSourceCode: "IMPORT",
        readingSource: "Data Import",
        isActive: true,
      });
    });

    expect(createReadingSourceAction).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("messages.createSuccess");
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it("should map duplicate API error to localized error toast", async () => {
    vi.mocked(createReadingSourceAction).mockResolvedValue({
      success: false,
      statusCode: 409,
      message: "ReadingSourceCode 'FIELD' already exists.",
    });

    const { result } = renderHook(() => useReadingSourceMaster(defaultProps));

    await expect(
      act(async () => {
        await result.current.handleFormSubmit({
          code: "FIELD",
          readingSourceCode: "FIELD",
          readingSource: "Field Visit",
          isActive: true,
        });
      })
    ).rejects.toThrow("messages.duplicateRecord");

    expect(toast.error).toHaveBeenCalledWith("messages.duplicateRecord");
  });

  it("should open delete confirm modal", () => {
    const { result } = renderHook(() => useReadingSourceMaster(defaultProps));

    const item = { id: 5, readingSourceCode: "IMPORT", readingSource: "Import", isActive: true };
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
