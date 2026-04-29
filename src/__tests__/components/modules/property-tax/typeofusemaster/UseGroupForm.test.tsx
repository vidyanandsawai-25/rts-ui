import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import UseGroupForm from "@/components/modules/property-tax/typeofusemaster/UseGroupForm";
import type { UseGroup } from "@/types/typeOfUse.types";
import { toast } from "sonner";

// Mock next/navigation
const mockRouterPush = vi.fn();
const mockRouterBack = vi.fn();
const mockRouterRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    back: mockRouterBack,
    refresh: mockRouterRefresh,
  }),
  usePathname: () => "/property-tax/typeofusemaster/group/add",
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
  createUseGroup: vi.fn(),
  updateUseGroup: vi.fn(),
}));

import { createUseGroup, updateUseGroup } from "@/app/[locale]/property-tax/typeofusemaster/actions";
const mockCreateUseGroup = vi.mocked(createUseGroup);
const mockUpdateUseGroup = vi.mocked(updateUseGroup);

const mockMessages = {
  typeofusemaster: {
    group: {
      add: "Add Use Group",
      edit: "Edit Use Group",
      editSubtitle: "Update existing Use Group",
      mandatoryNote: "Fields marked with * are mandatory",
      fields: {
        groupId: "Group ID Code",
        groupName: "Group Name",
        iconType: "Icon Type",
        status: "Active Status",
      },
      placeholders: {
        groupId: "e.g., RES, COM, IND01",
        groupName: "e.g., Residential, Local",
      },
    },
    messages: {
      groupCreated: "Use Group Created",
      groupUpdated: "Use Group Updated",
      duplicateGroupId: "Duplicate group id is not allowed.",
      duplicateGroupName: "Duplicate group name is not allowed.",
      saveFailed: "Failed to save. Please try again.",
      maxLength: "must be maximum {count} characters.",
      onlyAlphanumeric: "must contain only letters and numbers (no special characters).",
      allowedChars: "can contain letters (any language), numbers, spaces and (. - ,).",
      atLeastOneLetter: "must contain at least one letter.",
    },
    status: {
      active: "Active",
      inactive: "Inactive",
      isCurrently: "is currently",
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

const existingGroups: UseGroup[] = [
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

const renderWithIntl = (component: React.ReactElement) => {
  return render(
    <NextIntlClientProvider locale="en" messages={mockMessages}>
      {component}
    </NextIntlClientProvider>
  );
};

describe("UseGroupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Add Mode", () => {
    it("should render form in add mode", () => {
      renderWithIntl(<UseGroupForm id={null} allGroups={existingGroups} />);

      expect(screen.getByText("Add Use Group")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("e.g., RES, COM, IND01")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("e.g., Residential, Local")).toBeInTheDocument();
    });

    it("should validate required fields", async () => {
      renderWithIntl(<UseGroupForm id={null} allGroups={existingGroups} />);

      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockCreateUseGroup).not.toHaveBeenCalled();
      });
    });

    it("should validate code format (alphanumeric only)", async () => {
      renderWithIntl(<UseGroupForm id={null} allGroups={existingGroups} />);

      const codeInput = screen.getByPlaceholderText("e.g., RES, COM, IND01");
      fireEvent.change(codeInput, { target: { value: "RES@#$" } });
      fireEvent.blur(codeInput);

      await waitFor(() => {
        expect(screen.getByText(/must contain only letters and numbers/i)).toBeInTheDocument();
      });
    });

    it("should detect duplicate group code", async () => {
      renderWithIntl(<UseGroupForm id={null} allGroups={existingGroups} />);

      const codeInput = screen.getByPlaceholderText("e.g., RES, COM, IND01");
      const nameInput = screen.getByPlaceholderText("e.g., Residential, Local");

      fireEvent.change(codeInput, { target: { value: "RES" } });
      fireEvent.change(nameInput, { target: { value: "New Residential" } });
      fireEvent.blur(codeInput);

      await waitFor(() => {
        expect(screen.getByText(/Duplicate group id is not allowed/i)).toBeInTheDocument();
      });
    });

    it("should detect duplicate group name", async () => {
      renderWithIntl(<UseGroupForm id={null} allGroups={existingGroups} />);

      const codeInput = screen.getByPlaceholderText("e.g., RES, COM, IND01");
      const nameInput = screen.getByPlaceholderText("e.g., Residential, Local");

      fireEvent.change(codeInput, { target: { value: "RES01" } });
      fireEvent.change(nameInput, { target: { value: "Residential" } });
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(screen.getByText(/Duplicate group name is not allowed/i)).toBeInTheDocument();
      });
    });

    it("should create group successfully with valid data", async () => {
      mockCreateUseGroup.mockResolvedValue(undefined);

      renderWithIntl(<UseGroupForm id={null} allGroups={existingGroups} />);

      const codeInput = screen.getByPlaceholderText("e.g., RES, COM, IND01");
      const nameInput = screen.getByPlaceholderText("e.g., Residential, Local");

      fireEvent.change(codeInput, { target: { value: "IND" } });
      fireEvent.change(nameInput, { target: { value: "Industrial" } });

      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockCreateUseGroup).toHaveBeenCalledWith({
          code: "IND",
          name: "Industrial",
          icon: "home",
          status: "Active",
        });
        expect(toast.success).toHaveBeenCalledWith("Use Group Created");
        expect(mockRouterBack).toHaveBeenCalled();
      });
    });

    it("should handle create error", async () => {
      mockCreateUseGroup.mockRejectedValue(new Error("Create failed"));

      renderWithIntl(<UseGroupForm id={null} allGroups={existingGroups} />);

      const codeInput = screen.getByPlaceholderText("e.g., RES, COM, IND01");
      const nameInput = screen.getByPlaceholderText("e.g., Residential, Local");

      fireEvent.change(codeInput, { target: { value: "IND" } });
      fireEvent.change(nameInput, { target: { value: "Industrial" } });

      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it("should cancel and go back", () => {
      renderWithIntl(<UseGroupForm id={null} allGroups={existingGroups} />);

      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      expect(mockRouterBack).toHaveBeenCalled();
    });
  });

  describe("Edit Mode", () => {
    const initialData: UseGroup = {
      typeOfUseGroupId: 1,
      typeOfUseGroupCode: "RES",
      groupName: "Residential",
      groupIcon: "home-icon",
      isActive: true,
      status: "Active",
    };

    it("should render form in edit mode with initial data", () => {
      renderWithIntl(
        <UseGroupForm id="1" initialData={initialData} allGroups={existingGroups} />
      );

      expect(screen.getByText("Edit Use Group")).toBeInTheDocument();
      expect(screen.getByDisplayValue("RES")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Residential")).toBeInTheDocument();
    });

    it("should update group successfully", async () => {
      mockUpdateUseGroup.mockResolvedValue(undefined);

      renderWithIntl(
        <UseGroupForm id="1" initialData={initialData} allGroups={existingGroups} />
      );

      const nameInput = screen.getByDisplayValue("Residential");
      fireEvent.change(nameInput, { target: { value: "Residential Updated" } });

      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateUseGroup).toHaveBeenCalledWith({
          id: 1,
          code: "RES",
          name: "Residential Updated",
          icon: "home",
          status: "Active",
        });
        expect(toast.success).toHaveBeenCalledWith("Use Group Updated");
        expect(mockRouterBack).toHaveBeenCalled();
      });
    });

    it("should toggle status", () => {
      renderWithIntl(
        <UseGroupForm id="1" initialData={initialData} allGroups={existingGroups} />
      );

      const toggleSwitch = screen.getByRole("switch");
      expect(toggleSwitch).toBeChecked();

      fireEvent.click(toggleSwitch);
      expect(toggleSwitch).not.toBeChecked();
    });
  });

  describe("Icon Selection", () => {
    it("should allow icon selection", async () => {
      renderWithIntl(<UseGroupForm id={null} allGroups={existingGroups} />);

      // The icon dropdown should be present
      const iconButtons = screen.getAllByRole("button");
      const iconDropdown = iconButtons.find(btn => btn.getAttribute('aria-haspopup') === 'true');
      
      if (iconDropdown) {
        fireEvent.click(iconDropdown);
        // Icon options should appear
        await waitFor(() => {
          expect(screen.getByText(/home/i)).toBeInTheDocument();
        });
      }
    });
  });
});
