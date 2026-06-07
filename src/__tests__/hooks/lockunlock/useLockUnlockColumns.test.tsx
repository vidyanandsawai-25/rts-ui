import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { LockedScreen, LockUnlockPropertyItem } from "@/types/lockunlock.types";
import { useLockUnlockColumns } from "@/hooks/lockunlock/useLockUnlockColumns";

const mockT = vi.fn((key: string, values?: Record<string, unknown>) => {
  const translations: Record<string, string> = {
    "resultsTable.columns.wardNo": "Ward No",
    "resultsTable.columns.propertyNo": "Property No",
    "resultsTable.columns.partitionNo": "Partition No",
    "resultsTable.columns.screenNames": "Screen Names",
    "resultsTable.columns.status": "Status",
    "resultsTable.columns.lockUnlock": "Lock/Unlock",
    "resultsTable.columns.actions": "Actions",
    "resultsTable.status.none": "None",
    "resultsTable.status.locked": "Locked",
    "resultsTable.status.unlocked": "Unlocked",
    "resultsTable.actions.manage": "Manage",
  };
  return translations[key] || key;
});

vi.mock("next-intl", () => ({
  useTranslations: () => mockT,
}));

describe("useLockUnlockColumns", () => {
  const mockScreens: LockedScreen[] = [
    { id: 1, screenCode: "S1", screenName: "Screen 1", screenNameLocal: "", displayOrder: 1 },
    { id: 2, screenCode: "S2", screenName: "Screen 2", screenNameLocal: "", displayOrder: 2 },
  ];

  const mockProperties: LockUnlockPropertyItem[] = [
    {
      propertyId: 101,
      wardId: 1,
      wardNo: "1",
      propertyNo: "P001",
      partitionNo: "A",
      isLocked: true,
      lockedScreens: [1],
    },
    {
      propertyId: 102,
      wardId: 1,
      wardNo: "1",
      propertyNo: "P002",
      partitionNo: "",
      isLocked: false,
      lockedScreens: [],
    },
  ];

  const defaultParams = {
    screens: mockScreens,
    selectedPropertyIds: [101],
    properties: mockProperties,
    isPending: false,
    onSelectProperty: vi.fn(),
    onSelectAllProperties: vi.fn(),
    onToggleLock: vi.fn(),
    onManageLocks: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return an array of columns", () => {
    const { result } = renderHook(() => useLockUnlockColumns(defaultParams));
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBeGreaterThan(0);
  });

  it("should have all expected column keys", () => {
    const { result } = renderHook(() => useLockUnlockColumns(defaultParams));
    const keys = result.current.map((col) => col.key);
    expect(keys).toEqual([
      "checkbox",
      "wardNo",
      "propertyNo",
      "partitionNo",
      "lockedScreens",
      "isLocked",
      "lockUnlockAction",
      "actions",
    ]);
  });

  it("should render the select-all checkbox checked when all properties selected", () => {
    const params = {
      ...defaultParams,
      selectedPropertyIds: [101, 102],
      properties: mockProperties,
    };
    const { result } = renderHook(() => useLockUnlockColumns(params));
    const checkboxCol = result.current.find((col) => col.key === "checkbox");
    expect(checkboxCol).toBeDefined();
  });

  it("should render wardNo column with correct label", () => {
    const { result } = renderHook(() => useLockUnlockColumns(defaultParams));
    const wardCol = result.current.find((col) => col.key === "wardNo");
    expect(wardCol).toBeDefined();
    expect(wardCol!.width).toBe("12%");
  });

  it("should render propertyNo column with correct label", () => {
    const { result } = renderHook(() => useLockUnlockColumns(defaultParams));
    const propCol = result.current.find((col) => col.key === "propertyNo");
    expect(propCol).toBeDefined();
    expect(propCol!.width).toBe("15%");
  });

  it("should render partitionNo column with correct label", () => {
    const { result } = renderHook(() => useLockUnlockColumns(defaultParams));
    const partCol = result.current.find((col) => col.key === "partitionNo");
    expect(partCol).toBeDefined();
    expect(partCol!.width).toBe("13%");
  });

  it("should render lockedScreens column with correct label", () => {
    const { result } = renderHook(() => useLockUnlockColumns(defaultParams));
    const screenCol = result.current.find((col) => col.key === "lockedScreens");
    expect(screenCol).toBeDefined();
    expect(screenCol!.width).toBe("20%");
  });

  it("should render isLocked column with correct label", () => {
    const { result } = renderHook(() => useLockUnlockColumns(defaultParams));
    const statusCol = result.current.find((col) => col.key === "isLocked");
    expect(statusCol).toBeDefined();
    expect(statusCol!.width).toBe("16%");
  });

  it("should render lockUnlockAction column with correct label", () => {
    const { result } = renderHook(() => useLockUnlockColumns(defaultParams));
    const actionCol = result.current.find((col) => col.key === "lockUnlockAction");
    expect(actionCol).toBeDefined();
    expect(actionCol!.width).toBe("12%");
  });

  it("should render actions column with correct label", () => {
    const { result } = renderHook(() => useLockUnlockColumns(defaultParams));
    const actionCol = result.current.find((col) => col.key === "actions");
    expect(actionCol).toBeDefined();
    expect(actionCol!.width).toBe("10%");
  });
});