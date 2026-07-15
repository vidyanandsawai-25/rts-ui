import { vi, describe, test, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import DesignationForm from "@/components/modules/assets/configuration/master-data/designation-master/DesignationForm";

const mockBack = vi.fn();
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next-intl", () => {
  const t = (key: string) => `designation.${key}`;
  return {
    useTranslations: () => t,
    useLocale: () => "en",
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

vi.mock("@/hooks/asset-masters/designation/useDesignationForm", () => ({
  useDesignationForm: () => ({
    formData: {
      designationCode: "TEST_CODE",
      designationName: "Test Name",
      designationLocal: "Test Local",
      designationDescription: "Test description",
      isActive: true,
      owningDepartmentId: 1,
    },
    errors: {},
    isSubmitting: false,
    isActive: true,
    open: true,
    handleChange: vi.fn(),
    handleBlur: vi.fn(),
    handleSelectChange: vi.fn(),
    handleSubmit: vi.fn(),
    handleToggleStatus: vi.fn(),
    handleCancel: vi.fn(),
    showError: () => false,
    t: (key: string) => `designation.${key}`,
    tCommon: (key: string) => `common.${key}`,
    isEdit: false,
  }),
}));

describe("DesignationForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should render form elements correctly", () => {
    const departments = [{ id: 1, owningDepartmentName: "PWD", description: "Desc", isActive: true }];

    render(<DesignationForm id={null} departments={departments} />);

    expect(screen.getByLabelText("designation.form.fields.designationCode.label", { exact: false })).toBeInTheDocument();
    expect(screen.getByLabelText("designation.form.fields.designationName.label", { exact: false })).toBeInTheDocument();
    expect(screen.getByLabelText("designation.form.fields.designationLocal.label", { exact: false })).toBeInTheDocument();
    expect(screen.getByLabelText("designation.form.fields.designationDescription.label", { exact: false })).toBeInTheDocument();
  });
});
