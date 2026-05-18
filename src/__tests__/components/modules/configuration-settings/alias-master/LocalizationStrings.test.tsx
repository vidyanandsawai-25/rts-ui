import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LocalizationStrings } from "@/components/modules/configuration-settings/alias-master/LocalizationStrings";
import type { MultilingualTranslation, SupportedLanguageCode } from "@/types/alias-master.types";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

// Mock sonner toast
const mockToastInfo = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    info: (msg: string) => mockToastInfo(msg),
    success: (msg: string) => mockToastSuccess(msg),
    error: (msg: string) => mockToastError(msg),
  },
}));

// Mock actions
const mockBulkUpdateAction = vi.fn();

vi.mock("@/app/[locale]/configuration-settings/alias-master/action", () => ({
  bulkUpdateMultilingualTranslationsAction: (items: unknown) => mockBulkUpdateAction(items),
}));

// Mock pagination hook
const mockChangePage = vi.fn();
const mockHandlePageSizeChange = vi.fn();
const mockHandleResourceChange = vi.fn();
const mockHandleLanguagesChange = vi.fn();
const mockHandleAutoTranslateChange = vi.fn();

vi.mock("@/hooks/configuration-settings/alias-master/useAliasMasterPagination", () => ({
  useAliasMasterPagination: () => ({
    changePage: mockChangePage,
    handlePageSizeChange: mockHandlePageSizeChange,
    handleResourceChange: mockHandleResourceChange,
    handleLanguagesChange: mockHandleLanguagesChange,
    handleAutoTranslateChange: mockHandleAutoTranslateChange,
    paginationInfo: { start: 1, end: 10 },
  }),
}));

// Mock edits hook
const mockHandleCellChange = vi.fn();
const mockClearEdits = vi.fn();

vi.mock("@/hooks/configuration-settings/alias-master/useLocalizationStringsEdits", () => ({
  useLocalizationStringsEdits: () => ({
    edits: {},
    handleCellChange: mockHandleCellChange,
    clearEdits: mockClearEdits,
  }),
}));

// Mock save hook
const mockHandleSaveAll = vi.fn();

vi.mock("@/hooks/configuration-settings/alias-master/useLocalizationStringsSave", () => ({
  useLocalizationStringsSave: () => ({
    isSaving: false,
    handleSaveAll: mockHandleSaveAll,
  }),
}));

// Mock columns
vi.mock("@/components/modules/configuration-settings/alias-master/LocalizationStringsColumns", () => ({
  getLocalizationStringsColumns: () => [
    { key: "resource", label: "Resource", width: "15%", render: (value: unknown) => value },
    { key: "key", label: "Key", width: "20%", render: (value: unknown) => value },
    { key: "en_US", label: "English", width: "25%", render: (value: unknown) => value },
    { key: "hi_IN", label: "Hindi", width: "20%", render: (value: unknown) => value },
    { key: "mr_IN", label: "Marathi", width: "20%", render: (value: unknown) => value },
  ],
}));

// Mock filters component
vi.mock("@/components/modules/configuration-settings/alias-master/LocalizationStringsFilters", () => ({
  LocalizationStringsFilters: ({
    onResourceChange,
    onLanguagesChange,
    onAutoTranslateChange,
  }: {
    onResourceChange: (value: string) => void;
    onLanguagesChange: (values: SupportedLanguageCode[]) => void;
    onAutoTranslateChange: (enabled: boolean) => void;
  }) => (
    <div data-testid="filters">
      <button onClick={() => onResourceChange("common")}>Change Resource</button>
      <button onClick={() => onLanguagesChange(["hi"])}>Change Languages</button>
      <button onClick={() => onAutoTranslateChange(true)}>Toggle Auto Translate</button>
    </div>
  ),
}));

// Mock common components
vi.mock("@/components/common", () => ({
  MasterTable: ({ data, footerLeftContent }: { data: unknown[]; footerLeftContent: React.ReactNode }) => (
    <div data-testid="master-table">
      <div data-testid="table-data">{JSON.stringify(data)}</div>
      <div data-testid="footer-content">{footerLeftContent}</div>
    </div>
  ),
  SearchSelect: ({
    value,
    onChange,
    label,
  }: {
    value: string;
    onChange: (name: string, value: string) => void;
    options: { label: string; value: string }[];
    label?: string;
  }) => (
    <div data-testid="search-select">
      {label && <label>{label}</label>}
      <input
        data-testid="search-select-input"
        value={value}
        onChange={(e) => onChange("resource", e.target.value)}
      />
    </div>
  ),
  SaveButton: ({
    label,
    onClick,
    isLoading,
    disabled,
  }: {
    label: string;
    onClick: () => void;
    isLoading: boolean;
    disabled: boolean;
  }) => (
    <button
      data-testid="save-button"
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? "Loading..." : label}
    </button>
  ),
  Select: ({
    value,
    onChange,
    options,
    label,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { label: string; value: string }[];
    label?: string;
  }) => (
    <div data-testid="select-component">
      {label && <label>{label}</label>}
      <select data-testid="select-input" value={value} onChange={onChange}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
  TableHeader: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div data-testid="table-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  ),
}));

describe("LocalizationStrings", () => {
  const mockData: MultilingualTranslation[] = [
    {
      id: 1,
      resource: "common",
      key: "greeting",
      en_US: "Hello",
      hi_IN: "नमस्ते",
      mr_IN: "नमस्कार",
    },
    {
      id: 2,
      resource: "common",
      key: "goodbye",
      en_US: "Goodbye",
      hi_IN: "अलविदा",
      mr_IN: "निरोप",
    },
  ];

  const defaultProps = {
    data: mockData,
    pageNumber: 1,
    pageSize: 10,
    totalCount: 2,
    totalPages: 1,
    resources: ["common", "errors"],
    resource: "common",
    languages: ["hi", "mr"] as SupportedLanguageCode[],
    autoTranslationEnabled: true,
    autoTranslate: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockBulkUpdateAction.mockResolvedValue({ success: true });
  });

  describe("Rendering", () => {
    it("renders table header with title and subtitle", () => {
      render(<LocalizationStrings {...defaultProps} />);

      const header = screen.getByTestId("table-header");
      expect(header).toHaveTextContent("title");
      expect(header).toHaveTextContent("subtitle");
    });

    it("renders master table with data", () => {
      render(<LocalizationStrings {...defaultProps} />);

      const table = screen.getByTestId("master-table");
      expect(table).toBeInTheDocument();

      const tableData = screen.getByTestId("table-data");
      expect(tableData).toHaveTextContent("greeting");
      expect(tableData).toHaveTextContent("goodbye");
    });

    it("renders filters component", () => {
      render(<LocalizationStrings {...defaultProps} />);

      const filters = screen.getByTestId("filters");
      expect(filters).toBeInTheDocument();
    });

    it("renders save button", () => {
      render(<LocalizationStrings {...defaultProps} />);

      expect(screen.getByTestId("save-button")).toBeInTheDocument();
    });
  });

  describe("Filter interactions", () => {
    it("calls handleResourceChange when resource is changed", () => {
      render(<LocalizationStrings {...defaultProps} />);

      const button = screen.getByText("Change Resource");
      fireEvent.click(button);

      expect(mockHandleResourceChange).toHaveBeenCalledWith("common");
    });

    it("calls handleLanguagesChange when languages are changed", () => {
      render(<LocalizationStrings {...defaultProps} />);

      const button = screen.getByText("Change Languages");
      fireEvent.click(button);

      expect(mockHandleLanguagesChange).toHaveBeenCalledWith(["hi"]);
    });

    it("calls handleAutoTranslateChange when auto-translate is toggled", () => {
      render(<LocalizationStrings {...defaultProps} />);

      const button = screen.getByText("Toggle Auto Translate");
      fireEvent.click(button);

      expect(mockHandleAutoTranslateChange).toHaveBeenCalledWith(true);
    });
  });

  describe("Save functionality", () => {
    it("calls handleSaveAll when save button is clicked", () => {
      render(<LocalizationStrings {...defaultProps} />);

      const saveButton = screen.getByTestId("save-button");
      fireEvent.click(saveButton);

      expect(mockHandleSaveAll).toHaveBeenCalled();
    });
  });

  describe("Empty state", () => {
    it("renders with empty data array", () => {
      render(<LocalizationStrings {...defaultProps} data={[]} totalCount={0} />);

      const tableData = screen.getByTestId("table-data");
      expect(tableData).toHaveTextContent("[]");
    });
  });
});
