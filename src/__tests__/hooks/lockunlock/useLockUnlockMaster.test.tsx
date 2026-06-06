import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useLockUnlockMaster } from "@/hooks/lockunlock/useLockUnlockMaster";
import { fetchLockUnlockPropertiesPagedAction } from "@/app/[locale]/property-tax/lockunlock/action";
import { toast } from "sonner";
import { LockedScreen, LockUnlockPropertyItem } from "@/types/loackunlock.types";

// Mock dependencies
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

const mockPush = vi.fn();
const mockPathname = "/en/property-tax/lockunlock";
const mockSearchParams = {
  toString: () => "wardId=79",
  get: (key: string) => (key === "wardId" ? "79" : null),
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

const mockConfirm = vi.fn();
vi.mock("@/components/common/ConfirmProvider", () => ({
  useConfirm: () => ({
    confirm: mockConfirm,
  }),
}));

vi.mock("@/app/[locale]/property-tax/lockunlock/action", () => ({
  fetchLockUnlockPropertiesPagedAction: vi.fn(),
  bulkLockUnlockPropertiesAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  Lock: () => null,
  Unlock: () => null,
}));

// Mock components
vi.mock("@/components/common", () => ({
  Button: () => null,
  ToggleSwitch: () => null,
}));

describe("useLockUnlockMaster", () => {
  const defaultProps = {
    wardIdFromUrl: "79",
    screens: [
      { id: 1, screenName: "Screen A", screenCode: "SA", screenNameLocal: "Screen A Local", displayOrder: 1 } as LockedScreen,
      { id: 2, screenName: "Screen B", screenCode: "SB", screenNameLocal: "Screen B Local", displayOrder: 2 } as LockedScreen,
    ],
    dropdownProperties: [
      { label: "Prop 1", value: "P1" },
      { label: "Prop 2", value: "P2" },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default states", () => {
    const { result } = renderHook(() => useLockUnlockMaster(defaultProps));

    expect(result.current.formData).toEqual({
      wardId: "79",
      fromProperty: "",
      toProperty: "",
    });
    expect(result.current.selectedScreenIds).toEqual([]);
    expect(result.current.showResults).toBe(false);
    expect(result.current.properties).toEqual([]);
    expect(result.current.selectedPropertyIds).toEqual([]);
    expect(result.current.editModal).toEqual({
      isOpen: false,
      property: null,
      selectedScreenIds: [],
    });
  });

  it("should handle form select changes", () => {
    const { result } = renderHook(() => useLockUnlockMaster(defaultProps));

    act(() => {
      result.current.handleSelectChange("fromProperty", "P1");
    });

    expect(result.current.formData.fromProperty).toBe("P1");
  });

  it("should update URL when wardId changes", () => {
    const { result } = renderHook(() => useLockUnlockMaster(defaultProps));

    act(() => {
      result.current.handleSelectChange("wardId", "80");
    });

    expect(mockPush).toHaveBeenCalled();
  });

  it("should handle clear all", () => {
    const { result } = renderHook(() => useLockUnlockMaster(defaultProps));

    act(() => {
      result.current.handleSelectChange("fromProperty", "P1");
      result.current.handleClearAll();
    });

    expect(result.current.formData).toEqual({
      wardId: "",
      fromProperty: "",
      toProperty: "",
    });
    expect(toast.info).toHaveBeenCalledWith("messages.clearedFilters");
  });

  it("should validation fail on handleShow with missing fields", () => {
    const { result } = renderHook(() => useLockUnlockMaster(defaultProps));

    act(() => {
      result.current.handleShow();
    });

    expect(toast.error).toHaveBeenCalledWith("messages.validationError");
  });

  it("should call API on handleShow with complete fields", async () => {
    const mockItems: LockUnlockPropertyItem[] = [
      { propertyId: 101, propertyNo: "Prop-101", isLocked: false, lockedScreens: [], wardId: 79, wardNo: "79", partitionNo: "" },
    ];
    vi.mocked(fetchLockUnlockPropertiesPagedAction).mockResolvedValueOnce({
      items: mockItems,
      totalCount: 1,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false,
    });

    const { result } = renderHook(() => useLockUnlockMaster(defaultProps));

    act(() => {
      result.current.handleSelectChange("fromProperty", "P1");
      result.current.handleSelectChange("toProperty", "P2");
    });

    await act(async () => {
      result.current.handleShow();
    });

    expect(fetchLockUnlockPropertiesPagedAction).toHaveBeenCalledWith({
      WardId: 79,
      FromPropertyNo: "P1",
      ToPropertyNo: "P2",
      PageNumber: 1,
      PageSize: 10,
    });
    expect(result.current.properties).toEqual(mockItems);
    expect(result.current.showResults).toBe(true);
  });
});
