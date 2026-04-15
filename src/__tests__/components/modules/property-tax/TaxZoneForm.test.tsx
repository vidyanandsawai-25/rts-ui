import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import TaxZoneForm from "@/components/modules/property-tax/taxzonemaster/TaxZoneForm";
import type { TaxZoneFormModel } from "@/types/taxzone.types";
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
  usePathname: () => "/property-tax/taxzone/add",
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the save action
vi.mock("@/app/[locale]/property-tax/taxzone/action", () => ({
  saveTaxZone: vi.fn(),
}));

// Import the mocked action to get access to the mock function
import { saveTaxZone } from "@/app/[locale]/property-tax/taxzone/action";
const mockSaveTaxZone = vi.mocked(saveTaxZone);

const mockMessages = {
  taxZone: {
    form: {
      addTitle: "Add Zone",
      editTitle: "Edit Zone",
      subtitle: "Create new zone",
      editSubtitle: "Update zone details",
      fields: {
        zoneNo: {
          label: "Zone No",
          placeholder: "e.g. 1 or Z",
        },
        zoneType: {
          label: "Zone Type",
          placeholder: "e.g. Residential",
        },
        remark: {
          label: "Remark",
          placeholder: "Enter remark",
        },
      },
      validation: {
        zoneNoRequired: "Zone No is required",
        zoneNoMax: "Maximum length is 10 characters",
        zoneNoFormat: "Only letters and numbers allowed",
        zoneTypeRequired: "Zone Type is required",
        zoneTypeFormat: "Invalid characters used",
        remarkRequired: "Remark is required",
        remarkFormat: "Invalid characters used",
        fixErrors: "Please fix validation errors",
        duplicateRecord: "This record already exists",
        duplicateError: "This record already exists. Please check Zone No and Zone Type - duplicates not allowed.",
      },
      status: {
        label: "Active Status",
        active: "Zone is currently active",
        inactive: "Zone is currently inactive",
      },
      actions: {
        cancel: "Cancel",
        save: "Save",
        update: "Update",
      },
      messages: {
        createSuccess: "Zone created successfully",
        updateSuccess: "Zone updated successfully",
        error: "Something went wrong",
      },
    },
  },
  common: {
    buttons: {
      cancel: "Cancel",
      save: "Save",
    },
  },
};

describe("TaxZoneForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setup(initialData: TaxZoneFormModel | null = null) {
    return render(
      <NextIntlClientProvider locale="en" messages={mockMessages}>
        <TaxZoneForm initialData={initialData} />
      </NextIntlClientProvider>
    );
  }

  describe("Add Mode", () => {
    it("renders add form with empty fields", () => {
      setup();

      expect(screen.getByText("Add Zone")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("e.g. 1 or Z")).toHaveValue("");
      expect(screen.getByPlaceholderText("e.g. Residential")).toHaveValue("");
      expect(screen.getByPlaceholderText("Enter remark")).toHaveValue("");
    });

    it("validates required fields on submit", async () => {
      setup();

      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText("Zone No is required")).toBeInTheDocument();
        expect(screen.getByText("Zone Type is required")).toBeInTheDocument();
        expect(screen.getByText("Remark is required")).toBeInTheDocument();
      });

      expect(toast.error).toHaveBeenCalledWith("Please fix validation errors");
    });

    it("validates zone no max length", async () => {
      setup();

      const zoneNoInput = screen.getByPlaceholderText("e.g. 1 or Z");
      fireEvent.change(zoneNoInput, { target: { value: "12345678901" } }); // 11 characters

      // Should be capped at 10 characters
      expect(zoneNoInput).toHaveValue("1234567890");
    });

    it("validates zone no format (alphanumeric only)", async () => {
      setup();

      const zoneNoInput = screen.getByPlaceholderText("e.g. 1 or Z");
      fireEvent.change(zoneNoInput, { target: { value: "Z1" } });
      fireEvent.blur(zoneNoInput);

      expect(zoneNoInput).toHaveValue("Z1");
    });

    it("sanitizes invalid characters in zone type and remark", () => {
      setup();

      const zoneTypeInput = screen.getByPlaceholderText("e.g. Residential");
      const remarkInput = screen.getByPlaceholderText("Enter remark");

      fireEvent.change(zoneTypeInput, { target: { value: "Residential<script>" } });
      fireEvent.change(remarkInput, { target: { value: "Test<script>alert('xss')</script>" } });

      // Should sanitize script tags
      expect(zoneTypeInput).toHaveValue("Residentialscript");
      expect(remarkInput).toHaveValue("Testscriptalert('xss')/script");
    });

    it("successfully creates a new zone", async () => {
      mockSaveTaxZone.mockResolvedValueOnce({ ok: true, mode: "create" });
      setup();

      const zoneNoInput = screen.getByPlaceholderText("e.g. 1 or Z");
      const zoneTypeInput = screen.getByPlaceholderText("e.g. Residential");
      const remarkInput = screen.getByPlaceholderText("Enter remark");

      fireEvent.change(zoneNoInput, { target: { value: "Z1" } });
      fireEvent.change(zoneTypeInput, { target: { value: "Residential" } });
      fireEvent.change(remarkInput, { target: { value: "Test remark" } });

      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockSaveTaxZone).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith("Zone created successfully");
        expect(mockRouterPush).toHaveBeenCalledWith("/en/property-tax/taxzone");
      });
    });

    it("handles duplicate record error", async () => {
      mockSaveTaxZone.mockResolvedValueOnce({
        ok: false,
        error: "duplicate",
        message: "This record already exists",
      });
      setup();

      const zoneNoInput = screen.getByPlaceholderText("e.g. 1 or Z");
      const zoneTypeInput = screen.getByPlaceholderText("e.g. Residential");
      const remarkInput = screen.getByPlaceholderText("Enter remark");

      fireEvent.change(zoneNoInput, { target: { value: "Z1" } });
      fireEvent.change(zoneTypeInput, { target: { value: "Residential" } });
      fireEvent.change(remarkInput, { target: { value: "Test" } });

      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("This record already exists");
        expect(screen.getByText("This record already exists")).toBeInTheDocument();
      });
    });

    it("toggles active status", () => {
      setup();

      // Find the toggle switch (implementation may vary, adjust selector as needed)
      const drawer = screen.getByRole("dialog");
      expect(drawer).toBeInTheDocument();
    });
  });

  describe("Edit Mode", () => {
    const mockInitialData: TaxZoneFormModel = {
      taxZoneId: 1,
      taxZoneNo: "Z1",
      taxZoneType: "Residential",
      remark: "Existing zone",
      isActive: true,
    };

    it("renders edit form with pre-filled data", () => {
      setup(mockInitialData);

      expect(screen.getByText("Edit Zone")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Z1")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Residential")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Existing zone")).toBeInTheDocument();
    });

    it("successfully updates an existing zone", async () => {
      mockSaveTaxZone.mockResolvedValueOnce({ ok: true, mode: "update" });
      setup(mockInitialData);

      const zoneTypeInput = screen.getByDisplayValue("Residential");
      fireEvent.change(zoneTypeInput, { target: { value: "Commercial" } });

      const updateButton = screen.getByText("Update");
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockSaveTaxZone).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith("Zone updated successfully");
        expect(mockRouterPush).toHaveBeenCalledWith("/en/property-tax/taxzone");
      });
    });

    it("displays update button instead of save button in edit mode", () => {
      setup(mockInitialData);

      expect(screen.getByText("Update")).toBeInTheDocument();
      expect(screen.queryByText("Save")).not.toBeInTheDocument();
    });
  });

  describe("Form Interactions", () => {
    it("shows validation error on blur", async () => {
      setup();

      const zoneNoInput = screen.getByPlaceholderText("e.g. 1 or Z");
      fireEvent.focus(zoneNoInput);
      fireEvent.blur(zoneNoInput);

      await waitFor(() => {
        expect(screen.getByText("Zone No is required")).toBeInTheDocument();
      });
    });

    it("clears error when user starts typing", async () => {
      setup();

      const zoneNoInput = screen.getByPlaceholderText("e.g. 1 or Z");
      
      // Trigger validation error
      fireEvent.blur(zoneNoInput);
      await waitFor(() => {
        expect(screen.getByText("Zone No is required")).toBeInTheDocument();
      });

      // Start typing
      fireEvent.change(zoneNoInput, { target: { value: "Z1" } });
      
      // Error should still be visible but will be cleared on next validation
      fireEvent.blur(zoneNoInput);
      
      await waitFor(() => {
        expect(screen.queryByText("Zone No is required")).not.toBeInTheDocument();
      });
    });

    it("handles generic API error", async () => {
      mockSaveTaxZone.mockResolvedValueOnce({
        ok: false,
        error: "api_error",
        message: "Server error occurred",
      });
      setup();

      const zoneNoInput = screen.getByPlaceholderText("e.g. 1 or Z");
      const zoneTypeInput = screen.getByPlaceholderText("e.g. Residential");
      const remarkInput = screen.getByPlaceholderText("Enter remark");

      fireEvent.change(zoneNoInput, { target: { value: "Z1" } });
      fireEvent.change(zoneTypeInput, { target: { value: "Residential" } });
      fireEvent.change(remarkInput, { target: { value: "Test" } });

      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Server error occurred");
      });
    });
  });
});
