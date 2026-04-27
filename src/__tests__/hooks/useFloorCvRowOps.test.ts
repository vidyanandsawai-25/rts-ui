import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFloorCvRowOps } from "@/hooks/useFloorCvRowOps";
import { FloorFactorCVMaster } from "@/types/weightageMaster.types";
import {
    createFloorFactorCVMasterAction,
    updateFloorFactorCVMasterAction,
} from "@/app/[locale]/property-tax/weightage-master/action";

vi.mock("@/app/[locale]/property-tax/weightage-master/action", () => ({
    createFloorFactorCVMasterAction: vi.fn(),
    updateFloorFactorCVMasterAction: vi.fn(),
    bulkCreateFloorFactorCVMasterAction: vi.fn(),
    bulkUpdateFloorFactorCVMasterAction: vi.fn(),
}));

vi.mock("next-intl", () => ({
    useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

const existingRow: FloorFactorCVMaster = {
    floorFactorId: 1,
    floorId: 101,
    floorCode: "F1",
    floorDescription: "First Floor",
    factorWithLift: 1.2,
    factorWithoutLift: 1.0,
    yearRangeCVId: 2024,
    yearRangeCVID: 2024,
    fromYear: 2024,
    toYear: 2025,
    isActive: true,
};

const newRow: FloorFactorCVMaster = {
    ...existingRow,
    floorFactorId: 0,
    floorId: 102,
    factorWithLift: 0,
    factorWithoutLift: 0,
};

const getRowUid = (row: FloorFactorCVMaster) =>
    `${row.floorFactorId}-${row.floorId}-${row.yearRangeCVID || "noYear"}-${row.fromYear}-${row.toYear}`;

const existingUid = getRowUid(existingRow);
const newUid = getRowUid(newRow);

function buildHook(overrides: { editableRows?: Record<string, FloorFactorCVMaster>; data?: FloorFactorCVMaster[] } = {}) {
    const editableRows = overrides.editableRows ?? {};
    const data = overrides.data ?? [existingRow, newRow];
    const setEditableRows = vi.fn();
    const setIsUpdating = vi.fn();
    const addToast = vi.fn();
    const refreshPage = vi.fn();
    const findRowByUid = (uid: string) => data.find((r) => getRowUid(r) === uid);

    const { result } = renderHook(() =>
        useFloorCvRowOps({ data, editableRows, setEditableRows, setIsUpdating, getRowUid, findRowByUid, addToast, refreshPage })
    );
    return { result, mocks: { setEditableRows, setIsUpdating, addToast, refreshPage } };
}

describe("useFloorCvRowOps – handleCellChange", () => {
    it("calls setEditableRows for a valid positive value", () => {
        const { result, mocks } = buildHook();
        act(() => { result.current.handleCellChange(existingUid, "factorWithLift", 2.5); });
        expect(mocks.setEditableRows).toHaveBeenCalled();
        expect(mocks.addToast).not.toHaveBeenCalled();
    });

    it("rejects negative values with error toast", () => {
        const { result, mocks } = buildHook();
        act(() => { result.current.handleCellChange(existingUid, "factorWithLift", -1); });
        expect(mocks.addToast).toHaveBeenCalledWith("error", expect.stringContaining("negativeValuesNotAllowed"));
        expect(mocks.setEditableRows).not.toHaveBeenCalled();
    });

    it("rejects values > 999999 with error toast", () => {
        const { result, mocks } = buildHook();
        act(() => { result.current.handleCellChange(existingUid, "factorWithLift", 1000000); });
        expect(mocks.addToast).toHaveBeenCalledWith("error", expect.stringContaining("valueExceedsMax"));
        expect(mocks.setEditableRows).not.toHaveBeenCalled();
    });

    it("treats empty string as 0 (valid)", () => {
        const { result, mocks } = buildHook();
        act(() => { result.current.handleCellChange(existingUid, "factorWithLift", ""); });
        expect(mocks.setEditableRows).toHaveBeenCalled();
    });
});

describe("useFloorCvRowOps – handleUpdate", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it("shows warning when no editable data exists for row", async () => {
        const { result, mocks } = buildHook({ editableRows: {} });
        await act(async () => { await result.current.handleUpdate(existingRow); });
        expect(mocks.addToast).toHaveBeenCalledWith("warning", expect.stringContaining("noChangesToUpdate"));
    });

    it("shows warning when values have not changed", async () => {
        const { result, mocks } = buildHook({ editableRows: { [existingUid]: { ...existingRow } } });
        await act(async () => { await result.current.handleUpdate(existingRow); });
        expect(mocks.addToast).toHaveBeenCalledWith("warning", expect.stringContaining("noChangesDetected"));
    });

    it("calls updateFloorFactorCVMasterAction for existing records on success", async () => {
        vi.mocked(updateFloorFactorCVMasterAction).mockResolvedValueOnce({ success: true, message: "" });
        const { result, mocks } = buildHook({ editableRows: { [existingUid]: { ...existingRow, factorWithLift: 2.0 } } });
        await act(async () => { await result.current.handleUpdate(existingRow); });
        expect(updateFloorFactorCVMasterAction).toHaveBeenCalledWith(1, expect.objectContaining({ factorWithLift: 2.0 }));
        expect(mocks.addToast).toHaveBeenCalledWith("success", expect.any(String));
    });

    it("calls createFloorFactorCVMasterAction for new records (id===0)", async () => {
        vi.mocked(createFloorFactorCVMasterAction).mockResolvedValueOnce({ success: true, message: "" });
        const { result, mocks } = buildHook({ editableRows: { [newUid]: { ...newRow, factorWithLift: 1.5 } } });
        await act(async () => { await result.current.handleUpdate(newRow); });
        expect(createFloorFactorCVMasterAction).toHaveBeenCalledWith(expect.objectContaining({ factorWithLift: 1.5 }));
        expect(mocks.addToast).toHaveBeenCalledWith("success", expect.any(String));
    });

    it("shows error toast on update failure", async () => {
        vi.mocked(updateFloorFactorCVMasterAction).mockResolvedValueOnce({ success: false, message: "Server error" });
        const { result, mocks } = buildHook({ editableRows: { [existingUid]: { ...existingRow, factorWithLift: 2.0 } } });
        await act(async () => { await result.current.handleUpdate(existingRow); });
        expect(mocks.addToast).toHaveBeenCalledWith("error", "Server error");
    });

    it("shows error toast when action throws", async () => {
        vi.mocked(updateFloorFactorCVMasterAction).mockRejectedValueOnce(new Error("Network error"));
        const { result, mocks } = buildHook({ editableRows: { [existingUid]: { ...existingRow, factorWithLift: 2.0 } } });
        await act(async () => { await result.current.handleUpdate(existingRow); });
        expect(mocks.addToast).toHaveBeenCalledWith("error", expect.stringContaining("failedToSaveRow"));
    });

    it("always calls setIsUpdating(false) in finally", async () => {
        vi.mocked(updateFloorFactorCVMasterAction).mockRejectedValueOnce(new Error("fail"));
        const { result, mocks } = buildHook({ editableRows: { [existingUid]: { ...existingRow, factorWithLift: 2.0 } } });
        await act(async () => { await result.current.handleUpdate(existingRow); });
        expect(mocks.setIsUpdating).toHaveBeenCalledWith(false);
    });

    it("schedules refreshPage after 1000ms on success", async () => {
        vi.useFakeTimers();
        vi.mocked(updateFloorFactorCVMasterAction).mockResolvedValueOnce({ success: true, message: "" });
        const { result, mocks } = buildHook({ editableRows: { [existingUid]: { ...existingRow, factorWithLift: 2.0 } } });
        await act(async () => { await result.current.handleUpdate(existingRow); });
        expect(mocks.refreshPage).not.toHaveBeenCalled();
        act(() => { vi.advanceTimersByTime(1000); });
        expect(mocks.refreshPage).toHaveBeenCalled();
        vi.useRealTimers();
    });
});

describe("useFloorCvRowOps – handleCancel", () => {
    it("calls setEditableRows to remove the row", () => {
        const { result, mocks } = buildHook({ editableRows: { [existingUid]: { ...existingRow } } });
        act(() => { result.current.handleCancel(existingRow); });
        expect(mocks.setEditableRows).toHaveBeenCalled();
    });

    it("shows info toast on cancel", () => {
        const { result, mocks } = buildHook({ editableRows: { [existingUid]: { ...existingRow } } });
        act(() => { result.current.handleCancel(existingRow); });
        expect(mocks.addToast).toHaveBeenCalledWith("info", expect.stringContaining("changesDiscarded"));
    });
});
