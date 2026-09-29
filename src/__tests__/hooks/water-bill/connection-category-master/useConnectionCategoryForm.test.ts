import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useConnectionCategoryForm } from "@/hooks/water-bill/connection-category-master/useConnectionCategoryForm";
import type { ConnectionCategory } from "@/types/waterBill/connectionCategoryMaster.types";
import { toast } from "sonner";

const mockRouterPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
  useSearchParams: () => new URLSearchParams(""),
  usePathname: () => "/en/water-bill/connection-category-master/add",
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/app/[locale]/water-bill/connection-category-master/actions", () => ({
  createConnectionCategoryAction: vi.fn(),
  updateConnectionCategoryAction: vi.fn(),
}));

import {
  createConnectionCategoryAction,
  updateConnectionCategoryAction,
} from "@/app/[locale]/water-bill/connection-category-master/actions";

const mockCreateAction = vi.mocked(createConnectionCategoryAction);
const mockUpdateAction = vi.mocked(updateConnectionCategoryAction);

const mockInitialData: ConnectionCategory = {
  id: 5,
  connectionCategoryCode: "REG",
  connectionCategory: "Regular Metered",
  billingFrequencyId: 1,
  isMetered: true,
  billingMethod: "Metered",
  description: "desc",
  isActive: true,
};

describe("useConnectionCategoryForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes create mode with proper defaults", () => {
    const { result } = renderHook(() => useConnectionCategoryForm(null));
    expect(result.current.isEdit).toBe(false);
    expect(result.current.formData.connectionCategoryCode).toBe("");
    expect(result.current.formData.isMetered).toBe(true);
    expect(result.current.formData.billingMethod).toBe("Metered");
  });

  it("initializes edit mode with existing data", () => {
    const { result } = renderHook(() => useConnectionCategoryForm(5, mockInitialData));
    expect(result.current.isEdit).toBe(true);
    expect(result.current.formData.connectionCategoryCode).toBe("REG");
    expect(result.current.formData.connectionCategory).toBe("Regular Metered");
  });

  it("sanitizes string fields on change", () => {
    const { result } = renderHook(() => useConnectionCategoryForm(null));
    act(() => {
      // Input with special characters
      result.current.handleChange("connectionCategory", "Regu!@#lar Metered$%");
    });
    // Should strip out special chars
    expect(result.current.formData.connectionCategory).toBe("Regular Metered");
  });

  it("switches billing method when isMetered toggle changes", () => {
    const { result } = renderHook(() => useConnectionCategoryForm(null));
    act(() => {
      result.current.handleChange("isMetered", false);
    });
    expect(result.current.formData.isMetered).toBe(false);
    expect(result.current.formData.billingMethod).toBe("Flat");

    act(() => {
      result.current.handleChange("isMetered", true);
    });
    expect(result.current.formData.isMetered).toBe(true);
    expect(result.current.formData.billingMethod).toBe("Metered");
  });

  it("handles close correctly", () => {
    const { result } = renderHook(() => useConnectionCategoryForm(null));
    act(() => {
      result.current.handleClose();
    });
    expect(result.current.open).toBe(false);
    expect(mockRouterPush).toHaveBeenCalledWith("/en/water-bill/connection-category-master");
  });

  it("submits create form successfully", async () => {
    mockCreateAction.mockResolvedValueOnce({ success: true, data: mockInitialData });
    const { result } = renderHook(() => useConnectionCategoryForm(null));

    act(() => {
      result.current.handleChange("connectionCategoryCode", "NEWCAT");
      result.current.handleChange("connectionCategory", "New Category");
      result.current.handleChange("billingFrequencyId", 2);
    });

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockCreateAction).toHaveBeenCalledWith(
      expect.objectContaining({
        connectionCategoryCode: "NEWCAT",
        connectionCategory: "New Category",
        billingFrequencyId: 2,
      })
    );
    expect(toast.success).toHaveBeenCalled();
  });

  it("submits edit form successfully", async () => {
    mockUpdateAction.mockResolvedValueOnce({ success: true, data: mockInitialData });
    const { result } = renderHook(() => useConnectionCategoryForm(5, mockInitialData));

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockUpdateAction).toHaveBeenCalledWith(
      5,
      expect.objectContaining({
        connectionCategoryCode: "REG",
        connectionCategory: "Regular Metered",
      })
    );
    expect(toast.success).toHaveBeenCalled();
  });
});
