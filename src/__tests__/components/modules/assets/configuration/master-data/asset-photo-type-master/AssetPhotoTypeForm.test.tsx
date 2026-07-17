import { vi, describe, test, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AssetPhotoTypeForm from "@/components/modules/assets/configuration/master-data/asset-photo-type-master/AssetPhotoTypeForm";

const mockBack = vi.fn();
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next-intl", () => {
  const t = (key: string) => `assetPhotoType.${key}`;
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
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/hooks/asset-masters/assetphototype/useAssetPhotoForm", () => ({
  useAssetPhotoForm: () => ({
    formData: {
      photoTypeCode: "TEST_CODE",
      photoTypeName: "Test Name",
      description: "Test description",
      isActive: true,
      displayOrder: 1,
      assetCategoryId: 1,
      assetTypeId: null,
      isRequired: true,
      isSubUnit: false,
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
    t: (key: string) => `assetPhotoType.${key}`,
    tCommon: (key: string) => `common.${key}`,
    isEdit: false,
  }),
}));

describe("AssetPhotoTypeForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should render form elements correctly", () => {
    const categories = [{ id: 1, name: "Building" }];
    const assetTypes = [{ id: 1, name: "Structure" }];

    render(<AssetPhotoTypeForm id={null} categories={categories} types={assetTypes} />);

    expect(screen.getByLabelText("assetPhotoType.form.fields.photoTypeCode.label", { exact: false })).toBeInTheDocument();
    expect(screen.getByLabelText("assetPhotoType.form.fields.photoTypeName.label", { exact: false })).toBeInTheDocument();
    expect(screen.getByLabelText("assetPhotoType.form.fields.description.label", { exact: false })).toBeInTheDocument();
  });
});
