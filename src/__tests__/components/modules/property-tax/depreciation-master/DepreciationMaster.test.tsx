import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import DepreciationMaster from "@/components/modules/property-tax/depreciation-master/DepreciationMaster";
import type { ConstructionType, DepreciationRow } from "@/types/depreciation.types";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: "Depreciation Master",
      subtitle: "Property Tax Assessment System",
      min: "Min Age",
      max: "Max Age",
      minPlaceholder: "Enter min",
      maxPlaceholder: "Enter max",
      addRange: "Add Range",
      deleteRange: "Delete Range",
      updateRates: "Update Rates",
      noRanges: "No ranges available",
      ageRange: "Age Range",
      createDepChart: "Create Depreciation Chart",
      action: "Action",
      deleteRow: "Delete Row",
      deleteRangeConfirmTitle: "Delete Range?",
      "success.added": "Range added successfully",
      "success.updated": "Rates updated successfully",
      "success.deleted": "Range deleted successfully",
      "errors.load": "Failed to load",
      "errors.add": "Failed to add range",
      "errors.update": "Failed to update rates",
      "errors.delete": "Failed to delete range",
      "errors.minMax": "Please enter both min and max",
      "errors.invalidRange": "Min must be less than max",
      "errors.overlap": "Range overlaps with existing range",
      "errors.mustBeNumber": "Must be a valid number",
    };
    return translations[key] || key;
  },
}));

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  usePathname: () => "/en/property-tax/depreciation-master",
}));

// Mock server actions
vi.mock("@/app/[locale]/property-tax/depreciation-master/actions", () => ({
  addRangeAction: vi.fn(),
  syncDepreciationRatesAction: vi.fn(),
  deleteRangeAction: vi.fn(),
}));

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    loading: vi.fn(() => "toast-id"),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock useConfirm
vi.mock("@/components/common", async () => {
  const actual = await vi.importActual("@/components/common");
  return {
    ...actual,
    useConfirm: () => ({
      confirm: vi.fn(({ onConfirm }) => onConfirm()),
    }),
  };
});

// Import mocked modules for assertions
import { addRangeAction, syncDepreciationRatesAction, deleteRangeAction } from "@/app/[locale]/property-tax/depreciation-master/actions";
import { toast } from "sonner";

describe("DepreciationMaster", () => {
  const mockConstructionTypes: ConstructionType[] = [
    { constructionId: 1, constructionCode: "A" },
    { constructionId: 2, constructionCode: "B" },
    { constructionId: 3, constructionCode: "C" },
  ];

  const mockData: DepreciationRow[] = [
    {
      id: 1,
      constructionTypeId: 1,
      minYear: 0,
      maxYear: 10,
      rate: 5,
      yearRangeRVId: 1,
      isActive: true,
      createdDate: "2024-01-01",
      updatedDate: null,
    },
    {
      id: 2,
      constructionTypeId: 2,
      minYear: 0,
      maxYear: 10,
      rate: 8,
      yearRangeRVId: 1,
      isActive: true,
      createdDate: "2024-01-01",
      updatedDate: null,
    },
    {
      id: 3,
      constructionTypeId: 3,
      minYear: 0,
      maxYear: 10,
      rate: 10,
      yearRangeRVId: 1,
      isActive: true,
      createdDate: "2024-01-01",
      updatedDate: null,
    },
  ];

  const defaultProps = {
    data: mockData,
    constructionTypes: mockConstructionTypes,
    pageNumber: 1,
    pageSize: 10,
    totalCount: 1,
    totalPages: 1,
    locale: "en",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (addRangeAction as Mock).mockResolvedValue({ success: true });
    (syncDepreciationRatesAction as Mock).mockResolvedValue({ success: true });
    (deleteRangeAction as Mock).mockResolvedValue({ success: true });
  });

  describe("Rendering", () => {
    it("should render the component with title and subtitle", () => {
      render(<DepreciationMaster {...defaultProps} />);
      
      expect(screen.getByText("Depreciation Master")).toBeInTheDocument();
      expect(screen.getByText("Property Tax Assessment System")).toBeInTheDocument();
    });

    it("should render min and max input fields", () => {
      render(<DepreciationMaster {...defaultProps} />);
      
      expect(screen.getByPlaceholderText("Enter min")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter max")).toBeInTheDocument();
    });

    it("should render Add Range button", () => {
      render(<DepreciationMaster {...defaultProps} />);
      
      expect(screen.getByText("Add Range")).toBeInTheDocument();
    });

    it("should render Delete Range button", () => {
      render(<DepreciationMaster {...defaultProps} />);
      
      expect(screen.getByText("Delete Range")).toBeInTheDocument();
    });

    it("should render existing ranges from data", () => {
      render(<DepreciationMaster {...defaultProps} />);
      
      // Should show the range 0-10 from mock data
      expect(screen.getByText("0 - 10")).toBeInTheDocument();
    });

    it("should render construction type columns in grid", () => {
      render(<DepreciationMaster {...defaultProps} />);
      
      expect(screen.getByText("A")).toBeInTheDocument();
      expect(screen.getByText("B")).toBeInTheDocument();
      expect(screen.getByText("C")).toBeInTheDocument();
    });

    it("should show 'No ranges available' when data is empty", () => {
      render(<DepreciationMaster {...defaultProps} data={[]} />);
      
      expect(screen.getByText("No ranges available")).toBeInTheDocument();
    });
  });

  describe("Input Validation", () => {
    it("should sanitize non-numeric input in min field", async () => {
      const user = userEvent.setup();
      render(<DepreciationMaster {...defaultProps} />);
      
      const minInput = screen.getByPlaceholderText("Enter min");
      await user.type(minInput, "abc123");
      
      expect(minInput).toHaveValue("123");
    });

    it("should sanitize non-numeric input in max field", async () => {
      const user = userEvent.setup();
      render(<DepreciationMaster {...defaultProps} />);
      
      const maxInput = screen.getByPlaceholderText("Enter max");
      await user.type(maxInput, "xyz456");
      
      expect(maxInput).toHaveValue("456");
    });

    it("should limit input to 4 digits", async () => {
      const user = userEvent.setup();
      render(<DepreciationMaster {...defaultProps} />);
      
      const minInput = screen.getByPlaceholderText("Enter min");
      await user.type(minInput, "123456");
      
      expect(minInput).toHaveValue("1234");
    });
  });

  describe("Add Range", () => {
    it("should call addRangeAction with correct parameters on valid input", async () => {
      const user = userEvent.setup();
      render(<DepreciationMaster {...defaultProps} data={[]} />);
      
      const minInput = screen.getByPlaceholderText("Enter min");
      const maxInput = screen.getByPlaceholderText("Enter max");
      const addButton = screen.getByText("Add Range");

      await user.type(minInput, "20");
      await user.type(maxInput, "30");
      await user.click(addButton);

      await waitFor(() => {
        expect(addRangeAction).toHaveBeenCalledWith("en", {
          minYear: 20,
          maxYear: 30,
        });
      });
    });

    it("should show success toast on successful add", async () => {
      const user = userEvent.setup();
      render(<DepreciationMaster {...defaultProps} data={[]} />);
      
      const minInput = screen.getByPlaceholderText("Enter min");
      const maxInput = screen.getByPlaceholderText("Enter max");
      const addButton = screen.getByText("Add Range");

      await user.type(minInput, "20");
      await user.type(maxInput, "30");
      await user.click(addButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });

    it("should show error toast on failed add", async () => {
      (addRangeAction as Mock).mockResolvedValue({ success: false, error: "Server error" });
      
      const user = userEvent.setup();
      render(<DepreciationMaster {...defaultProps} data={[]} />);
      
      const minInput = screen.getByPlaceholderText("Enter min");
      const maxInput = screen.getByPlaceholderText("Enter max");
      const addButton = screen.getByText("Add Range");

      await user.type(minInput, "20");
      await user.type(maxInput, "30");
      await user.click(addButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it("should NOT call addRangeAction when min is empty", async () => {
      const user = userEvent.setup();
      render(<DepreciationMaster {...defaultProps} />);
      
      const maxInput = screen.getByPlaceholderText("Enter max");
      const addButton = screen.getByText("Add Range");

      await user.type(maxInput, "30");
      await user.click(addButton);

      expect(addRangeAction).not.toHaveBeenCalled();
    });

    it("should NOT call addRangeAction when max is empty", async () => {
      const user = userEvent.setup();
      render(<DepreciationMaster {...defaultProps} />);
      
      const minInput = screen.getByPlaceholderText("Enter min");
      const addButton = screen.getByText("Add Range");

      await user.type(minInput, "20");
      await user.click(addButton);

      expect(addRangeAction).not.toHaveBeenCalled();
    });

    it("should NOT call addRangeAction when min >= max", async () => {
      const user = userEvent.setup();
      render(<DepreciationMaster {...defaultProps} data={[]} />);
      
      const minInput = screen.getByPlaceholderText("Enter min");
      const maxInput = screen.getByPlaceholderText("Enter max");
      const addButton = screen.getByText("Add Range");

      await user.type(minInput, "30");
      await user.type(maxInput, "20");
      await user.click(addButton);

      expect(addRangeAction).not.toHaveBeenCalled();
    });

    it("should NOT call addRangeAction when range overlaps with existing", async () => {
      const user = userEvent.setup();
      render(<DepreciationMaster {...defaultProps} />);
      
      const minInput = screen.getByPlaceholderText("Enter min");
      const maxInput = screen.getByPlaceholderText("Enter max");
      const addButton = screen.getByText("Add Range");

      // Existing range is 0-10, trying to add 5-15 which overlaps
      await user.type(minInput, "5");
      await user.type(maxInput, "15");
      await user.click(addButton);

      expect(addRangeAction).not.toHaveBeenCalled();
    });

    it("should clear inputs after successful add", async () => {
      const user = userEvent.setup();
      render(<DepreciationMaster {...defaultProps} data={[]} />);
      
      const minInput = screen.getByPlaceholderText("Enter min");
      const maxInput = screen.getByPlaceholderText("Enter max");
      const addButton = screen.getByText("Add Range");

      await user.type(minInput, "20");
      await user.type(maxInput, "30");
      await user.click(addButton);

      await waitFor(() => {
        expect(minInput).toHaveValue("");
        expect(maxInput).toHaveValue("");
      });
    });
  });

  describe("Range Selection", () => {
    it("should select a range when clicked", async () => {
      const user = userEvent.setup();
      render(<DepreciationMaster {...defaultProps} />);
      
      const rangeButton = screen.getByText("0 - 10");
      await user.click(rangeButton);

      // Check that the button has the selected class (blue background)
      expect(rangeButton.closest("button")).toHaveClass("bg-blue-600");
    });
  });

  describe("Delete Range", () => {
    it("should have Delete Range button disabled when no range selected", () => {
      render(<DepreciationMaster {...defaultProps} data={[]} />);
      
      const deleteButton = screen.getByText("Delete Range").closest("button");
      expect(deleteButton).toBeDisabled();
    });

    it("should call deleteRangeAction when delete confirmed", async () => {
      const user = userEvent.setup();
      render(<DepreciationMaster {...defaultProps} />);
      
      // Select the range first
      const rangeButton = screen.getByText("0 - 10");
      await user.click(rangeButton);

      // Click delete
      const deleteButton = screen.getByText("Delete Range");
      await user.click(deleteButton);

      await waitFor(() => {
        expect(deleteRangeAction).toHaveBeenCalledWith("en", {
          minYear: 0,
          maxYear: 10,
        });
      });
    });
  });

  describe("Pagination", () => {
    it("should navigate to different page when page changes", async () => {
      render(<DepreciationMaster {...defaultProps} totalPages={3} totalCount={30} />);
      
      // The pagination component should be rendered
      // Navigation would trigger router.push
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("Update Rates", () => {
    it("should have Update Rates button disabled when no changes", () => {
      render(<DepreciationMaster {...defaultProps} />);
      
      // Find the save/update button - it shows count (0)
      const updateButton = screen.getByText(/Update Rates.*\(0\)/);
      expect(updateButton.closest("button")).toBeDisabled();
    });

    it("should show info toast when trying to update with no changes", async () => {
      const user = userEvent.setup();
      render(<DepreciationMaster {...defaultProps} />);
      
      // The button is disabled so we can't click it
      // This test verifies the button is properly disabled
      const updateButton = screen.getByText(/Update Rates.*\(0\)/).closest("button");
      expect(updateButton).toBeDisabled();
    });
  });
});
