import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFloorCvWeightage } from "@/hooks/useFloorCvWeightage";
import { FloorFactorCVMaster } from "@/types/weightageMaster.types";

vi.mock("@/app/[locale]/property-tax/weightage-master/action", () => ({
    createFloorFactorCVMasterAction: vi.fn(),
    updateFloorFactorCVMasterAction: vi.fn(),
    bulkCreateFloorFactorCVMasterAction: vi.fn(),
    bulkUpdateFloorFactorCVMasterAction: vi.fn(),
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockGet = vi.fn().mockImplementation((key: string) => {
    if (key === "selectedYearRange") return "2024";
    if (key === "q") return "";
    return null;
});

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
    useSearchParams: () => ({ get: mockGet }),
}));

vi.mock("next-intl", () => ({
    useLocale: () => "en",
    useTranslations: (ns: string) => (key: string, _p?: Record<string, unknown>) => `${ns}.${key}`,
}));

const existingRow: FloorFactorCVMaster = {
    floorFactorId: 1, floorId: 101, floorCode: "F1", floorDescription: "First Floor",
    factorWithLift: 1.2, factorWithoutLift: 1.0, yearRangeCVId: 2024, yearRangeCVID: 2024,
    fromYear: 2024, toYear: 2025, isActive: true,
};

const newRow: FloorFactorCVMaster = {
    ...existingRow, floorFactorId: 0, floorId: 102, factorWithLift: 0, factorWithoutLift: 0,
};

function buildHook(data = [existingRow, newRow]) {
    return renderHook(() =>
        useFloorCvWeightage({ data, pageNumber: 1, pageSize: 10, totalCount: 2 })
    );
}

describe("useFloorCvWeightage – initialization", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it("initialises selectedYear from searchParams", () => {
        const { result } = buildHook();
        expect(result.current.selectedYear).toBe("2024");
    });

    it("initialises filter states to defaults", () => {
        const { result } = buildHook();
        expect(result.current.fromFloor).toBe("");
        expect(result.current.toFloor).toBe("");
        expect(result.current.liftStatus).toBe("both");
        expect(result.current.factorValue).toBe("0.00");
    });

    it("exposes editableRows as empty initially", () => {
        const { result } = buildHook();
        expect(result.current.editableRows).toEqual({});
    });

    it("correctly derives newRecordsCount and hasNewRecords", () => {
        const { result } = buildHook();
        expect(result.current.newRecordsCount).toBe(1);
        expect(result.current.hasNewRecords).toBe(true);
    });

    it("shows no new records when all rows have floorFactorId > 0", () => {
        const { result } = buildHook([existingRow]);
        expect(result.current.hasNewRecords).toBe(false);
        expect(result.current.newRecordsCount).toBe(0);
    });

    it("provides liftStatusOptions array with 3 entries", () => {
        const { result } = buildHook();
        expect(result.current.liftStatusOptions).toHaveLength(3);
    });
});

describe("useFloorCvWeightage – toast helpers", () => {
    it("addToast appends a toast to the list", () => {
        const { result } = buildHook();
        // On mount a warning toast is auto-added because newRecords exist.
        // Capture the count before adding our own toast.
        const countBefore = result.current.toasts.length;
        act(() => { result.current.addToast("success", "Hello"); });
        expect(result.current.toasts).toHaveLength(countBefore + 1);
        const last = result.current.toasts[result.current.toasts.length - 1];
        expect(last.type).toBe("success");
        expect(last.message).toBe("Hello");
    });

    it("removeToast removes a toast by id", () => {
        // Use only existing records so no auto-warning toast fires
        const { result } = buildHook([existingRow]);
        expect(result.current.toasts).toHaveLength(0);
        act(() => { result.current.addToast("info", "Msg"); });
        expect(result.current.toasts).toHaveLength(1);
        const id = result.current.toasts[0].id;
        act(() => { result.current.removeToast(id); });
        expect(result.current.toasts).toHaveLength(0);
    });

    it("shows pendingRecordsWarning toast on first render when new records exist", async () => {
        vi.useFakeTimers();
        const { result } = buildHook();
        // Flush the deferred setTimeout(0) inside the useEffect
        await act(async () => { vi.advanceTimersByTime(0); });
        expect(result.current.toasts.some((t) => t.type === "warning")).toBe(true);
        vi.useRealTimers();
    });
});

describe("useFloorCvWeightage – getRowUid", () => {
    it("generates a stable unique identifier for a row", () => {
        const { result } = buildHook();
        const uid = result.current.getRowUid(existingRow);
        expect(uid).toBe("1-101-2024-2024-2025");
    });

    it("uses 'noYear' when yearRangeCVID is undefined", () => {
        const { result } = buildHook();
        const row = { ...existingRow, yearRangeCVID: undefined };
        const uid = result.current.getRowUid(row as FloorFactorCVMaster);
        expect(uid).toContain("noYear");
    });
});

describe("useFloorCvWeightage – derived state", () => {
    it("isApplyDisabled is true when factorValue is 0", () => {
        const { result } = buildHook();
        // factorValue defaults to "0.00" → parseFloat <= 0
        expect(result.current.isApplyDisabled).toBe(true);
    });

    it("isBulkUpdateDisabled is true when editableRows is empty", () => {
        const { result } = buildHook();
        expect(result.current.isBulkUpdateDisabled).toBe(true);
    });
});

describe("useFloorCvWeightage – filter state setters", () => {
    it("setFromFloor updates fromFloor", () => {
        const { result } = buildHook();
        act(() => { result.current.setFromFloor("101"); });
        expect(result.current.fromFloor).toBe("101");
    });

    it("setToFloor updates toFloor", () => {
        const { result } = buildHook();
        act(() => { result.current.setToFloor("102"); });
        expect(result.current.toFloor).toBe("102");
    });

    it("setLiftStatus updates liftStatus", () => {
        const { result } = buildHook();
        act(() => { result.current.setLiftStatus("withLift"); });
        expect(result.current.liftStatus).toBe("withLift");
    });

    it("setFactorValue updates factorValue", () => {
        const { result } = buildHook();
        act(() => { result.current.setFactorValue("2.5"); });
        expect(result.current.factorValue).toBe("2.5");
    });
});

describe("useFloorCvWeightage – pagination", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it("changePage calls router.push with correct page param", () => {
        const { result } = buildHook();
        act(() => { result.current.changePage(3); });
        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("page=3"));
    });

    it("changePageSize calls router.push with page=1 and new pageSize", () => {
        const { result } = buildHook();
        act(() => { result.current.changePageSize(20); });
        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("pageSize=20"));
        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("page=1"));
    });

    it("handleAssessmentYearChange updates selectedYear and pushes to router", () => {
        const { result } = buildHook();
        act(() => { result.current.handleAssessmentYearChange("2025"); });
        expect(result.current.selectedYear).toBe("2025");
        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("selectedYearRange=2025"));
    });
});

describe("useFloorCvWeightage – handleClearAll", () => {
    it("resets all filter state and navigates", () => {
        const { result } = buildHook();
        act(() => {
            result.current.setFromFloor("101");
            result.current.setFactorValue("2.0");
        });
        act(() => { result.current.handleClearAll(); });
        expect(result.current.fromFloor).toBe("");
        expect(result.current.factorValue).toBe("0.00");
        expect(result.current.liftStatus).toBe("both");
        expect(result.current.editableRows).toEqual({});
        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("property-tax/weightage-master"));
    });

    it("shows info toast on clearAll", () => {
        const { result } = buildHook();
        act(() => { result.current.handleClearAll(); });
        expect(result.current.toasts.some((t) => t.type === "info")).toBe(true);
    });
});
