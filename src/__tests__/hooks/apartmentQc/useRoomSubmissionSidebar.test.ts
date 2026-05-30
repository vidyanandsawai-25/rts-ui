import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRoomSubmissionSidebar } from "@/hooks/apartmentQc/useRoomSubmissionSidebar";
import { toast } from 'sonner';
import type { FloorDataRow } from "@/types/propertyEdit.types";

// Mock the action
vi.mock('@/app/[locale]/property-tax/ptis/appartmentQC/action', () => ({
  fetchRoomWiseSubmissionsAction: vi.fn(),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("useRoomSubmissionSidebar", () => {
  const mockPropertyId = 12345;
  const mockOnAreaUpdate = vi.fn();
  const mockCopy = {
    messages: {
      cannotOpenRoomSubmission: "Cannot open room submission",
      roomDetailsFetchFailed: "Failed to fetch room details",
    },
    basicInfo: {
      title: "Basic Info",
      fields: {} as Record<string, unknown>,
      validation: {} as Record<string, unknown>,
    },
    floorQC: {
      title: "Floor QC",
      columns: {} as Record<string, unknown>,
      tabs: {} as Record<string, unknown>,
      validation: {} as Record<string, unknown>,
      tooltips: {} as Record<string, unknown>,
    },
  };

  const mockFloorRow: FloorDataRow = {
    id: "row-1",
    pdnId: 123,
    floorId: "1",
    conYear: "2020",
    asstYear: "2023",
    constructionTypeId: "1",
    typeOfUseId: "1",
    subTypeOfUseId: "1",
    noOfRooms: "3",
    area: "1000",
    rentMY: "",
    rateMY: "",
    rentalValue: "",
    depreciation: "",
    alv: "",
    mr: "",
    rv: "",
    sdrr: "",
    baseValue: "",
    floorFactor: "",
    ageFactor: "",
    ntbFactor: "",
    useFactor: "",
    capitalValue: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with closed state", () => {
    const { result } = renderHook(() =>
      useRoomSubmissionSidebar({
        propertyId: mockPropertyId,
        onAreaUpdate: mockOnAreaUpdate,
        copy: mockCopy,
      })
    );

    expect(result.current.isOpen).toBe(false);
    expect(result.current.selectedFloorRow).toBeNull();
    expect(result.current.areaUnit).toBe("sq.m");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.existingRooms).toEqual([]);
  });

  it("should show error toast when opening sidebar without pdnId", async () => {
    const { result } = renderHook(() =>
      useRoomSubmissionSidebar({
        propertyId: mockPropertyId,
        onAreaUpdate: mockOnAreaUpdate,
        copy: mockCopy,
      })
    );

    const rowWithoutPdnId: FloorDataRow = { ...mockFloorRow, pdnId: null };

    await act(async () => {
      await result.current.handleOpen(rowWithoutPdnId);
    });

    expect(toast.error).toHaveBeenCalledWith("Cannot open room submission");
    expect(result.current.isOpen).toBe(false);
  });

  it("should open sidebar with valid floor row", async () => {
    const { fetchRoomWiseSubmissionsAction } = await import(
      "@/app/[locale]/property-tax/ptis/appartmentQC/action"
    );
    vi.mocked(fetchRoomWiseSubmissionsAction).mockResolvedValue({
      success: true,
      data: [],
    });

    const { result } = renderHook(() =>
      useRoomSubmissionSidebar({
        propertyId: mockPropertyId,
        onAreaUpdate: mockOnAreaUpdate,
        copy: mockCopy,
      })
    );

    await act(async () => {
      await result.current.handleOpen(mockFloorRow);
    });

    await waitFor(() => {
      expect(result.current.isOpen).toBe(true);
      expect(result.current.selectedFloorRow).toEqual(mockFloorRow);
    });
  });

  it("should close sidebar", () => {
    const { result } = renderHook(() =>
      useRoomSubmissionSidebar({
        propertyId: mockPropertyId,
        onAreaUpdate: mockOnAreaUpdate,
        copy: mockCopy,
      })
    );

    act(() => {
      result.current.handleClose();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.selectedFloorRow).toBeNull();
    expect(result.current.existingRooms).toEqual([]);
  });

  it("should toggle area unit", () => {
    const { result } = renderHook(() =>
      useRoomSubmissionSidebar({
        propertyId: mockPropertyId,
        onAreaUpdate: mockOnAreaUpdate,
        copy: mockCopy,
      })
    );

    expect(result.current.areaUnit).toBe("sq.m");

    act(() => {
      result.current.handleToggleUnit();
    });

    expect(result.current.areaUnit).toBe("sq.ft");

    act(() => {
      result.current.handleToggleUnit();
    });

    expect(result.current.areaUnit).toBe("sq.m");
  });

  it("should fetch existing rooms when opening sidebar", async () => {
    const mockRooms = [
      { id: 1, roomNo: "Room 1", area: "100" },
      { id: 2, roomNo: "Room 2", area: "150" },
    ];

    const { fetchRoomWiseSubmissionsAction } = await import(
      "@/app/[locale]/property-tax/ptis/appartmentQC/action"
    );
    vi.mocked(fetchRoomWiseSubmissionsAction).mockResolvedValue({
      success: true,
      data: mockRooms,
    });

    const { result } = renderHook(() =>
      useRoomSubmissionSidebar({
        propertyId: mockPropertyId,
        onAreaUpdate: mockOnAreaUpdate,
        copy: mockCopy,
      })
    );

    await act(async () => {
      await result.current.handleOpen(mockFloorRow);
    });

    await waitFor(() => {
      expect(result.current.existingRooms).toEqual(mockRooms);
    });
  });

  it("should show error toast when fetching rooms fails", async () => {
    const { fetchRoomWiseSubmissionsAction } = await import(
      "@/app/[locale]/property-tax/ptis/appartmentQC/action"
    );
    vi.mocked(fetchRoomWiseSubmissionsAction).mockResolvedValue({
      success: false,
      error: "API Error",
    });

    const { result } = renderHook(() =>
      useRoomSubmissionSidebar({
        propertyId: mockPropertyId,
        onAreaUpdate: mockOnAreaUpdate,
        copy: mockCopy,
      })
    );

    await act(async () => {
      await result.current.handleOpen(mockFloorRow);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it("should update floor area after room submission", async () => {
    const { fetchRoomWiseSubmissionsAction } = await import(
      "@/app/[locale]/property-tax/ptis/appartmentQC/action"
    );
    vi.mocked(fetchRoomWiseSubmissionsAction).mockResolvedValue({
      success: true,
      data: [],
    });

    const { result } = renderHook(() =>
      useRoomSubmissionSidebar({
        propertyId: mockPropertyId,
        onAreaUpdate: mockOnAreaUpdate,
        copy: mockCopy,
      })
    );

    await act(async () => {
      await result.current.handleOpen(mockFloorRow);
    });

    const updateData = {
      totalArea: "1200",
    };

    await act(async () => {
      await result.current.handleUpdateSuccess(updateData);
    });

    await waitFor(() => {
      expect(mockOnAreaUpdate).toHaveBeenCalledWith("row-1", "1200");
    });
  });

  it("should set loading state during fetch", async () => {
    const { fetchRoomWiseSubmissionsAction } = await import(
      "@/app/[locale]/property-tax/ptis/appartmentQC/action"
    );
    
    // Create a promise that we can control
    let resolvePromise: (value: unknown) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    vi.mocked(fetchRoomWiseSubmissionsAction).mockReturnValue(promise as Promise<typeof promise>);

    const { result } = renderHook(() =>
      useRoomSubmissionSidebar({
        propertyId: mockPropertyId,
        onAreaUpdate: mockOnAreaUpdate,
        copy: mockCopy,
      })
    );

    // Start opening - should set loading to true
    act(() => {
      result.current.handleOpen(mockFloorRow);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    // Resolve the promise
    await act(async () => {
      resolvePromise!({ success: true, data: [] });
      await promise;
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
