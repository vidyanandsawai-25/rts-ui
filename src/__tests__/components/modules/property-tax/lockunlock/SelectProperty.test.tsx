import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SelectProperty } from "@/components/modules/property-tax/lockunlock/Selectproperty";

const translations: Record<string, string> = {
  "selectPropertyCard.title": "Select properties",
  "selectPropertyCard.showButton": "Show",
  "selectPropertyCard.clearButton": "Clear all",
};

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => translations[key] || key,
}));

describe("SelectProperty", () => {
  const mockProps = {
    formData: {
      wardId: "1",
      fromProperty: "P1",
      toProperty: "P2",
    },
    handleSelectChange: vi.fn(),
    wardOptions: [{ label: "Ward 1", value: "1" }],
    propertyOptions: [
      { label: "Prop 1", value: "P1" },
      { label: "Prop 2", value: "P2" },
    ],
    handleShow: vi.fn(),
    handleClearAll: vi.fn(),
    isPending: false,
  };

  it("should render SelectProperty card components", () => {
    render(<SelectProperty {...mockProps} />);

    expect(screen.getByText("Select properties")).toBeInTheDocument();
    expect(screen.getByText("Show")).toBeInTheDocument();
    expect(screen.getByText("Clear all")).toBeInTheDocument();
  });

  it("should call handleShow when Show button is clicked", () => {
    render(<SelectProperty {...mockProps} />);

    const showBtn = screen.getByRole("button", { name: /show/i });
    fireEvent.click(showBtn);
    expect(mockProps.handleShow).toHaveBeenCalled();
  });

  it("should call handleClearAll when Clear all button is clicked", () => {
    render(<SelectProperty {...mockProps} />);

    const clearBtn = screen.getByRole("button", { name: /clear all/i });
    fireEvent.click(clearBtn);
    expect(mockProps.handleClearAll).toHaveBeenCalled();
  });
});
