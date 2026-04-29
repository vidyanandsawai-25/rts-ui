import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import UseTypeForm from "@/components/modules/property-tax/typeofusemaster/UseTypeForm";
import type { UseGroup, UseType } from "@/types/typeOfUse.types";
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
    get: vi.fn((key) => (key === "groupId" ? "1" : null)),
  }),
  usePathname: () => "/property-tax/typeofusemaster/type/add",
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
  createUseType: vi.fn(),
  updateUseType: vi.fn(),
}));

import { createUseType, updateUseType } from "@/app/[locale]/property-tax/typeofusemaster/actions";
const mockCreateUseType = vi.mocked(createUseType);
const mockUpdateUseType = vi.mocked(updateUseType);

const mockMessages = {
  typeofusemaster: {
    type: {
      add: "Add Type of Use",
      edit: "Edit Type of Use",
      selectGroup: "Select group",
      selectType: "Select Type",
      mandatoryNote: "Fields marked with * are mandatory",
      fields: {
        typeId: "Type Of Use Code",
        type: "Type",
        useTypeGroup: "Use Type Group",
        description: "Description",
        sequence: "Key Wise Sequence",
        status: "Active Status",
      },
      placeholders: {
        typeId: "e.g., RES, COM01, IND",
        description: "Enter description",
        sequence: "0",
      },
      options: {
        residential: "R - Residential",
        commercial: "C - Commercial",
        industrial: "I - Industrial",
        nontaxable: "N - Non-taxable",
      },
    },
    messages: {
      typeCreated: "Type Created",
      typeUpdated: "Type Updated",
      duplicateTypeId: "Duplicate Type Of Use Code is not allowed.",
      duplicateDescription: "Duplicate Description is not allowed.",
      groupRequired: "Type Of Use Group is required.",
      typeRequired: "Type is required.",
      saveFailed: "Failed to save. Please try again.",
      maxLength: "must be maximum {count} characters.",
      onlyAlphanumeric: "must contain only letters and numbers (no special characters).",
      allowedChars: "can contain letters (any language), numbers, spaces and (. - ,).",
      sequenceNonNegative: "must be 0 or greater.",
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

const allGroups: UseGroup[] = [
  {
    typeOfUseGroupId: 1,
    typeOfUseGroupCode: "RES",
    groupName: "Residential",
    groupIcon: "home-icon",
    isActive: true,
    status: "Active",
  },
  {
    typeOfUseGroupId: 2,
    typeOfUseGroupCode: "COM",
    groupName: "Commercial",
    groupIcon: "building-icon",
    isActive: true,
    status: "Active",
  },
];

const allTypes: UseType[] = [
  {
    typeOfUseId: 1,
    typeOfUseCode: "RES01",
    description: "Residential Building",
    type: "R",
    typeOfUseGroupId: 1,
    searchSequence: 1,
    isActive: true,
    status: "Active",
  },
  {
    typeOfUseId: 2,
    typeOfUseCode: "COM01",
    description: "Commercial Shop",
    type: "C",
    typeOfUseGroupId: 2,
    searchSequence: 1,
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

describe("UseTypeForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Add Mode", () => {
    it("should render form in add mode", () => {
      renderWithIntl(
        <UseTypeForm id={null} allGroups={allGroups} allTypes={allTypes} />
      );

      expect(screen.getByText("Add Type of Use")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("e.g., RES, COM01, IND")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter description")).toBeInTheDocument();
    });

    it("should validate required fields", async () => {
      renderWithIntl(
        <UseTypeForm id={null} allGroups={allGroups} allTypes={allTypes} />
      );

      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockCreateUseType).not.toHaveBeenCalled();
      });
    });

    it("should validate code format (alphanumeric only)", async () => {
      renderWithIntl(
        <UseTypeForm id={null} allGroups={allGroups} allTypes={allTypes} />
      );

      const codeInput = screen.getByPlaceholderText("e.g., RES, COM01, IND");
      fireEvent.change(codeInput, { target: { value: "RES@#$" } });
      fireEvent.blur(codeInput);

      await waitFor(() => {
        expect(screen.getByText(/must contain only letters and numbers/i)).toBeInTheDocument();
      });
    });

    it("should validate description format", async () => {
      renderWithIntl(
        <UseTypeForm id={null} allGroups={allGroups} allTypes={allTypes} />
      );

      const descInput = screen.getByPlaceholderText("Enter description");
      fireEvent.change(descInput, { target: { value: "Test@#$%^" } });
      fireEvent.blur(descInput);

      await waitFor(() => {
        expect(screen.getByText(/can contain letters/i)).toBeInTheDocument();
      });
    });

    it("should detect duplicate type code", async () => {
      renderWithIntl(
        <UseTypeForm id={null} allGroups={allGroups} allTypes={allTypes} />
      );

      const codeInput = screen.getByPlaceholderText("e.g., RES, COM01, IND");
      fireEvent.change(codeInput, { target: { value: "RES01" } });
      fireEvent.blur(codeInput);

      await waitFor(() => {
        expect(screen.getByText(/Duplicate Type Of Use Code is not allowed/i)).toBeInTheDocument();
      });
    });

    it("should detect duplicate description", async () => {
      renderWithIntl(
        <UseTypeForm id={null} allGroups={allGroups} allTypes={allTypes} />
      );

      const descInput = screen.getByPlaceholderText("Enter description");
      fireEvent.change(descInput, { target: { value: "Residential Building" } });
      fireEvent.blur(descInput);

      await waitFor(() => {
        expect(screen.getByText(/Duplicate Description is not allowed/i)).toBeInTheDocument();
      });
    });

    it("should validate sequence is non-negative", async () => {
      renderWithIntl(
        <UseTypeForm id={null} allGroups={allGroups} allTypes={allTypes} />
      );

      const seqInput = screen.getByPlaceholderText("0");
      fireEvent.change(seqInput, { target: { value: "-1" } });
      fireEvent.blur(seqInput);

      await waitFor(() => {
        expect(screen.getByText(/must be 0 or greater/i)).toBeInTheDocument();
      });
    });

    it("should create type successfully with valid data", async () => {
      mockCreateUseType.mockResolvedValue(undefined);

      renderWithIntl(
        <UseTypeForm id={null} allGroups={allGroups} allTypes={allTypes} />
      );

      // Select group
      const groupSelect = screen.getByRole("combobox", { name: /use type group/i });
      fireEvent.change(groupSelect, { target: { value: "1" } });

      // Fill in type code
      const codeInput = screen.getByPlaceholderText("e.g., RES, COM01, IND");
      fireEvent.change(codeInput, { target: { value: "IND01" } });

      // Fill in description
      const descInput = screen.getByPlaceholderText("Enter description");
      fireEvent.change(descInput, { target: { value: "Industrial Building" } });

      // Select type
      const typeSelect = screen.getByRole("combobox", { name: /^type$/i });
      fireEvent.change(typeSelect, { target: { value: "I" } });

      // Fill in sequence
      const seqInput = screen.getByPlaceholderText("0");
      fireEvent.change(seqInput, { target: { value: "1" } });

      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockCreateUseType).toHaveBeenCalledWith({
          groupId: 1,
          code: "IND01",
          description: "Industrial Building",
          type: "I",
          searchSequence: 1,
          status: "Active",
        });
        expect(toast.success).toHaveBeenCalledWith("Type Created");
        expect(mockRouterBack).toHaveBeenCalled();
      });
    });

    it("should handle create error", async () => {
      mockCreateUseType.mockRejectedValue(new Error("Create failed"));

      renderWithIntl(
        <UseTypeForm id={null} allGroups={allGroups} allTypes={allTypes} />
      );

      // Fill form with valid data
      const groupSelect = screen.getByRole("combobox", { name: /use type group/i });
      fireEvent.change(groupSelect, { target: { value: "1" } });

      const codeInput = screen.getByPlaceholderText("e.g., RES, COM01, IND");
      fireEvent.change(codeInput, { target: { value: "IND01" } });

      const descInput = screen.getByPlaceholderText("Enter description");
      fireEvent.change(descInput, { target: { value: "Industrial" } });

      const typeSelect = screen.getByRole("combobox", { name: /^type$/i });
      fireEvent.change(typeSelect, { target: { value: "I" } });

      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it("should cancel and go back", () => {
      renderWithIntl(
        <UseTypeForm id={null} allGroups={allGroups} allTypes={allTypes} />
      );

      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      expect(mockRouterBack).toHaveBeenCalled();
    });
  });

  describe("Edit Mode", () => {
    const initialData: UseType = {
      typeOfUseId: 1,
      typeOfUseCode: "RES01",
      description: "Residential Building",
      type: "R",
      typeOfUseGroupId: 1,
      searchSequence: 1,
      isActive: true,
      status: "Active",
    };

    it("should render form in edit mode with initial data", () => {
      renderWithIntl(
        <UseTypeForm
          id="1"
          initialData={initialData}
          allGroups={allGroups}
          allTypes={allTypes}
        />
      );

      expect(screen.getByText("Edit Type of Use")).toBeInTheDocument();
      expect(screen.getByDisplayValue("RES01")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Residential Building")).toBeInTheDocument();
    });

    it("should update type successfully", async () => {
      mockUpdateUseType.mockResolvedValue(undefined);

      renderWithIntl(
        <UseTypeForm
          id="1"
          initialData={initialData}
          allGroups={allGroups}
          allTypes={allTypes}
        />
      );

      const descInput = screen.getByDisplayValue("Residential Building");
      fireEvent.change(descInput, { target: { value: "Residential Building Updated" } });

      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateUseType).toHaveBeenCalledWith({
          id: 1,
          groupId: 1,
          code: "RES01",
          description: "Residential Building Updated",
          type: "R",
          searchSequence: 1,
          status: "Active",
        });
        expect(toast.success).toHaveBeenCalledWith("Type Updated");
        expect(mockRouterBack).toHaveBeenCalled();
      });
    });

    it("should toggle status", () => {
      renderWithIntl(
        <UseTypeForm
          id="1"
          initialData={initialData}
          allGroups={allGroups}
          allTypes={allTypes}
        />
      );

      const toggleSwitch = screen.getByRole("switch");
      expect(toggleSwitch).toBeChecked();

      fireEvent.click(toggleSwitch);
      expect(toggleSwitch).not.toBeChecked();
    });
  });
});
