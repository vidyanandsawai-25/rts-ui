import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TariffChargeDetails } from "@/components/modules/water-bill/tariff-workbench/charge-details/TariffChargeDetails";
import type { TariffChargeData } from "@/types/water-bill/tariff-workbench/tariffWorkbench.types";
import type { TariffChargePagedResponse } from "@/lib/api/water-bill/tariff-workbench/tariffChargeDetail.service";

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  toast: vi.fn(),
};
const mockConfirm = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string, params?: Record<string, unknown>) => {
    if (params?.count !== undefined) {
      return `${ns}.${key}_${params.count}`;
    }
    return `${ns}.${key}`;
  },
  useLocale: () => "en",
}));

vi.mock("@/components/common", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/common")>();
  return {
    ...actual,
    useToast: () => mockToast,
    useConfirm: () => ({ confirm: mockConfirm }),
  };
});

describe("TariffChargeDetails Component Tests", () => {
  const sampleRecords: TariffChargeData[] = [
    {
      id: 20,
      tariffId: 1,
      tariffName: "Residential Metered 2026-27",
      chargeHeadId: 5,
      chargeHeadName: "Meter Rent",
      geographyUnitId: 2,
      geographyUnitName: "Zone A",
      amount: 15,
      isDynamic: false,
      isMandatory: true,
      sequenceNo: 1,
      isActive: true,
    },
  ];

  const samplePagedData: TariffChargePagedResponse = {
    items: sampleRecords,
    totalCount: 1,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render charge details table records correctly", () => {
    render(<TariffChargeDetails locale="en" pagedData={samplePagedData} />);

    expect(screen.getByText("Residential Metered 2026-27")).toBeInTheDocument();
    expect(screen.getByText("Meter Rent")).toBeInTheDocument();
    expect(screen.getByText("Zone A")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("should trigger confirmation dialog when delete button is clicked", () => {
    render(<TariffChargeDetails locale="en" pagedData={samplePagedData} deleteAction={vi.fn()} />);

    const deleteBtn = screen.getByRole("button", { name: "common.table.actions.delete" });
    fireEvent.click(deleteBtn);

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "delete",
        title: "tariffWorkbench.confirm.deleteChargeDetailTitle",
        description: "tariffWorkbench.confirm.deleteChargeDetailDescription",
        meta: { name: "Meter Rent", id: 20 },
      })
    );
  });

  it("should execute deleteAction and show success toast when confirmed", async () => {
    const mockDelete = vi.fn().mockResolvedValue({ success: true, message: "Charge detail deleted" });
    render(<TariffChargeDetails locale="en" pagedData={samplePagedData} deleteAction={mockDelete} />);

    const deleteBtn = screen.getByRole("button", { name: "common.table.actions.delete" });
    fireEvent.click(deleteBtn);

    const confirmCall = mockConfirm.mock.calls[0][0];
    await act(async () => {
      await confirmCall.onConfirm();
    });

    expect(mockDelete).toHaveBeenCalledWith(20);
    expect(mockToast.success).toHaveBeenCalledWith("Charge detail deleted");
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("should show error toast if deleteAction fails", async () => {
    const mockDelete = vi.fn().mockResolvedValue({ success: false, message: "Delete failed" });
    render(<TariffChargeDetails locale="en" pagedData={samplePagedData} deleteAction={mockDelete} />);

    const deleteBtn = screen.getByRole("button", { name: "common.table.actions.delete" });
    fireEvent.click(deleteBtn);

    const confirmCall = mockConfirm.mock.calls[0][0];
    await act(async () => {
      await confirmCall.onConfirm();
    });

    expect(mockDelete).toHaveBeenCalledWith(20);
    expect(mockToast.error).toHaveBeenCalledWith("Delete failed");
  });

  it("should show error toast if deleteAction is not provided", async () => {
    render(<TariffChargeDetails locale="en" pagedData={samplePagedData} />);

    const deleteBtn = screen.getByRole("button", { name: "common.table.actions.delete" });
    fireEvent.click(deleteBtn);

    const confirmCall = mockConfirm.mock.calls[0][0];
    await act(async () => {
      await confirmCall.onConfirm();
    });

    expect(mockToast.error).toHaveBeenCalledWith("tariffWorkbench.errors.noDeleteAction");
  });

  it("should navigate to edit charge detail page when edit action is clicked", () => {
    render(<TariffChargeDetails locale="en" pagedData={samplePagedData} />);

    const editBtn = screen.getByRole("button", { name: "common.table.actions.edit" });
    fireEvent.click(editBtn);

    expect(mockPush).toHaveBeenCalledWith("/en/water-bill/tariff-workbench/charge-details/edit/20");
  });
});

