import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LockedScreen } from "@/types/lockunlock.types";
import { ScreenSelectionCard } from "@/components/modules/property-tax/lockunlock/ScreenSelectionCard";

const mockPush = vi.fn();
const mockGet = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: mockGet,
    toString: vi.fn(() => ""),
  }),
  usePathname: () => "/property-tax/lockunlock",
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
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

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReturnValue(null);
  });

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

  it("should filter screens based on url screenSearch parameter", () => {
    mockGet.mockImplementation((key) => {
      if (key === "screenSearch") return "Screen 1";
      return null;
    });

    const mockSetSelected = vi.fn();
    render(
      <ScreenSelectionCard
        screens={mockScreens}
        selectedScreenIds={[1]}
        setSelectedScreenIds={mockSetSelected}
      />
    );

    expect(screen.getByLabelText("Screen 1")).toBeInTheDocument();
    expect(screen.queryByLabelText("Screen 2")).not.toBeInTheDocument();
  });

  it("should filter screens based on url screenModule parameter", () => {
    mockGet.mockImplementation((key) => {
      if (key === "screenModule") return "SYSTEM";
      return null;
    });

    const mockSetSelected = vi.fn();
    render(
      <ScreenSelectionCard
        screens={[
          { id: 1, screenCode: "S1", screenName: "Screen 1", screenNameLocal: "Screen 1 Local", displayOrder: 1 },
          { id: 2, screenCode: "PT_VIEW", screenName: "Screen 2", screenNameLocal: "Screen 2 Local", displayOrder: 2 },
        ]}
        selectedScreenIds={[]}
        setSelectedScreenIds={mockSetSelected}
      />
    );

    expect(screen.getByLabelText("Screen 1")).toBeInTheDocument(); // Code S1 matches SYSTEM
    expect(screen.queryByLabelText("Screen 2")).not.toBeInTheDocument(); // Code PT_VIEW does not match SYSTEM
  });

  it("should trigger URL update when search query is entered", async () => {
    vi.useFakeTimers();
    render(
      <ScreenSelectionCard
        screens={mockScreens}
        selectedScreenIds={[]}
        setSelectedScreenIds={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText("screenSelectionCard.searchPlaceholder");
    fireEvent.change(searchInput, { target: { value: "New Search" } });

    // Fast-forward debounce timer
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockPush).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
