import { vi, describe, test, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AssetRoomTypeForm from "@/components/modules/assets/configuration/master-data/asset-room-type-master/AssetRoomTypeForm";

const mockBack = vi.fn();
const mockPush = vi.fn();
const mockRefresh = vi.fn();

// Mock next-intl
vi.mock("next-intl", () => {
  const t = (key: string) => `assetRoomType.${key}`;
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
vi.mock("@/hooks/asset-masters/assetroomtype/useAssetRoomForm", () => ({
  useAssetRoomForm: () => ({
    formData: {
      roomTypeCode: "ROOM_CODE",
      roomTypeName: "Test Room",
      description: "Test description",
      isActive: true,
      assetTypeId: 2,
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

  const mockTypes = [{ id: 2, name: "Type 2" }];
  const mockCategories = [{ id: 1, name: "Category 1" }];

  test("renders form inputs and selectors correctly", () => {
    render(
      <AssetRoomTypeForm
        id={null}
        categories={mockCategories}
        types={mockTypes}
      />
    );

    expect(screen.getByLabelText("assetRoomType.form.fields.roomTypeCode.label *")).toBeInTheDocument();
    expect(screen.getByLabelText("assetRoomType.form.fields.roomTypeName.label *")).toBeInTheDocument();
  });
});
