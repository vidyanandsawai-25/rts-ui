import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LockedScreen } from "@/types/lockunlock.types";
import { PropertySelectionCard } from "@/components/modules/property-tax/lockunlock/PropertySelectionCard";

const mockPush = vi.fn();
const mockGet = vi.fn();
const mockUpdateQueries = vi.fn();
const mockSearchParams = {
  get: mockGet,
};

vi.mock("@/hooks/useQueryTransition", () => ({
  useQueryTransition: () => ({
    isPending: false,
    updateQueries: mockUpdateQueries,
    searchParams: mockSearchParams,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => "/property-tax/lockunlock",
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    if (key === "screenSelectionCard.selectedCount") {
      return `${values?.count} selected`;
    }
    const translations: Record<string, string> = {
      "selectPropertyCard.title": "Select properties",
      "selectPropertyCard.showButton": "Show",
      "selectPropertyCard.clearButton": "Clear all",
      "screenSelectionCard.title": "Screen selection",
      "screenSelectionCard.noScreens": "No screens available to select.",
    };
    return translations[key] || key;
  },
}));

describe("PropertySelectionCard", () => {
  const mockScreens: LockedScreen[] = [
    { id: 1, screenCode: "S1", screenName: "Screen 1", screenNameLocal: "Screen 1 Local", displayOrder: 1 },
    { id: 2, screenCode: "S2", screenName: "Screen 2", screenNameLocal: "Screen 2 Local", displayOrder: 2 },
  ];

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
    toPropertyOptions: [
      { label: "Prop 1", value: "P1" },
      { label: "Prop 2", value: "P2" },
    ],
    handleShow: vi.fn(),
    handleClearAll: vi.fn(),
    isPending: false,
    isLoadingProperties: false,
    screens: mockScreens,
    selectedScreenIds: [1],
    setSelectedScreenIds: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReturnValue(null);
  });

  it("should render components inside PropertySelectionCard", () => {
    render(<PropertySelectionCard {...mockProps} />);

    expect(screen.getByText("Select properties")).toBeInTheDocument();
    expect(screen.getByText("Show")).toBeInTheDocument();
    expect(screen.getByText("Clear all")).toBeInTheDocument();
    expect(screen.getByText("Screen selection")).toBeInTheDocument();
    expect(screen.getByText("1 selected")).toBeInTheDocument();
  });

  it("should display empty message if no screens", () => {
    render(
      <PropertySelectionCard
        {...mockProps}
        screens={[]}
        selectedScreenIds={[]}
      />
    );
    
    expect(screen.getByText("No screens available to select.")).toBeInTheDocument();
  });

  it("should trigger handleShow when Show button is clicked", () => {
    render(<PropertySelectionCard {...mockProps} />);

    const showBtn = screen.getByRole("button", { name: /show/i });
    fireEvent.click(showBtn);
    expect(mockProps.handleShow).toHaveBeenCalled();
  });

  it("should trigger handleClearAll when Clear all button is clicked", () => {
    render(<PropertySelectionCard {...mockProps} />);

    const clearBtn = screen.getByRole("button", { name: /clear all/i });
    fireEvent.click(clearBtn);
    expect(mockProps.handleClearAll).toHaveBeenCalled();
  });
});
