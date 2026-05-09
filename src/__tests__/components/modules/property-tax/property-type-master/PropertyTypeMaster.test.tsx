/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import { PropertyTypeMaster } from "@/components/modules/property-tax/property-type-master/PropertyTypeMaster";
import type { PropertyType } from "@/types/property-type.types";
import { toast } from "sonner";
import { deletePropertyTypeAction } from "@/app/[locale]/property-tax/propertytype/action";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { usePropertyTypeSearch } from "@/hooks/usePropertyTypeSearch";
import { usePropertyTypePagination } from "@/hooks/usePropertyTypePagination";
import * as mockRouter from "next/navigation";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock Actions
vi.mock("@/app/[locale]/property-tax/propertytype/action", () => ({
  deletePropertyTypeAction: vi.fn(),
}));

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock hooks
vi.mock("@/components/common/ConfirmProvider", () => ({
  useConfirm: vi.fn(),
}));
vi.mock("@/hooks/usePropertyTypeSearch", () => ({
  usePropertyTypeSearch: vi.fn(),
}));
vi.mock("@/hooks/usePropertyTypePagination", () => ({
  usePropertyTypePagination: vi.fn(),
}));

// Mock MasterTable (Avoid testing MasterTable's internals here)
vi.mock("@/components/common/MasterTable", () => ({
  MasterTable: ({ data, renderActions }: any) => (
    <div data-testid="master-table">
      {data.map((row: any) => (
        <div key={row.id} data-testid={`row-${row.id}`}>
          {row.propertyDescription}
          {renderActions && (
            <div data-testid={`actions-${row.id}`}>
              {renderActions(row)}
            </div>
          )}
        </div>
      ))}
    </div>
  ),
}));

// Mock TypeOfUseModal (to isolate test)
vi.mock("@/components/modules/property-tax/property-type-master/TypeOfUseModal", () => ({
  default: ({ open, onClose }: any) => (
    open ? <div data-testid="type-of-use-modal"><button onClick={onClose}>Close Modal</button></div> : null
  )
}));

describe("PropertyTypeMaster", () => {
  const mockConfirm = vi.fn();
  const mockRouterPush = vi.fn();
  const mockRouterRefresh = vi.fn();

  const mockData = [
    { id: 1, propertyDescription: "Desc 1", type: "R", propertyTypeGroup: "G1", propertyTypeCategoryId: 1, searchSequence: 1, isActive: true },
    { id: 2, propertyDescription: "Desc 2", type: "C", propertyTypeGroup: "G2", propertyTypeCategoryId: 2, searchSequence: 2, isActive: true },
  ] as PropertyType[];

  const defaultProps = {
    data: mockData,
    pageNumber: 1,
    pageSize: 10,
    totalCount: 2,
    totalPages: 1,
    categories: [],
    typeOfUseList: [],
    typeOfUseValidation: [],
  };

  const mockMessages = {
    propertyType: {
      propertyType: {
        list: {
          title: "Property Type Master",
          subtitle: "Manage Property Types",
          buttons: {
            add: "Add Property Type",
          },
          table: {
            propertyDescription: "Description",
            type: "Type",
            propertyTypeGroup: "Group",
            category: "Category",
            searchSequence: "Sequence",
            typeOfUseValidation: "Validations",
            status: "Status",
          },
          filters: {
            search: "Search Property Type...",
          },
        },
        delete: {
          confirmDescription: "Are you sure you want to delete this?",
        },
        success: {
          deleted: "Successfully deleted",
        },
        apiErrors: {
          inUse: "In use",
          validationError: "Validation error",
          notFound: "Not found",
        },
      },
    },
    common: {
      buttons: {
        add: "Add",
      },
      table: {
        actions: {
          edit: "Edit",
          delete: "Delete",
        },
        showing: "Showing",
        to: "to",
        of: "of",
        entries: "entries",
        rowsPerPage: "Rows per page",
        columns: {
          actions: "Actions",
        },
      },
      errors: {
        deleteError: "Delete error",
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(mockRouter.useRouter).mockReturnValue({
      push: mockRouterPush,
      refresh: mockRouterRefresh,
    } as any);

    vi.mocked(useConfirm).mockReturnValue({ confirm: mockConfirm } as any);
    
    vi.mocked(usePropertyTypeSearch).mockReturnValue({
      search: "",
      currentSearchTerm: "",
      handleSearchChange: vi.fn(),
    } as any);

    vi.mocked(usePropertyTypePagination).mockReturnValue({
      buildUrl: vi.fn().mockReturnValue("/mock-url"),
      changePage: vi.fn(),
      handlePageSizeChange: vi.fn(),
      paginationInfo: { start: 1, end: 2, total: 2 },
    } as any);
  });

  const setup = (props = {}) => {
    return render(
      <NextIntlClientProvider locale="en" messages={mockMessages}>
        <PropertyTypeMaster {...defaultProps} {...props} />
      </NextIntlClientProvider>
    );
  };

  it("renders page title and subtitle", () => {
    setup();
    expect(screen.getByText("Property Type Master")).toBeInTheDocument();
    expect(screen.getByText("Manage Property Types")).toBeInTheDocument();
  });

  it("navigates to add page on add button click", () => {
    setup();
    const addBtn = screen.getByText("Add Property Type");
    fireEvent.click(addBtn);
    expect(mockRouterPush).toHaveBeenCalledWith("/en/property-tax/propertytype/add");
  });

  it("renders MasterTable with data", () => {
    setup();
    expect(screen.getByTestId("master-table")).toBeInTheDocument();
    expect(screen.getByText("Desc 1")).toBeInTheDocument();
    expect(screen.getByText("Desc 2")).toBeInTheDocument();
  });

  it("navigates to edit page on edit button click", () => {
    setup();
    const actions1 = screen.getByTestId("actions-1");
    // Assume edit button is the first action (or we can query by aria-label)
    const editBtn = actions1.querySelector('[aria-label="Edit"]');
    fireEvent.click(editBtn!);
    
    expect(mockRouterPush).toHaveBeenCalledWith("/en/property-tax/propertytype/edit/1");
  });

  it("opens confirm dialog on delete button click and calls delete action on confirm", async () => {
    vi.mocked(deletePropertyTypeAction).mockResolvedValue({ success: true } as any);
    
    // Auto-confirm the dialog
    mockConfirm.mockImplementation((options) => options.onConfirm());

    setup();
    
    const actions1 = screen.getByTestId("actions-1");
    const deleteBtn = actions1.querySelector('[aria-label="Delete"]');
    fireEvent.click(deleteBtn!);

    expect(mockConfirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(deletePropertyTypeAction).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
      expect(mockRouterRefresh).toHaveBeenCalled();
    });
  });

  it("handles delete failure gracefully", async () => {
    vi.mocked(deletePropertyTypeAction).mockResolvedValue({ success: false, statusCode: 409 } as any);
    mockConfirm.mockImplementation((options) => options.onConfirm());

    setup();
    
    const actions1 = screen.getByTestId("actions-1");
    const deleteBtn = actions1.querySelector('[aria-label="Delete"]');
    fireEvent.click(deleteBtn!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
