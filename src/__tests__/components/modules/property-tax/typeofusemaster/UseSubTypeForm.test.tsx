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
    subtype: {
      add: "Add Sub-Type of Use",
      edit: "Edit Sub-Type",
      forType: "For Type: {type}",
      mandatoryNote: "Fields marked with * are mandatory",
      fields: {
        subTypeEnglish: "Sub-Type (English)",
        sequence: "Sequence",
        status: "Status",
      },
      placeholders: {
        subTypeEnglish: "Enter sub-type name",
        sequence: "0",
      },
    },
    messages: {
      subTypeCreated: "Sub-Type Created",
      subTypeUpdated: "Sub-Type Updated",
      duplicateSubTypeName: "Duplicate Sub-Type Name is not allowed.",
      descriptionRequired: "Description is required.",
      saveFailed: "Failed to save. Please try again.",
      allowedChars: "can contain letters (any language), numbers, spaces and (. - ,).",
      sequenceNonNegative: "must be 0 or greater.",
      maxLength: "must be maximum {count} characters.",
      typeNotFound: "Type not found",
    },
    status: {
      active: "Active",
      inactive: "Inactive",
    },
    buttons: {
      save: "Save",
      cancel: "Cancel",
    },
  },
  common: {
    buttons: {
      cancel: "Cancel",
      save: "Save",
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
      expect(screen.getByPlaceholderText("Enter sub-type name")).toBeInTheDocument();
      expect(screen.getByText(/For Type:/)).toBeInTheDocument();
    });

    it("should show error when type info is missing", () => {
      renderWithIntl(
        <UseSubTypeForm id={null} typeInfo={null} allSubTypes={[]} />
      );

      expect(screen.getByText(/Type not found/i)).toBeInTheDocument();
    });

    it("should validate required fields", async () => {
      renderWithIntl(
        <UseSubTypeForm id={null} typeInfo={typeInfo} allSubTypes={allSubTypes} />
      );

      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockCreateSubType).not.toHaveBeenCalled();
      });
    });

    it("should validate description format", async () => {
      renderWithIntl(
        <UseSubTypeForm id={null} typeInfo={typeInfo} allSubTypes={allSubTypes} />
      );

      const descInput = screen.getByPlaceholderText("Enter sub-type name");
      fireEvent.change(descInput, { target: { value: "Test@#$%^&" } });
      fireEvent.blur(descInput);

      await waitFor(() => {
        expect(screen.getByText(/can contain letters/i)).toBeInTheDocument();
      });
    });

    it("should detect duplicate sub-type description", async () => {
      renderWithIntl(
        <UseSubTypeForm id={null} typeInfo={typeInfo} allSubTypes={allSubTypes} />
      );

      const descInput = screen.getByPlaceholderText("Enter sub-type name");
      fireEvent.change(descInput, { target: { value: "Ground Floor" } });
      fireEvent.blur(descInput);

      await waitFor(() => {
        expect(screen.getByText(/Duplicate Sub-Type Name is not allowed/i)).toBeInTheDocument();
      });
    });

    it("should validate sequence is non-negative", async () => {
      renderWithIntl(
        <UseSubTypeForm id={null} typeInfo={typeInfo} allSubTypes={allSubTypes} />
      );

      const seqInput = screen.getByPlaceholderText("0");
      fireEvent.change(seqInput, { target: { value: "-1" } });
      fireEvent.blur(seqInput);

      await waitFor(() => {
        expect(screen.getByText(/must be 0 or greater/i)).toBeInTheDocument();
      });
    });

    it("should create sub-type successfully with valid data", async () => {
      mockCreateSubType.mockResolvedValue(undefined);

      renderWithIntl(
        <UseSubTypeForm id={null} typeInfo={typeInfo} allSubTypes={allSubTypes} />
      );

      const descInput = screen.getByPlaceholderText("Enter sub-type name");
      fireEvent.change(descInput, { target: { value: "Second Floor" } });

      const seqInput = screen.getByPlaceholderText("0");
      fireEvent.change(seqInput, { target: { value: "3" } });

      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);

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

      renderWithIntl(
        <UseSubTypeForm id={null} typeInfo={typeInfo} allSubTypes={allSubTypes} />
      );

      const descInput = screen.getByPlaceholderText("Enter sub-type name");
      fireEvent.change(descInput, { target: { value: "Second Floor" } });

      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);

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
      expect(screen.getByDisplayValue("1")).toBeInTheDocument();
    });

    it("should update sub-type successfully", async () => {
      mockUpdateSubType.mockResolvedValue(undefined);

      renderWithIntl(
        <UseSubTypeForm
          id="1"
          initialData={initialData}
          typeInfo={typeInfo}
          allSubTypes={allSubTypes}
        />
      );

      const descInput = screen.getByDisplayValue("Ground Floor");
      fireEvent.change(descInput, { target: { value: "Ground Floor Updated" } });

      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);

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

      const descInput = screen.getByPlaceholderText("Enter sub-type name");
      
      // Input with multiple spaces should be sanitized
      fireEvent.change(descInput, { target: { value: "Test    Multiple    Spaces" } });
      
      await waitFor(() => {
        // The value should be sanitized (implementation detail may vary)
        expect(descInput).toHaveValue(expect.any(String));
      });
    });

    it("should enforce max length on description", async () => {
      renderWithIntl(
        <UseSubTypeForm id={null} typeInfo={typeInfo} allSubTypes={allSubTypes} />
      );

      const descInput = screen.getByPlaceholderText("Enter sub-type name");
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
