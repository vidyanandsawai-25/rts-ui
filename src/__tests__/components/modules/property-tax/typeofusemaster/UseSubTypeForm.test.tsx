import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import UseSubTypeForm from "@/components/modules/property-tax/typeofusemaster/UseSubTypeForm";
import type { UseType, UseSubType } from "@/types/typeOfUse.types";
import { toast } from "sonner";

// Mock next/navigation
const mockRouterPush = vi.fn();
const mockRouterBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    back: mockRouterBack,
  }),
  useSearchParams: () => ({
    get: vi.fn((key) => (key === "typeId" ? "1" : null)),
  }),
  usePathname: () => "/property-tax/typeofusemaster/subtype/add",
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the actions
vi.mock("@/app/[locale]/property-tax/typeofusemaster/actions", () => ({
  createSubType: vi.fn(),
  updateSubType: vi.fn(),
}));

import { createSubType, updateSubType } from "@/app/[locale]/property-tax/typeofusemaster/actions";
const mockCreateSubType = vi.mocked(createSubType);
const mockUpdateSubType = vi.mocked(updateSubType);

const mockMessages = {
  typeofusemaster: {
    group: {
      mandatoryNote: "Fields marked with * are mandatory",
    },
    subtype: {
      add: "Add Sub-Type of Use",
      edit: "Edit Sub-Type",
      addSubtitle: "Create a new Sub-Type",
      forType: "For Type: {type}",
      mandatoryNote: "Fields marked with * are mandatory",
      title: "Sub-Types of Use",
      fields: {
        subTypeNameLabel: "Sub-Type Name",
        searchSequenceLabel: "Search Sequence",
        status: "Status",
      },
      placeholders: {
        subTypeNameLabel: "Enter sub-type name",
      },
    },
    messages: {
      subTypeCreated: "Sub-Type Created",
      subTypeUpdated: "Sub-Type Updated",
      duplicateSubTypeName: "Duplicate Sub-Type Name is not allowed.",
      descriptionRequired: "Description is required.",
      subTypeNameRequired: "Sub-Type Name is required.",
      saveFailed: "Failed to save. Please try again.",
      allowedChars: "can contain letters (any language), numbers, spaces and (. - ,).",
      sequenceNonNegative: "must be 0 or greater.",
      maxThreeDigits: "must be maximum 3 digits (0-999).",
      maxLength: "must be maximum {count} characters.",
      typeNotFound: "Type not found",
      subTypeNameLabel: "Sub-Type Name",
      searchSequenceLabel: "Search Sequence",
      typeMissing: "Type is missing.",
      createError: "Failed to create record",
      updateError: "Failed to update record",
      cannotBeAllZeros: "cannot contain only zeros.",
    },
    status: {
      active: "Active",
      inactive: "Inactive",
      isCurrently: "is currently",
    },
    buttons: {
      save: "Save",
      cancel: "Cancel",
      edit: "Update",
    },
  },
  common: {
    buttons: {
      cancel: "Cancel",
      save: "Save",
    },
    actions: {
      loading: "Loading...",
    },
  },
};

const typeInfo: UseType = {
  typeOfUseId: 1,
  typeOfUseCode: "RES01",
  description: "Residential Building",
  type: "R",
  typeOfUseGroupId: 1,
  searchSequence: 1,
  isActive: true,
  status: "Active",
};

const allSubTypes: UseSubType[] = [
  {
    subTypeOfUseId: 1,
    description: "Ground Floor",
    typeOfUseId: 1,
    searchSequence: 1,
    isActive: true,
    status: "Active",
  },
  {
    subTypeOfUseId: 2,
    description: "First Floor",
    typeOfUseId: 1,
    searchSequence: 2,
    isActive: true,
    status: "Active",
  },
];

const renderWithIntl = (component: React.ReactElement) => {
  return render(
    <NextIntlClientProvider locale="en" messages={mockMessages}>
      {component}
    </NextIntlClientProvider>
  );
};

describe("UseSubTypeForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Add Mode", () => {
    it("should render form in add mode", () => {
      renderWithIntl(
        <UseSubTypeForm id={null} typeInfo={typeInfo} allSubTypes={allSubTypes} />
      );

      expect(screen.getByText("Add Sub-Type of Use")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Sub-Type Name")).toBeInTheDocument();
      expect(screen.getByText(/For Type:/)).toBeInTheDocument();
    });

    it("should render add mode without type details when type info is missing", () => {
      renderWithIntl(
        <UseSubTypeForm id={null} typeInfo={null} allSubTypes={[]} />
      );

      expect(screen.getByText("Add Sub-Type of Use")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(screen.queryByText(/For Type:/)).not.toBeInTheDocument();
    });

    it("should validate required fields", async () => {
      const { container } = renderWithIntl(
        <UseSubTypeForm id={null} typeInfo={typeInfo} allSubTypes={allSubTypes} />
      );

      const form = container.querySelector("#use-subtype-form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText(/Sub-Type Name is required/i)).toBeInTheDocument();
        expect(mockCreateSubType).not.toHaveBeenCalled();
      });
    });

    it("should validate description format", async () => {
      const { container } = renderWithIntl(
        <UseSubTypeForm id={null} typeInfo={typeInfo} allSubTypes={allSubTypes} />
      );

      const descInput = screen.getByPlaceholderText("Sub-Type Name");
      // Use an input that passes sanitization (allows spaces) but fails regex (no double spaces)
      fireEvent.change(descInput, { target: { value: "Test  Description" } });
      
      const form = container.querySelector("#use-subtype-form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText((content) => content.includes("can contain letters"))).toBeInTheDocument();
      });
    });

    it("should reject description with only zeros", async () => {
      const { container } = renderWithIntl(
        <UseSubTypeForm id={null} typeInfo={typeInfo} allSubTypes={allSubTypes} />
      );

      const descInput = screen.getByPlaceholderText("Sub-Type Name");
      fireEvent.change(descInput, { target: { value: "000" } });
      
      const form = container.querySelector("#use-subtype-form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText((content) => content.includes("cannot contain only zeros"))).toBeInTheDocument();
      });
    });

    it("should detect duplicate sub-type description", async () => {
      const { container } = renderWithIntl(
        <UseSubTypeForm id={null} typeInfo={typeInfo} allSubTypes={allSubTypes} />
      );

      const descInput = screen.getByPlaceholderText("Sub-Type Name");
      fireEvent.change(descInput, { target: { value: "Ground Floor" } });
      
      const form = container.querySelector("#use-subtype-form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText(/Duplicate Sub-Type Name is not allowed/i)).toBeInTheDocument();
      });
    });

    it("should validate sequence is non-negative", async () => {
      const { container } = renderWithIntl(
        <UseSubTypeForm id={null} typeInfo={typeInfo} allSubTypes={allSubTypes} />
      );

      const seqInput = screen.getByPlaceholderText("0");
      fireEvent.change(seqInput, { target: { value: "-1" } });
      
      const form = container.querySelector("#use-subtype-form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText(/Search Sequence must be 0 or greater/i)).toBeInTheDocument();
      });
    });

    it("should accept sequence at maximum value (999)", async () => {
      mockCreateSubType.mockResolvedValue(undefined);

      const { container } = renderWithIntl(
        <UseSubTypeForm id={null} typeInfo={typeInfo} allSubTypes={allSubTypes} />
      );

      const descInput = screen.getByPlaceholderText("Sub-Type Name");
      fireEvent.change(descInput, { target: { value: "Max Sequence Floor" } });

      const seqInput = screen.getByPlaceholderText("0");
      fireEvent.change(seqInput, { target: { value: "999" } });

      const form = container.querySelector("#use-subtype-form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockCreateSubType).toHaveBeenCalledWith({
          typeId: 1,
          description: "Max Sequence Floor",
          searchSequence: 999,
          status: "Active",
        });
        expect(toast.success).toHaveBeenCalledWith("Sub-Type Created");
      });
    });

    it("should reject sequence above maximum (1000)", async () => {
      const { container } = renderWithIntl(
        <UseSubTypeForm id={null} typeInfo={typeInfo} allSubTypes={allSubTypes} />
      );

      const descInput = screen.getByPlaceholderText("Sub-Type Name");
      fireEvent.change(descInput, { target: { value: "Test Floor" } });

      const seqInput = screen.getByPlaceholderText("0");
      fireEvent.change(seqInput, { target: { value: "1000" } });
      
      const form = container.querySelector("#use-subtype-form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText((content) => content.includes("must be maximum 3 digits"))).toBeInTheDocument();
      });
    });

    it("should create sub-type successfully with valid data", async () => {
      mockCreateSubType.mockResolvedValue(undefined);

      const { container } = renderWithIntl(
        <UseSubTypeForm id={null} typeInfo={typeInfo} allSubTypes={allSubTypes} />
      );

      const descInput = screen.getByPlaceholderText("Sub-Type Name");
      fireEvent.change(descInput, { target: { value: "Second Floor" } });

      const seqInput = screen.getByPlaceholderText("0");
      fireEvent.change(seqInput, { target: { value: "3" } });

      const form = container.querySelector("#use-subtype-form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockCreateSubType).toHaveBeenCalledWith({
          typeId: 1,
          description: "Second Floor",
          searchSequence: 3,
          status: "Active",
        });
        expect(toast.success).toHaveBeenCalledWith("Sub-Type Created");
        expect(mockRouterBack).toHaveBeenCalled();
      });
    });

    it("should handle create error", async () => {
      mockCreateSubType.mockRejectedValue(new Error("Create failed"));

      const { container } = renderWithIntl(
        <UseSubTypeForm id={null} typeInfo={typeInfo} allSubTypes={allSubTypes} />
      );

      const descInput = screen.getByPlaceholderText("Sub-Type Name");
      fireEvent.change(descInput, { target: { value: "Second Floor" } });

      const form = container.querySelector("#use-subtype-form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it("should cancel and go back", () => {
      renderWithIntl(
        <UseSubTypeForm id={null} typeInfo={typeInfo} allSubTypes={allSubTypes} />
      );

      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      expect(mockRouterBack).toHaveBeenCalled();
    });
  });

  describe("Edit Mode", () => {
    const initialData: UseSubType = {
      subTypeOfUseId: 1,
      description: "Ground Floor",
      typeOfUseId: 1,
      searchSequence: 1,
      isActive: true,
      status: "Active",
    };

    it("should render form in edit mode with initial data", () => {
      renderWithIntl(
        <UseSubTypeForm
          id="1"
          initialData={initialData}
          typeInfo={typeInfo}
          allSubTypes={allSubTypes}
        />
      );

      expect(screen.getByText("Edit Sub-Type")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Ground Floor")).toBeInTheDocument();
      // Use a more specific selector for the searchSequence input
      expect(screen.getByRole("spinbutton")).toHaveValue(1);
    });

    it("should update sub-type successfully", async () => {
      mockUpdateSubType.mockResolvedValue(undefined);

      const { container } = renderWithIntl(
        <UseSubTypeForm
          id="1"
          initialData={initialData}
          typeInfo={typeInfo}
          allSubTypes={allSubTypes}
        />
      );

      const descInput = screen.getByDisplayValue("Ground Floor");
      fireEvent.change(descInput, { target: { value: "Ground Floor Updated" } });

      const form = container.querySelector("#use-subtype-form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockUpdateSubType).toHaveBeenCalledWith({
          id: 1,
          typeId: 1,
          description: "Ground Floor Updated",
          searchSequence: 1,
          status: "Active",
        });
        expect(toast.success).toHaveBeenCalledWith("Sub-Type Updated");
        expect(mockRouterBack).toHaveBeenCalled();
      });
    });

    it("should toggle status", () => {
      renderWithIntl(
        <UseSubTypeForm
          id="1"
          initialData={initialData}
          typeInfo={typeInfo}
          allSubTypes={allSubTypes}
        />
      );

      const toggleSwitch = screen.getByRole("switch");
      expect(toggleSwitch).toBeChecked();

      fireEvent.click(toggleSwitch);
      expect(toggleSwitch).not.toBeChecked();
    });

    it("should exclude current record from duplicate check", async () => {
      renderWithIntl(
        <UseSubTypeForm
          id="1"
          initialData={initialData}
          typeInfo={typeInfo}
          allSubTypes={allSubTypes}
        />
      );

      const descInput = screen.getByDisplayValue("Ground Floor");
      // Changing to the same value should not show duplicate error
      fireEvent.change(descInput, { target: { value: "Ground Floor" } });
      fireEvent.blur(descInput);

      await waitFor(() => {
        const duplicateError = screen.queryByText(/Duplicate Sub-Type Name is not allowed/i);
        expect(duplicateError).not.toBeInTheDocument();
      });
    });
  });

  describe("Validation", () => {
    it("should sanitize description input", async () => {
      renderWithIntl(
        <UseSubTypeForm id={null} typeInfo={typeInfo} allSubTypes={allSubTypes} />
      );

      const descInput = screen.getByPlaceholderText("Sub-Type Name") as HTMLInputElement;
      
      // Input with invalid characters should be sanitized
      // Proactive sanitization removes characters like @#$ immediately
      fireEvent.change(descInput, { target: { value: "Test @#$ Name" } });
      
      await waitFor(() => {
        expect(descInput.value).toBe("Test  Name"); // Spaces are preserved, special chars removed
      });
    });

    it("should enforce max length on description", async () => {
      renderWithIntl(
        <UseSubTypeForm id={null} typeInfo={typeInfo} allSubTypes={allSubTypes} />
      );

      const descInput = screen.getByPlaceholderText("Sub-Type Name");
      const longText = "a".repeat(150); // Exceeds max length
      
      fireEvent.change(descInput, { target: { value: longText } });
      fireEvent.blur(descInput);

      await waitFor(() => {
        // Should show max length error or truncate
        const value = (descInput as HTMLInputElement).value;
        expect(value.length).toBeLessThanOrEqual(100);
      });
    });
  });
});
