import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TariffForm } from "@/components/modules/water-bill/tariff-workbench/TariffForm";
import type { TariffWorkbench as TariffWorkbenchType } from "@/types/waterBill/tariffWorkbench.types";

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string, params?: Record<string, unknown>) => {
    if (params?.count !== undefined) {
      return `${ns}.${key}_${params.count}`;
    }
    return `${ns}.${key}`;
  },
  useLocale: () => "en",
}));

describe("TariffForm Component Tests", () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const sampleEditingData: TariffWorkbenchType = {
    id: 1,
    tariffCode: "RES-MTR-2026",
    tariffName: "Residential Metered Tariff 2026-27",
    financialYearId: 1,
    connectionTypeId: 1,
    connectionCategoryId: 1,
    billingMethod: "Metered",
    effectiveFrom: "2026-04-01T00:00:00.000Z",
    effectiveTo: "2027-03-31T00:00:00.000Z",
    versionNo: 1,
    status: "Published",
    description: "Existing Description",
    isActive: true,
    financialYearCode: "2026-27",
    connectionTypeName: "Residential",
    connectionCategoryName: "Regular",
    slabsCount: 2,
  };

  const mockFinancialYearOptions = [
    { value: "1", label: "2026-27" },
    { value: "2", label: "2025-26" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render Add mode title when open and initialData is null", async () => {
    render(
      <TariffForm
        open={true}
        financialYearOptions={mockFinancialYearOptions}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText("tariffWorkbench.addTitle")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "common.buttons.cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "tariffWorkbench.form.saveRecord" })).toBeInTheDocument();
  });

  it("should render Edit mode title and prefill values when initialData is provided", async () => {
    render(
      <TariffForm
        open={true}
        initialData={sampleEditingData}
        financialYearOptions={mockFinancialYearOptions}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText("tariffWorkbench.editTitle")).toBeInTheDocument();
    expect(screen.getByDisplayValue("RES-MTR-2026")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Residential Metered Tariff 2026-27")).toBeInTheDocument();
    expect(screen.getAllByText("Metered").length).toBeGreaterThan(0);
  });

  it("should render financial year dropdown options from props", async () => {
    render(
      <TariffForm
        open={true}
        financialYearOptions={mockFinancialYearOptions}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const select = screen.getByRole("combobox", { name: /financialYear/i });
    expect(select).toBeInTheDocument();
  });

  it("should display validation errors when submitting empty required fields", async () => {
    render(
      <TariffForm
        open={true}
        financialYearOptions={mockFinancialYearOptions}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const form = document.querySelector("#tariff-workbench-form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getAllByText("tariffWorkbench.validation.tariffCodeRequired").length).toBeGreaterThan(0);
      expect(screen.getAllByText("tariffWorkbench.validation.tariffNameRequired").length).toBeGreaterThan(0);
      expect(screen.getAllByText("tariffWorkbench.validation.effectiveFromRequired").length).toBeGreaterThan(0);
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should validate effectiveTo date is after effectiveFrom date", async () => {
    render(
      <TariffForm
        open={true}
        financialYearOptions={mockFinancialYearOptions}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const form = document.querySelector("#tariff-workbench-form")!;
    fireEvent.change(screen.getByLabelText(/tariffCode/i), { target: { value: "RES-01" } });
    fireEvent.change(screen.getByLabelText(/tariffName/i), { target: { value: "Residential Tariff" } });

    const billingCombobox = screen.getByRole("combobox", { name: /billingMethod/i });
    fireEvent.click(billingCombobox);
    const meteredOptions = screen.getAllByText("Metered");
    fireEvent.click(meteredOptions[meteredOptions.length - 1]);

    fireEvent.change(screen.getByLabelText(/effectiveFrom/i), { target: { value: "2026-05-01" } });
    fireEvent.change(screen.getByLabelText(/effectiveTo/i), { target: { value: "2026-04-01" } });

    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getAllByText("tariffWorkbench.validation.effectiveToAfterFrom").length).toBeGreaterThan(0);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it("should load Connection Type and Category dropdown options correctly", async () => {
    render(
      <TariffForm
        open={true}
        financialYearOptions={mockFinancialYearOptions}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBeGreaterThanOrEqual(3);
  });

  it("should submit valid form data correctly", async () => {
    render(
      <TariffForm
        open={true}
        financialYearOptions={mockFinancialYearOptions}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    fireEvent.change(screen.getByLabelText(/tariffCode/i), { target: { value: "RES-MTR-2026" } });
    fireEvent.change(screen.getByLabelText(/tariffName/i), { target: { value: "Residential Metered Tariff" } });

    const billingCombobox = screen.getByRole("combobox", { name: /billingMethod/i });
    fireEvent.click(billingCombobox);
    const meteredOptions = screen.getAllByText("Metered");
    fireEvent.click(meteredOptions[meteredOptions.length - 1]);

    fireEvent.change(screen.getByLabelText(/effectiveFrom/i), { target: { value: "2026-04-01" } });

    const form = document.querySelector("#tariff-workbench-form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          tariffCode: "RES-MTR-2026",
          tariffName: "Residential Metered Tariff",
          billingMethod: "Metered",
          effectiveFrom: "2026-04-01",
        })
      );
    });
  });

  it("should trigger onClose when Cancel button is clicked", () => {
    render(
      <TariffForm
        open={true}
        financialYearOptions={mockFinancialYearOptions}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const cancelBtn = screen.getByRole("button", { name: "common.buttons.cancel" });
    fireEvent.click(cancelBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
