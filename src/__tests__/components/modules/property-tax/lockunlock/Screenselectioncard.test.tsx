import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ScreenSelectionCard } from "@/components/modules/property-tax/lockunlock/Screenselectioncard";
import { LockedScreen } from "@/types/loackunlock.types";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: any) => {
    if (key === "screenSelectionCard.selectedCount") {
      return `${values?.count} selected`;
    }
    const translations: Record<string, string> = {
      "screenSelectionCard.title": "Screen selection",
      "screenSelectionCard.noScreens": "No screens available to select.",
    };
    return translations[key] || key;
  },
}));

describe("ScreenSelectionCard", () => {
  const mockScreens: LockedScreen[] = [
    { id: 1, screenCode: "S1", screenName: "Screen 1", screenNameLocal: "Screen 1 Local", displayOrder: 1 },
    { id: 2, screenCode: "S2", screenName: "Screen 2", screenNameLocal: "Screen 2 Local", displayOrder: 2 },
  ];

  it("should render screen selection card with screens", () => {
    const mockSetSelected = vi.fn();
    render(
      <ScreenSelectionCard
        screens={mockScreens}
        selectedScreenIds={[1]}
        setSelectedScreenIds={mockSetSelected}
      />
    );

    expect(screen.getByText("Screen selection")).toBeInTheDocument();
    expect(screen.getByText("1 selected")).toBeInTheDocument();
    expect(screen.getByLabelText("Screen 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Screen 2")).toBeInTheDocument();
  });

  it("should display empty message if no screens", () => {
    render(
      <ScreenSelectionCard
        screens={[]}
        selectedScreenIds={[]}
        setSelectedScreenIds={vi.fn()}
      />
    );

    expect(screen.getByText("No screens available to select.")).toBeInTheDocument();
  });

  it("should trigger setSelectedScreenIds when checkbox is toggled", () => {
    const mockSetSelected = vi.fn();
    render(
      <ScreenSelectionCard
        screens={mockScreens}
        selectedScreenIds={[1]}
        setSelectedScreenIds={mockSetSelected}
      />
    );

    const checkbox1 = screen.getByLabelText("Screen 1");
    const checkbox2 = screen.getByLabelText("Screen 2");

    // Unchecking Screen 1
    fireEvent.click(checkbox1);
    expect(mockSetSelected).toHaveBeenCalled();

    // Checking Screen 2
    fireEvent.click(checkbox2);
    expect(mockSetSelected).toHaveBeenCalled();
  });
});
