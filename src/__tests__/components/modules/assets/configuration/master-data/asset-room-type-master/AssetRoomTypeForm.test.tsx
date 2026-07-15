import { vi, describe, test, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AssetRoomTypeForm from "@/components/modules/assets/configuration/master-data/asset-room-type-master/AssetRoomTypeForm";

const mockBack = vi.fn();
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next-intl", () => {
  const t = (key: string) => `assetRoomType.${key}`;
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

vi.mock("@/hooks/asset-masters/assetroomtype/useAssetRoomForm", () => ({
  useAssetRoomForm: () => ({
    formData: {
      roomTypeCode: "TEST_CODE",
      roomTypeName: "Test Name",
      description: "Test description",
      isActive: true,
      assetCategoryId: 1,
      assetTypeId: null,
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
    t: (key: string) => `assetRoomType.${key}`,
    tCommon: (key: string) => `common.${key}`,
    isEdit: false,
  }),
}));

describe("AssetRoomTypeForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should render form elements correctly", () => {
    const categories = [{ id: 1, name: "Building", description: "Desc" }];
    const assetTypes = [{ id: 1, name: "Structure", description: "Desc" }];

    render(<AssetRoomTypeForm id={null} categories={categories} types={assetTypes} />);

    expect(screen.getByLabelText("assetRoomType.form.fields.roomTypeCode.label", { exact: false })).toBeInTheDocument();
    expect(screen.getByLabelText("assetRoomType.form.fields.roomTypeName.label", { exact: false })).toBeInTheDocument();
    expect(screen.getByLabelText("assetRoomType.form.fields.description.label", { exact: false })).toBeInTheDocument();
  });
});
