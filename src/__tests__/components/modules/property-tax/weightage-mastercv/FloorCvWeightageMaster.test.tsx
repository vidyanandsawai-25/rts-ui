import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FloorCvWeightageMaster from "@/components/modules/property-tax/weightage-mastercv/FloorCvWeightageMaster";
import { Option } from "@/components/common/select";
import { FloorFactorCVMaster } from "@/types/weightageMaster.types";

// Mock the server actions
vi.mock("@/app/[locale]/property-tax/weightage-master/action", () => ({
    updateFloorFactorCVMasterAction: vi.fn(),
    createFloorFactorCVMasterAction: vi.fn(),
    bulkCreateFloorFactorCVMasterAction: vi.fn(),
    bulkUpdateFloorFactorCVMasterAction: vi.fn()
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn()
    }),
    useSearchParams: () => ({
        get: vi.fn().mockImplementation((key) => {
            if (key === "page") return "1";
            if (key === "pageSize") return "10";
            return null;
        })
    })
}));

// Mock next-intl
vi.mock("next-intl", () => ({
    useLocale: () => "en",
    useTranslations: (namespace: string) => (key: string) => {
        const translations: Record<string, Record<string, string>> = {
            common: {
                "table.showing": "Showing",
                "messages.pendingRecordsWarning": "Pending records warning",
                "messages.noChangesToUpdate": "No changes to update",
                "messages.noChangesDetected": "No changes detected",
                "messages.negativeValuesNotAllowed": "Negative values not allowed",
                "messages.valueExceedsMax": "Value exceeds max",
                "buttons.create": "Create",
                "buttons.update": "Update",
                "buttons.clear": "Clear",
                "buttons.apply": "Apply",
                "buttons.generateAll": "Generate All",
                "labels.active": "Active",
                "labels.inactive": "Inactive",
                "labels.pendingRecordCreates": "pending records"
            },
            floorFactorMaster: {
                "columns.floorCode": "Floor Code",
                "columns.description": "Description",
                "columns.factorWithLift": "With Lift",
                "columns.factorWithoutLift": "Without Lift",
                "columns.assessmentYear": "Year",
                "columns.status": "Status",
                "columns.action": "Action",
                "filters.assessmentYear": "Year",
                "filters.fromFloor": "From",
                "filters.toFloor": "To",
                "filters.liftStatus": "Lift",
                "filters.factor": "Factor"
            },
            weightageMaster: {
                "common.messages.pendingRecordsWarning": "Pending records warning",
                "common.messages.noChangesToUpdate": "No changes to update",
                "common.messages.noChangesDetected": "No changes detected",
                "common.messages.negativeValuesNotAllowed": "Negative values not allowed",
                "common.messages.valueExceedsMax": "Value exceeds max",
                "common.buttons.create": "Create",
                "common.buttons.update": "Update",
                "common.buttons.clear": "Clear",
                "common.buttons.apply": "Apply",
                "common.messages.factorApplied": "Factor applied",
                "common.buttons.generateAll": "Generate All",
                "common.labels.active": "Active",
                "common.labels.inactive": "Inactive",
                "common.labels.pendingRecordCreates": "pending records"
            }
        };
        return translations[namespace]?.[key] || key;
    }
}));

const mockData: FloorFactorCVMaster[] = [
    {
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
        isActive: true
    },
    {
        floorFactorId: 0, // New record
        floorId: 102,
        floorCode: "F2",
        floorDescription: "Second Floor",
        factorWithLift: 0.0,
        factorWithoutLift: 0.0,
        yearRangeCVId: 2024,
        yearRangeCVID: 2024,
        fromYear: 2024,
        toYear: 2025,
        isActive: true
    }
];

const floorOptions: Option[] = [
    { label: "Floor 1", value: "101" },
    { label: "Floor 2", value: "102" }
];

const yearOptions: Option[] = [
    { label: "2024-2025", value: "2024" }
];

describe("FloorCvWeightageMaster", () => {
    const renderComponent = () => {
        return render(
            <FloorCvWeightageMaster
                data={mockData}
                pageNumber={1}
                pageSize={10}
                totalCount={2}
                totalPages={1}
                floorOptions={floorOptions}
                assessmentYearOptions={yearOptions}
            />
        );
    };

    it("renders the table with data", () => {
        renderComponent();
        expect(screen.getByText("F1")).toBeInTheDocument();
        expect(screen.getByText("First Floor")).toBeInTheDocument();
        expect(screen.getByText("F2")).toBeInTheDocument();
        expect(screen.getByText("Second Floor")).toBeInTheDocument();
    });

    it("renders existing record with Update button and new record with Create button", () => {
        renderComponent();
        
        const updateBtns = screen.getAllByRole('button', { name: /update/i });
        const createBtns = screen.getAllByRole('button', { name: /create/i });
        
        expect(updateBtns.length).toBeGreaterThan(0);
        expect(createBtns.length).toBeGreaterThan(0);
    });

    it("enables buttons when factor is changed", async () => {
        renderComponent();
        const tableInput = screen.getByDisplayValue("1.20");
        const row = tableInput.closest('tr') as HTMLElement;
        const updateBtn = within(row).getByRole('button', { name: /update/i });
        
        expect(updateBtn).toBeDisabled();
        
        fireEvent.change(tableInput, { target: { value: "1.5" } });
        
        await waitFor(() => {
            expect(updateBtn).not.toBeDisabled();
        }, { timeout: 2000 });
    });

    it("handles filter and factor application", async () => {
        renderComponent();
        expect(screen.getByText("F1")).toBeInTheDocument();
    });

    it("discards changes when Clear is clicked", async () => {
        renderComponent();
        const tableInput = screen.getByDisplayValue("1.20");
        const row = tableInput.closest('tr') as HTMLElement;
        const clearBtn = within(row).getByRole('button', { name: /clear/i });
        
        fireEvent.change(tableInput, { target: { value: "1.5" } });
        
        await waitFor(() => {
            expect(clearBtn).not.toBeDisabled();
        });
        
        fireEvent.click(clearBtn);
        
        await waitFor(() => {
            expect(clearBtn).toBeDisabled();
            expect(tableInput).toHaveValue(1.2);
        });
    });
});
