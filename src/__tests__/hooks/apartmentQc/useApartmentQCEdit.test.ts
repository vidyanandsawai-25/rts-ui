import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useApartmentQCEdit } from "@/hooks/apartmentQc/useApartmentQCEdit";
import { useRouter } from "next/navigation";

// Mock next/navigation
vi.mock("next/navigation", () => {
  const router = {
    replace: vi.fn(),
    push: vi.fn(),
  };
  const searchParams = {
    get: vi.fn(),
    toString: vi.fn(() => ""),
  };
  return {
    useRouter: () => router,
    useSearchParams: () => searchParams,
    usePathname: () => "/test-path",
  };
});

describe("useApartmentQCEdit", () => {
  const mockProps = {
    floors: [],
    constructionTypes: [],
    useTypes: [],
    allSubTypes: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default floor data", () => {
    const { result } = renderHook(() => useApartmentQCEdit(mockProps));
    expect(result.current.floorData).toHaveLength(2);
    expect(result.current.floorData[0].id).toBe("row-1");
  });

  it("should update floor data row", () => {
    const { result } = renderHook(() => useApartmentQCEdit(mockProps));
    
    act(() => {
      result.current.updateRow("row-1", "area", "2000");
    });

    expect(result.current.floorData[0].area).toBe("2000");
  });

  it("should reset subTypeOfUseId when typeOfUseId changes", () => {
    const { result } = renderHook(() => useApartmentQCEdit(mockProps));
    
    act(() => {
      result.current.updateRow("row-1", "subTypeOfUseId", "sub-1");
    });
    expect(result.current.floorData[0].subTypeOfUseId).toBe("sub-1");

    act(() => {
      result.current.updateRow("row-1", "typeOfUseId", "use-2");
    });
    expect(result.current.floorData[0].subTypeOfUseId).toBe("");
  });

  it("should trigger loadFloors when floors dropdown is clicked and list is empty", () => {
    const mockRouter = useRouter();
    const { result } = renderHook(() => useApartmentQCEdit(mockProps));

    act(() => {
      result.current.handleFloorDropdownClick();
    });

    expect(mockRouter.replace).toHaveBeenCalled();
    const callUrl = vi.mocked(mockRouter.replace).mock.calls[0][0];
    expect(callUrl).toContain("loadFloors=true");
  });

  it("should return options mapped from props", () => {
    const propsWithData = {
      ...mockProps,
      floors: [{ floorId: 1, floorCode: "F1", description: "First Floor" }],
    };
    const { result } = renderHook(() => useApartmentQCEdit(propsWithData as any));

    expect(result.current.floorOptions).toEqual([{ value: "1", label: "First Floor" }]);
  });
});
