import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useWingManagement } from "@/hooks/zoneMaster/useWingManagement";
import { createSocietyDetailAction, updateSocietyDetailAction } from "@/app/[locale]/property-tax/zone-master/actions";
import { toast } from "sonner";
import { SocietyDetailItem } from "@/types/zone-master/properties/societyDetails.types";
import { WingItem } from "@/types/zone-master/properties/wing.types";

// Mock dependencies
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/app/[locale]/property-tax/zone-master/actions", () => ({
  createSocietyDetailAction: vi.fn(),
  updateSocietyDetailAction: vi.fn(),
}));

describe("useWingManagement", () => {
  const mockSetSocietyDetails = vi.fn();

  const mockSocietyDetails: SocietyDetailItem[] = [
    {
      id: 1,
      propertyId: 1,
      wingId: 1,
      wingName: "Wing A",
      societyName: "",
      societyAddress: "",
      secretaryName: "",
      managerName: "",
      landOwnerName: "",
      builderName: "",
      secretaryNameEnglish: "",
      societyNameEnglish: "",
      societyAddressEnglish: "",
      managerNameEnglish: "",
      landOwnerNameEnglish: "",
      builderNameEnglish: "",
      managerMobileNo: "",
      secretaryMobileNo: "",
      societyEmailId: "",
      secretaryEmailId: "",
      managerEmailId: "",
      markedForDeletion: false,
      isActive: true,
      createdDate: "2024-01-01",
      updatedDate: null,
    },
    {
      id: 2,
      propertyId: 1,
      wingId: 2,
      wingName: "Wing B",
      societyName: "",
      societyAddress: "",
      secretaryName: "",
      managerName: "",
      landOwnerName: "",
      builderName: "",
      secretaryNameEnglish: "",
      societyNameEnglish: "",
      societyAddressEnglish: "",
      managerNameEnglish: "",
      landOwnerNameEnglish: "",
      builderNameEnglish: "",
      managerMobileNo: "",
      secretaryMobileNo: "",
      societyEmailId: "",
      secretaryEmailId: "",
      managerEmailId: "",
      markedForDeletion: false,
      isActive: true,
      createdDate: "2024-01-01",
      updatedDate: null,
    },
    {
      id: 3,
      propertyId: 1,
      wingId: 1,
      wingName: "Wing A",
      societyName: "",
      societyAddress: "",
      secretaryName: "",
      managerName: "",
      landOwnerName: "",
      builderName: "",
      secretaryNameEnglish: "",
      societyNameEnglish: "",
      societyAddressEnglish: "",
      managerNameEnglish: "",
      landOwnerNameEnglish: "",
      builderNameEnglish: "",
      managerMobileNo: "",
      secretaryMobileNo: "",
      societyEmailId: "",
      secretaryEmailId: "",
      managerEmailId: "",
      markedForDeletion: false,
      isActive: true,
      createdDate: "2024-01-01",
      updatedDate: null,
    },
  ];

  const mockWings: WingItem[] = [
    {
      id: 1,
      wingNo: "A",
      sequenceNo: 1,
      createdDate: "2024-01-01",
      updatedDate: null,
      isActive: true,
    },
    {
      id: 2,
      wingNo: "B",
      sequenceNo: 2,
      createdDate: "2024-01-01",
      updatedDate: null,
      isActive: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() =>
      useWingManagement({
        societyDetails: mockSocietyDetails,
        setSocietyDetails: mockSetSocietyDetails,
        wings: mockWings,
        selectedPropertyId: 1,
      })
    );

    expect(result.current.showWingConfig).toBe(false);
    expect(result.current.showAddWingForm).toBe(false);
    expect(result.current.newWingName).toBe("");
    expect(result.current.addingWing).toBe(false);
    expect(result.current.editingSocietyDetailId).toBeNull();
    expect(result.current.newWingId).toBeNull();
  });

  it("should calculate next wing ID correctly", () => {
    const { result } = renderHook(() =>
      useWingManagement({
        societyDetails: mockSocietyDetails,
        setSocietyDetails: mockSetSocietyDetails,
        wings: mockWings,
        selectedPropertyId: 1,
      })
    );

    expect(result.current.nextWingId).toBe(3); // Max wingId is 2, so next is 3
  });

  it("should calculate next wing ID as 1 when no society details", () => {
    const { result } = renderHook(() =>
      useWingManagement({
        societyDetails: [],
        setSocietyDetails: mockSetSocietyDetails,
        wings: mockWings,
        selectedPropertyId: 1,
      })
    );

    expect(result.current.nextWingId).toBe(1);
  });

  it("should generate wing summaries correctly", () => {
    const { result } = renderHook(() =>
      useWingManagement({
        societyDetails: mockSocietyDetails,
        setSocietyDetails: mockSetSocietyDetails,
        wings: mockWings,
        selectedPropertyId: 1,
      })
    );

    expect(result.current.wingSummaries).toHaveLength(2);
    
    const wingA = result.current.wingSummaries.find(w => w.wingName === "Wing A");
    expect(wingA).toBeDefined();
    expect(wingA?.count).toBe(2);
    expect(wingA?.wingId).toBe(1);
    expect(wingA?.wingNo).toBe("A");

    const wingB = result.current.wingSummaries.find(w => w.wingName === "Wing B");
    expect(wingB).toBeDefined();
    expect(wingB?.count).toBe(1);
    expect(wingB?.wingId).toBe(2);
    expect(wingB?.wingNo).toBe("B");
  });

  it("should successfully create new wing", async () => {
    const newSocietyDetail: SocietyDetailItem = {
      id: 4,
      propertyId: 1,
      wingId: 3,
      wingName: "Wing C",
      societyName: "",
      societyAddress: "",
      secretaryName: "",
      managerName: "",
      landOwnerName: "",
      builderName: "",
      secretaryNameEnglish: "",
      societyNameEnglish: "",
      societyAddressEnglish: "",
      managerNameEnglish: "",
      landOwnerNameEnglish: "",
      builderNameEnglish: "",
      managerMobileNo: "",
      secretaryMobileNo: "",
      societyEmailId: "",
      secretaryEmailId: "",
      managerEmailId: "",
      markedForDeletion: false,
      isActive: true,
      createdDate: "2024-01-01",
      updatedDate: null,
    };

    vi.mocked(createSocietyDetailAction).mockResolvedValueOnce({
      success: true,
      data: newSocietyDetail,
    });

    const { result } = renderHook(() =>
      useWingManagement({
        societyDetails: mockSocietyDetails,
        setSocietyDetails: mockSetSocietyDetails,
        wings: mockWings,
        selectedPropertyId: 1,
      })
    );

    // Set up for creating wing
    act(() => {
      result.current.setShowAddWingForm(true);
      result.current.setNewWingId(3);
      result.current.setNewWingName("Wing C");
    });

    const mockErrors = {};
    const mockSetErrors = vi.fn();

    await act(async () => {
      await result.current.handleSaveWing(mockErrors, mockSetErrors);
    });

    expect(createSocietyDetailAction).toHaveBeenCalledWith({
      propertyId: 1,
      wingId: 3,
      wingName: "Wing C",
      isActive: true,
      createdBy: 1,
    });

    expect(mockSetSocietyDetails).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });

  it("should successfully update existing wing", async () => {
    const updatedSocietyDetail: SocietyDetailItem = {
      ...mockSocietyDetails[0],
      wingName: "Wing A Updated",
    };

    vi.mocked(updateSocietyDetailAction).mockResolvedValueOnce({
      success: true,
      data: updatedSocietyDetail,
    });

    const { result } = renderHook(() =>
      useWingManagement({
        societyDetails: mockSocietyDetails,
        setSocietyDetails: mockSetSocietyDetails,
        wings: mockWings,
        selectedPropertyId: 1,
      })
    );

    // Set up for editing wing
    act(() => {
      result.current.setShowAddWingForm(true);
      result.current.setEditingSocietyDetailId(1);
      result.current.setNewWingId(1);
      result.current.setNewWingName("Wing A Updated");
    });

    const mockErrors = {};
    const mockSetErrors = vi.fn();

    await act(async () => {
      await result.current.handleSaveWing(mockErrors, mockSetErrors);
    });

    expect(updateSocietyDetailAction).toHaveBeenCalledWith(1, {
      // Preserve existing core data
      isActive: true,
      propertyId: 1,
      // Preserve society details
      societyName: "",
      societyAddress: "",
      societyNameEnglish: "",
      societyAddressEnglish: "",
      societyEmailId: "",
      // Preserve secretary details
      secretaryName: "",
      secretaryNameEnglish: "",
      secretaryMobileNo: "",
      secretaryEmailId: "",
      // Preserve manager details
      managerName: "",
      managerNameEnglish: "",
      managerMobileNo: "",
      managerEmailId: "",
      // Preserve land owner and builder details
      landOwnerName: "",
      landOwnerNameEnglish: "",
      builderName: "",
      builderNameEnglish: "",
      // Updated fields
      wingId: 1,
      wingName: "Wing A Updated",
    });

    expect(mockSetSocietyDetails).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });

  it("should validate wing name is required", async () => {
    const { result } = renderHook(() =>
      useWingManagement({
        societyDetails: mockSocietyDetails,
        setSocietyDetails: mockSetSocietyDetails,
        wings: mockWings,
        selectedPropertyId: 1,
      })
    );

    // Set up with empty wing name
    act(() => {
      result.current.setShowAddWingForm(true);
      result.current.setNewWingId(3);
      result.current.setNewWingName("");
    });

    const mockErrors = {};
    const mockSetErrors = vi.fn();

    await act(async () => {
      await result.current.handleSaveWing(mockErrors, mockSetErrors);
    });

    expect(mockSetErrors).toHaveBeenCalled();
    expect(createSocietyDetailAction).not.toHaveBeenCalled();
  });

  it("should handle create wing API error", async () => {
    vi.mocked(createSocietyDetailAction).mockResolvedValueOnce({
      success: false,
      error: "API Error",
    });

    const { result } = renderHook(() =>
      useWingManagement({
        societyDetails: mockSocietyDetails,
        setSocietyDetails: mockSetSocietyDetails,
        wings: mockWings,
        selectedPropertyId: 1,
      })
    );

    act(() => {
      result.current.setShowAddWingForm(true);
      result.current.setNewWingId(3);
      result.current.setNewWingName("Wing C");
    });

    const mockErrors = {};
    const mockSetErrors = vi.fn();

    await act(async () => {
      await result.current.handleSaveWing(mockErrors, mockSetErrors);
    });

    expect(toast.error).toHaveBeenCalled();
  });

  it("should handle update wing API error", async () => {
    vi.mocked(updateSocietyDetailAction).mockResolvedValueOnce({
      success: false,
      error: "API Error",
    });

    const { result } = renderHook(() =>
      useWingManagement({
        societyDetails: mockSocietyDetails,
        setSocietyDetails: mockSetSocietyDetails,
        wings: mockWings,
        selectedPropertyId: 1,
      })
    );

    act(() => {
      result.current.setShowAddWingForm(true);
      result.current.setEditingSocietyDetailId(1);
      result.current.setNewWingId(1);
      result.current.setNewWingName("Wing A Updated");
    });

    const mockErrors = {};
    const mockSetErrors = vi.fn();

    await act(async () => {
      await result.current.handleSaveWing(mockErrors, mockSetErrors);
    });

    expect(toast.error).toHaveBeenCalled();
  });

  it("should not save wing if property is not selected", async () => {
    const { result } = renderHook(() =>
      useWingManagement({
        societyDetails: mockSocietyDetails,
        setSocietyDetails: mockSetSocietyDetails,
        wings: mockWings,
        selectedPropertyId: null,
      })
    );

    act(() => {
      result.current.setShowAddWingForm(true);
      result.current.setNewWingId(3);
      result.current.setNewWingName("Wing C");
    });

    const mockErrors = {};
    const mockSetErrors = vi.fn();

    await act(async () => {
      await result.current.handleSaveWing(mockErrors, mockSetErrors);
    });

    expect(createSocietyDetailAction).not.toHaveBeenCalled();
  });

  it("should reset form after successful save", async () => {
    const newSocietyDetail: SocietyDetailItem = {
      id: 4,
      propertyId: 1,
      wingId: 3,
      wingName: "Wing C",
      societyName: "",
      societyAddress: "",
      secretaryName: "",
      managerName: "",
      landOwnerName: "",
      builderName: "",
      secretaryNameEnglish: "",
      societyNameEnglish: "",
      societyAddressEnglish: "",
      managerNameEnglish: "",
      landOwnerNameEnglish: "",
      builderNameEnglish: "",
      managerMobileNo: "",
      secretaryMobileNo: "",
      societyEmailId: "",
      secretaryEmailId: "",
      managerEmailId: "",
      markedForDeletion: false,
      isActive: true,
      createdDate: "2024-01-01",
      updatedDate: null,
    };

    vi.mocked(createSocietyDetailAction).mockResolvedValueOnce({
      success: true,
      data: newSocietyDetail,
    });

    const { result } = renderHook(() =>
      useWingManagement({
        societyDetails: mockSocietyDetails,
        setSocietyDetails: mockSetSocietyDetails,
        wings: mockWings,
        selectedPropertyId: 1,
      })
    );

    act(() => {
      result.current.setShowAddWingForm(true);
      result.current.setNewWingId(3);
      result.current.setNewWingName("Wing C");
    });

    const mockErrors = {};
    const mockSetErrors = vi.fn();

    await act(async () => {
      await result.current.handleSaveWing(mockErrors, mockSetErrors);
    });

    // Form should be reset
    expect(result.current.newWingId).toBeNull();
    expect(result.current.newWingName).toBe("");
    expect(result.current.editingSocietyDetailId).toBeNull();
    expect(result.current.showAddWingForm).toBe(false);
  });

  it("should call onWingSaveSuccess callback after successful wing save", async () => {
    const newSocietyDetail: SocietyDetailItem = {
      ...mockSocietyDetails[0],
      id: 10,
      wingId: 3,
      wingName: "Wing C",
    };

    vi.mocked(createSocietyDetailAction).mockResolvedValueOnce({
      success: true,
      data: newSocietyDetail,
    });

    const mockOnWingSaveSuccess = vi.fn();

    const { result } = renderHook(() =>
      useWingManagement({
        societyDetails: mockSocietyDetails,
        setSocietyDetails: mockSetSocietyDetails,
        wings: mockWings,
        selectedPropertyId: 1,
        onWingSaveSuccess: mockOnWingSaveSuccess,
      })
    );

    act(() => {
      result.current.setShowAddWingForm(true);
      result.current.setNewWingId(3);
      result.current.setNewWingName("Wing C");
    });

    const mockErrors = {};
    const mockSetErrors = vi.fn();

    await act(async () => {
      await result.current.handleSaveWing(mockErrors, mockSetErrors);
    });

    expect(createSocietyDetailAction).toHaveBeenCalled();
    expect(mockOnWingSaveSuccess).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalled();
  });
});
