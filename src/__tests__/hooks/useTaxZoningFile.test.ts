import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useTaxZoningFile } from "@/hooks/useTaxZoningFile";
import { ZoningRecord, Ward, TaxZone } from "@/types/taxzoning.types";
import { PagedResponse } from "@/types/common.types";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

describe("useTaxZoningFile", () => {
  const t = (key: string) => key;
  const REQUIRED_HEADERS = ["wardno", "fromproperty", "toproperty", "taxzoneno"];
  const records: ZoningRecord[] = [];
  const wardsData = { items: [] } as unknown as PagedResponse<Ward>;
  const taxZones = { items: [] } as unknown as PagedResponse<TaxZone>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("handles clearing imported data", () => {
    const { result } = renderHook(() => useTaxZoningFile(t, REQUIRED_HEADERS, records, wardsData, taxZones));

    act(() => {
      result.current.setHasImportedData(true);
      result.current.handleClearImported();
    });

    expect(result.current.hasImportedData).toBe(false);
    expect(toast.info).toHaveBeenCalledWith("messages.importedDataCleared");
  });

  it("handles CSV export", () => {
    const { result } = renderHook(() => useTaxZoningFile(t, REQUIRED_HEADERS, records, wardsData, taxZones));
    
    // Mock URL.createObjectURL and document.createElement
    const createObjectURLMock = vi.fn(() => "blob:url");
    vi.stubGlobal('URL', { createObjectURL: createObjectURLMock, revokeObjectURL: vi.fn() });
    const clickMock = vi.fn();
    const linkMock = { href: "", download: "", click: clickMock };
    vi.spyOn(document, "createElement").mockReturnValue(linkMock as unknown as HTMLAnchorElement);

    const tableRecords = [{ wardNo: "W1", fromProperty: "001", toProperty: "010", taxZoneNo: "TZ1" } as unknown as ZoningRecord];

    act(() => {
      result.current.handleExportCSV(tableRecords);
    });

    expect(clickMock).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("messages.csvExportSuccess");
  });
});
