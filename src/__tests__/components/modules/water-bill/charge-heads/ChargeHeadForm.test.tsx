import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChargeHeadForm } from "@/components/modules/water-bill/charge-heads/ChargeHeadForm";
import type { ChargeHead } from "@/types/water-bill/chargeHeads.types";

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
  useLocale: () => "en",
}));

describe("ChargeHeadForm Component Tests", () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const sampleEditingData: ChargeHead = {
    id: 1,
    chargeHeadCode: "WTR_CHG",
    chargeHeadName: "Water Charge",
    chargeType: "Charge",
    sequenceNo: 1,
    isRefundable: false,
    isRegularPay: false,
    isActive: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render Add mode title when open and initialData is null", () => {
    render(<ChargeHeadForm open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    expect(screen.getByText("chargeHeads.addTitle")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "common.buttons.cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "chargeHeads.saveRecord" })).toBeInTheDocument();
  });

  it("should render Edit mode title and prefill values when initialData is provided", () => {
    render(
      <ChargeHeadForm
        open={true}
        initialData={sampleEditingData}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText("chargeHeads.editTitle")).toBeInTheDocument();
    expect(screen.getByDisplayValue("WTR_CHG")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Water Charge")).toBeInTheDocument();
  });

  it("should convert Code input value to uppercase on change", () => {
    render(<ChargeHeadForm open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const codeInput = screen.getByPlaceholderText("chargeHeads.form.code.placeholder");
    fireEvent.change(codeInput, { target: { value: "wtr_fee" } });

    expect(codeInput).toHaveValue("WTR_FEE");
  });

  it("should support selecting Charge Type options (Tax, Penalty, Charge, Fee, Deposit)", () => {
    render(<ChargeHeadForm open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();

    fireEvent.click(select);
    const penaltyOption = screen.getByText("chargeHeads.form.chargeType.penalty");
    fireEvent.click(penaltyOption);
  });

  it("should toggle boolean fields (IsRefundable, IsRegularPay, IsActive)", () => {
    render(<ChargeHeadForm open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const toggles = screen.getAllByRole("switch");
    expect(toggles.length).toBe(3);

    fireEvent.click(toggles[0]);
    expect(toggles[0]).toHaveAttribute("aria-checked", "true");

    fireEvent.click(toggles[1]);
    expect(toggles[1]).toHaveAttribute("aria-checked", "true");
  });

  it("should not submit form when required Code or Name field is empty", () => {
    render(<ChargeHeadForm open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const saveBtn = screen.getByRole("button", { name: "chargeHeads.saveRecord" });
    fireEvent.click(saveBtn);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should submit form data correctly on valid inputs", () => {
    render(<ChargeHeadForm open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByPlaceholderText("chargeHeads.form.code.placeholder"), {
      target: { value: "WTR_NEW" },
    });
    fireEvent.change(screen.getByPlaceholderText("chargeHeads.form.name.placeholder"), {
      target: { value: "New Water Connection Fee" },
    });

    const saveBtn = screen.getByRole("button", { name: "chargeHeads.saveRecord" });
    fireEvent.click(saveBtn);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        chargeHeadCode: "WTR_NEW",
        chargeHeadName: "New Water Connection Fee",
      })
    );
  });

  it("should call onClose when Cancel button is clicked", () => {
    render(<ChargeHeadForm open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const cancelBtn = screen.getByRole("button", { name: "common.buttons.cancel" });
    fireEvent.click(cancelBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should disable Cancel button during form submission", () => {
    render(
      <ChargeHeadForm
        open={true}
        isSubmitting={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const cancelBtn = screen.getByRole("button", { name: "common.buttons.cancel" });
    expect(cancelBtn).toBeDisabled();
  });
});
