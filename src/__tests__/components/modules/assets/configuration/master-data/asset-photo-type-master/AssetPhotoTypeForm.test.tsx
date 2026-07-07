import { vi, describe, test, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AssetPhotoTypeForm from "@/components/modules/assets/configuration/master-data/asset-photo-type-master/AssetPhotoTypeForm";

const mockBack = vi.fn();
const mockPush = vi.fn();
const mockRefresh = vi.fn();

// Mock next-intl
vi.mock("next-intl", () => {
  const t = (key: string) => `assetPhotoType.${key}`;
  return {
    useTranslations: () => t,
    useLocale: () => "en",
  };
});

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock hook
vi.mock("@/hooks/asset-masters/assetphototype/useAssetPhotoForm", () => ({
  useAssetPhotoForm: () => ({
    formData: {
      photoTypeCode: "TEST_CODE",
      photoTypeName: "Test Name",
      description: "Test description",
      displayOrder: 1,
      isActive: true,
      assetCategoryId: 1,
      assetTypeId: 2,
      isRequired: true,
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
    handleToggleRequired: vi.fn(),
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

  const mockCategories = [{ id: 1, name: "Cat 1" }];
  const mockTypes = [{ id: 2, name: "Type 2" }];

  test("renders form inputs and selectors correctly", () => {
    render(
      <AssetPhotoTypeForm
        id={null}
        categories={mockCategories}
        types={mockTypes}
      />
    );

    expect(screen.getByLabelText("assetPhotoType.form.fields.photoTypeCode.label *")).toBeInTheDocument();
    expect(screen.getByLabelText("assetPhotoType.form.fields.photoTypeName.label *")).toBeInTheDocument();
  });
});
