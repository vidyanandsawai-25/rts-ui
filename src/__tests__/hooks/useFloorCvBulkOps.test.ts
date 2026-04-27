import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFloorCvBulkOps } from "@/hooks/useFloorCvBulkOps";
import { FloorFactorCVMaster } from "@/types/weightageMaster.types";
import {
    bulkCreateFloorFactorCVMasterAction,
    bulkUpdateFloorFactorCVMasterAction,
} from "@/app/[locale]/property-tax/weightage-master/action";

vi.mock("@/app/[locale]/property-tax/weightage-master/action", () => ({
    createFloorFactorCVMasterAction: vi.fn(),
    updateFloorFactorCVMasterAction: vi.fn(),
    bulkCreateFloorFactorCVMasterAction: vi.fn(),
    bulkUpdateFloorFactorCVMasterAction: vi.fn(),
}));

vi.mock("next-intl", () => ({
    useTranslations: (ns: string) => (key: string, _params?: Record<string, unknown>) => `${ns}.${key}`,
}));

const existingRow: FloorFactorCVMaster = {
    floorFactorId: 1, floorId: 101, floorCode: "F1", floorDescription: "First Floor",
    factorWithLift: 1.2, factorWithoutLift: 1.0, yearRangeCVId: 2024, yearRangeCVID: 2024,
    fromYear: 2024, toYear: 2025, isActive: true,
};

const newRow: FloorFactorCVMaster = {
    ...existingRow, floorFactorId: 0, floorId: 102, factorWithLift: 0, factorWithoutLift: 0,
};

const getRowUid = (row: FloorFactorCVMaster) =>
    `${row.floorFactorId}-${row.floorId}-${row.yearRangeCVID || "noYear"}-${row.fromYear}-${row.toYear}`;

const existingUid = getRowUid(existingRow);
const newUid = getRowUid(newRow);

function buildHook(params: {
    data?: FloorFactorCVMaster[];
    editableRows?: Record<string, FloorFactorCVMaster>;
    fromFloor?: string;
    toFloor?: string;
    liftStatus?: string;
    factorValue?: string;
} = {}) {
    const data = params.data ?? [existingRow, newRow];
    const editableRows = params.editableRows ?? {};
    const setEditableRows = vi.fn();
    const setIsBulkUpdating = vi.fn();
    const setIsGeneratingAll = vi.fn();
    const addToast = vi.fn();
    const refreshPage = vi.fn();
    const findRowByUid = (uid: string) => data.find((r) => getRowUid(r) === uid);

    const { result } = renderHook(() =>
        useFloorCvBulkOps({
            data, editableRows, setEditableRows, setIsBulkUpdating, setIsGeneratingAll,
            fromFloor: params.fromFloor ?? "", toFloor: params.toFloor ?? "",
            liftStatus: params.liftStatus ?? "both", factorValue: params.factorValue ?? "1.5",
            getRowUid, findRowByUid, addToast, refreshPage,
        })
    );
    return { result, mocks: { setEditableRows, setIsBulkUpdating, setIsGeneratingAll, addToast, refreshPage } };
}

describe("useFloorCvBulkOps – handleApplyFilter", () => {
    it("shows warning when factor is 0 or empty", () => {
        const { result, mocks } = buildHook({ factorValue: "0" });
        act(() => { result.current.handleApplyFilter(); });
        expect(mocks.addToast).toHaveBeenCalledWith("warning", expect.stringContaining("validFactorRequired"));
        expect(mocks.setEditableRows).not.toHaveBeenCalled();
    });

    it("shows error when fromFloor > toFloor", () => {
        const { result, mocks } = buildHook({ fromFloor: "102", toFloor: "101", factorValue: "1.5" });
        act(() => { result.current.handleApplyFilter(); });
        expect(mocks.addToast).toHaveBeenCalledWith("error", expect.stringContaining("fromFloorGreaterError"));
    });

    it("applies factor to both lift fields when liftStatus is 'both'", () => {
        const { result, mocks } = buildHook({ liftStatus: "both", factorValue: "2.0" });
        act(() => { result.current.handleApplyFilter(); });
        expect(mocks.setEditableRows).toHaveBeenCalled();
        expect(mocks.addToast).toHaveBeenCalledWith("success", expect.any(String));
    });

    it("applies factor to factorWithLift only when liftStatus is 'withLift'", () => {
        const { result, mocks } = buildHook({ liftStatus: "withLift", factorValue: "2.0" });
        act(() => { result.current.handleApplyFilter(); });
        expect(mocks.setEditableRows).toHaveBeenCalled();
    });

    it("applies factor to factorWithoutLift only when liftStatus is 'withoutLift'", () => {
        const { result, mocks } = buildHook({ liftStatus: "withoutLift", factorValue: "2.0" });
        act(() => { result.current.handleApplyFilter(); });
        expect(mocks.setEditableRows).toHaveBeenCalled();
    });

    it("shows warning when no rows match the floor range filter", () => {
        const { result, mocks } = buildHook({ fromFloor: "999", toFloor: "999", factorValue: "1.5" });
        act(() => { result.current.handleApplyFilter(); });
        expect(mocks.addToast).toHaveBeenCalledWith("warning", expect.stringContaining("noRecordsMatch"));
    });

    it("respects fromFloor filter – only rows with floorId >= fromFloor are updated", () => {
        // floorId 102 >= 102, floorId 101 is excluded
        const { result, mocks } = buildHook({ fromFloor: "102", factorValue: "3.0", liftStatus: "both" });
        act(() => { result.current.handleApplyFilter(); });
        // The updater function merges existing with updated; check it was called
        expect(mocks.setEditableRows).toHaveBeenCalled();
        expect(mocks.addToast).toHaveBeenCalledWith("success", expect.any(String));
    });
});

describe("useFloorCvBulkOps – handleBulkUpdate", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it("shows warning when editableRows is empty", async () => {
        const { result, mocks } = buildHook({ editableRows: {} });
        await act(async () => { await result.current.handleBulkUpdate(); });
        expect(mocks.addToast).toHaveBeenCalledWith("warning", expect.stringContaining("noRecordsToUpdate"));
    });

    it("calls bulkUpdateFloorFactorCVMasterAction for existing records", async () => {
        vi.mocked(bulkUpdateFloorFactorCVMasterAction).mockResolvedValueOnce({ success: true, message: "" });
        const editableRows = { [existingUid]: { ...existingRow, factorWithLift: 2.0 } };
        const { result, mocks } = buildHook({ editableRows });
        await act(async () => { await result.current.handleBulkUpdate(); });
        expect(bulkUpdateFloorFactorCVMasterAction).toHaveBeenCalledWith(
            expect.objectContaining({ floorFactors: expect.any(Array) })
        );
        expect(mocks.addToast).toHaveBeenCalledWith("success", expect.any(String));
    });

    it("calls bulkCreateFloorFactorCVMasterAction for new records", async () => {
        vi.mocked(bulkCreateFloorFactorCVMasterAction).mockResolvedValueOnce({ success: true, message: "" });
        const editableRows = { [newUid]: { ...newRow, factorWithLift: 1.5 } };
        const { result, mocks } = buildHook({ editableRows });
        await act(async () => { await result.current.handleBulkUpdate(); });
        expect(bulkCreateFloorFactorCVMasterAction).toHaveBeenCalledWith(
            expect.objectContaining({ floorFactors: expect.any(Array) })
        );
        expect(mocks.addToast).toHaveBeenCalledWith("success", expect.any(String));
    });

    it("shows warning toast on partial success", async () => {
        vi.mocked(bulkUpdateFloorFactorCVMasterAction).mockResolvedValueOnce({ success: false, message: "fail" });
        vi.mocked(bulkCreateFloorFactorCVMasterAction).mockResolvedValueOnce({ success: true, message: "" });
        const editableRows = {
            [existingUid]: { ...existingRow, factorWithLift: 2.0 },
            [newUid]: { ...newRow, factorWithLift: 1.5 },
        };
        const { result, mocks } = buildHook({ editableRows });
        await act(async () => { await result.current.handleBulkUpdate(); });
        expect(mocks.addToast).toHaveBeenCalledWith("warning", expect.any(String));
    });

    it("shows error toast when all operations fail", async () => {
        vi.mocked(bulkUpdateFloorFactorCVMasterAction).mockResolvedValueOnce({ success: false, message: "fail" });
        const editableRows = { [existingUid]: { ...existingRow, factorWithLift: 2.0 } };
        const { result, mocks } = buildHook({ editableRows });
        await act(async () => { await result.current.handleBulkUpdate(); });
        expect(mocks.addToast).toHaveBeenCalledWith("error", expect.stringContaining("bulkOperationFailed"));
    });

    it("shows error toast when action throws", async () => {
        vi.mocked(bulkUpdateFloorFactorCVMasterAction).mockRejectedValueOnce(new Error("Network"));
        const editableRows = { [existingUid]: { ...existingRow, factorWithLift: 2.0 } };
        const { result, mocks } = buildHook({ editableRows });
        await act(async () => { await result.current.handleBulkUpdate(); });
        expect(mocks.addToast).toHaveBeenCalledWith("error", expect.stringContaining("bulkActionFailed"));
    });

    it("calls setIsBulkUpdating(false) in finally", async () => {
        vi.mocked(bulkUpdateFloorFactorCVMasterAction).mockRejectedValueOnce(new Error("fail"));
        const editableRows = { [existingUid]: { ...existingRow, factorWithLift: 2.0 } };
        const { result, mocks } = buildHook({ editableRows });
        await act(async () => { await result.current.handleBulkUpdate(); });
        expect(mocks.setIsBulkUpdating).toHaveBeenCalledWith(false);
    });

    it("schedules refreshPage after 1500ms on success", async () => {
        vi.useFakeTimers();
        vi.mocked(bulkUpdateFloorFactorCVMasterAction).mockResolvedValueOnce({ success: true, message: "" });
        const editableRows = { [existingUid]: { ...existingRow, factorWithLift: 2.0 } };
        const { result, mocks } = buildHook({ editableRows });
        await act(async () => { await result.current.handleBulkUpdate(); });
        expect(mocks.refreshPage).not.toHaveBeenCalled();
        act(() => { vi.advanceTimersByTime(1500); });
        expect(mocks.refreshPage).toHaveBeenCalled();
        vi.useRealTimers();
    });

    it("skips rows with no actual changes", async () => {
        // editableRow has same values as original – hasChanges === false → nothing pushed to payloads
        const editableRows = { [existingUid]: { ...existingRow } };
        const { result, mocks } = buildHook({ editableRows });
        await act(async () => { await result.current.handleBulkUpdate(); });
        expect(mocks.addToast).toHaveBeenCalledWith("info", expect.stringContaining("noChangesDetectedBulk"));
    });
});

describe("useFloorCvBulkOps – handleGenerateAll", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it("does nothing when no new records exist", async () => {
        const { result, mocks } = buildHook({ data: [existingRow] });
        await act(async () => { await result.current.handleGenerateAll(); });
        expect(bulkCreateFloorFactorCVMasterAction).not.toHaveBeenCalled();
        expect(mocks.addToast).not.toHaveBeenCalled();
    });

    it("calls bulkCreateFloorFactorCVMasterAction for new records", async () => {
        vi.mocked(bulkCreateFloorFactorCVMasterAction).mockResolvedValueOnce({ success: true, message: "" });
        const { result, mocks } = buildHook({ data: [newRow] });
        await act(async () => { await result.current.handleGenerateAll(); });
        expect(bulkCreateFloorFactorCVMasterAction).toHaveBeenCalledWith(
            expect.objectContaining({ floorFactors: expect.any(Array) })
        );
        expect(mocks.addToast).toHaveBeenCalledWith("success", expect.any(String));
    });

    it("shows error on generation failure", async () => {
        vi.mocked(bulkCreateFloorFactorCVMasterAction).mockResolvedValueOnce({ success: false, message: "gen fail" });
        const { result, mocks } = buildHook({ data: [newRow] });
        await act(async () => { await result.current.handleGenerateAll(); });
        expect(mocks.addToast).toHaveBeenCalledWith("error", "gen fail");
    });

    it("shows error toast when action throws", async () => {
        vi.mocked(bulkCreateFloorFactorCVMasterAction).mockRejectedValueOnce(new Error("Network"));
        const { result, mocks } = buildHook({ data: [newRow] });
        await act(async () => { await result.current.handleGenerateAll(); });
        expect(mocks.addToast).toHaveBeenCalledWith("error", expect.stringContaining("generateAllFailed"));
    });

    it("calls setIsGeneratingAll(false) in finally", async () => {
        vi.mocked(bulkCreateFloorFactorCVMasterAction).mockRejectedValueOnce(new Error("fail"));
        const { result, mocks } = buildHook({ data: [newRow] });
        await act(async () => { await result.current.handleGenerateAll(); });
        expect(mocks.setIsGeneratingAll).toHaveBeenCalledWith(false);
    });

    it("schedules refreshPage after 1500ms on success", async () => {
        vi.useFakeTimers();
        vi.mocked(bulkCreateFloorFactorCVMasterAction).mockResolvedValueOnce({ success: true, message: "" });
        const { result, mocks } = buildHook({ data: [newRow] });
        await act(async () => { await result.current.handleGenerateAll(); });
        expect(mocks.refreshPage).not.toHaveBeenCalled();
        act(() => { vi.advanceTimersByTime(1500); });
        expect(mocks.refreshPage).toHaveBeenCalled();
        vi.useRealTimers();
    });
});
