import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { downloadDetailedRates } from "@/components/modules/property-tax/RVRateMaster/view/rateDownloadHelpers";
import { getDetailedRatesAction } from "@/app/[locale]/property-tax/rate-master/rvratemaster/action";
import { toast } from "sonner";
import type { ISelectOption, RateCategory } from "@/types/RVRateMaster";

// Mock dependencies
vi.mock("@/app/[locale]/property-tax/rate-master/rvratemaster/action", () => ({
  getDetailedRatesAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

describe("rateDownloadHelpers", () => {
  const mockZones: ISelectOption[] = [
    { value: "UTHALSAR", label: "UTHALSAR" },
    { value: "NAUPADA", label: "NAUPADA" },
  ];

  const mockRateCategories: RateCategory[] = [
    { constructionId: "1", constructionCode: "A", description: "RCC" },
    { constructionId: "2", constructionCode: "B", description: "Load Bearing" },
    { constructionId: "3", constructionCode: "C", description: "Mud" },
  ];

  const mockT = (key: string) => {
    const translations: Record<string, string> = {
      "messages.selectRateSection": "Please select a rate section",
      "messages.downloadingRates": "Downloading rates...",
      "messages.noRatesAvailable": "No rates available",
      "messages.ratesDownloaded": "Rates downloaded successfully",
      "messages.downloadFailed": "Failed to download rates",
      "downloadHeaders.rateSection": "Rate Section",
      "downloadHeaders.assessmentYearRange": "Assessment Year Range",
      "downloadHeaders.useGroup": "Use Group",
      "downloadHeaders.taxZoneNo": "Tax Zone No",
      "downloadHeaders.rateSqMtr": "Rate (₹/Sq.mtr)",
    };
    return translations[key] || key;
  };

  let createElementSpy: ReturnType<typeof vi.spyOn>;
  let appendChildSpy: ReturnType<typeof vi.spyOn>;
  let removeChildSpy: ReturnType<typeof vi.spyOn>;
  let originalBlob: typeof Blob;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Save original Blob
    originalBlob = global.Blob;

    // Mock DOM APIs
    const mockLink = {
      setAttribute: vi.fn(),
      click: vi.fn(),
      style: { visibility: "" },
    };

    createElementSpy = vi.spyOn(document, "createElement").mockReturnValue(mockLink as unknown as HTMLAnchorElement);
    appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation(() => mockLink as unknown as Node);
    removeChildSpy = vi.spyOn(document.body, "removeChild").mockImplementation(() => mockLink as unknown as Node);

    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore original Blob
    global.Blob = originalBlob;
  });

  describe("downloadDetailedRates", () => {
    it("should show error when no zone is selected", async () => {
      await downloadDetailedRates("", mockZones, mockT as unknown as ReturnType<typeof import("next-intl").useTranslations>, mockRateCategories);

      expect(toast.error).toHaveBeenCalledWith("Please select a rate section");
      expect(getDetailedRatesAction).not.toHaveBeenCalled();
    });

    it("should show error when zone is ALL", async () => {
      await downloadDetailedRates("ALL", mockZones, mockT as unknown as ReturnType<typeof import("next-intl").useTranslations>, mockRateCategories);

      expect(toast.error).toHaveBeenCalledWith("Please select a rate section");
      expect(getDetailedRatesAction).not.toHaveBeenCalled();
    });

    it("should show loading toast before fetching data", async () => {
      vi.mocked(getDetailedRatesAction).mockResolvedValue({ items: [] });

      await downloadDetailedRates("UTHALSAR", mockZones, mockT as unknown as ReturnType<typeof import("next-intl").useTranslations>, mockRateCategories);

      expect(toast.loading).toHaveBeenCalledWith("Downloading rates...");
    });

    it("should fetch rates with correct parameters", async () => {
      const mockRates = [
        {
          rateSection: "UTHALSAR",
          taxZone: "1",
          typeOfUseGroup: "Residential",
          yearRangeRV: "1700-1997",
          constructionType: "A",
          rateSquareMeter: 100,
        },
      ];

      vi.mocked(getDetailedRatesAction).mockResolvedValue({ items: mockRates });

      await downloadDetailedRates("UTHALSAR", mockZones, mockT as unknown as ReturnType<typeof import("next-intl").useTranslations>, mockRateCategories);

      expect(getDetailedRatesAction).toHaveBeenCalledWith("UTHALSAR", undefined, undefined, 1, -1);
    });

    it("should show error when no rates are available", async () => {
      vi.mocked(getDetailedRatesAction).mockResolvedValue({ items: [] });

      await downloadDetailedRates("UTHALSAR", mockZones, mockT as unknown as ReturnType<typeof import("next-intl").useTranslations>, mockRateCategories);

      expect(toast.dismiss).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("No rates available");
    });

    it("should download CSV file with correct structure", async () => {
      const mockRates = [
        {
          rateSection: "UTHALSAR",
          taxZone: "1",
          typeOfUseGroup: "निवासी",
          yearRangeRV: "1700-1997",
          constructionType: "A",
          rateSquareMeter: 96.88,
        },
        {
          rateSection: "UTHALSAR",
          taxZone: "1",
          typeOfUseGroup: "व्यावसायिक",
          yearRangeRV: "1700-1997",
          constructionType: "A",
          rateSquareMeter: 419.8,
        },
      ];

      vi.mocked(getDetailedRatesAction).mockResolvedValue({ items: mockRates });

      await downloadDetailedRates("UTHALSAR", mockZones, mockT as unknown as ReturnType<typeof import("next-intl").useTranslations>, mockRateCategories);

      expect(toast.success).toHaveBeenCalledWith("Rates downloaded successfully");
      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
    });

    it("should group rates by year range and use group", async () => {
      const mockRates = [
        {
          rateSection: "UTHALSAR",
          taxZone: "1",
          typeOfUseGroup: "निवासी",
          yearRangeRV: "1700-1997",
          constructionType: "A",
          rateSquareMeter: 96.88,
        },
        {
          rateSection: "UTHALSAR",
          taxZone: "1",
          typeOfUseGroup: "निवासी",
          yearRangeRV: "1998-1998",
          constructionType: "A",
          rateSquareMeter: 142.08,
        },
      ];

      vi.mocked(getDetailedRatesAction).mockResolvedValue({ items: mockRates });

      await downloadDetailedRates("UTHALSAR", mockZones, mockT as unknown as ReturnType<typeof import("next-intl").useTranslations>, mockRateCategories);

      expect(toast.success).toHaveBeenCalledWith("Rates downloaded successfully");
    });

    it("should include rate section, year range, and use group in columns", async () => {
      const mockRates = [
        {
          rateSection: "UTHALSAR",
          taxZone: "1",
          typeOfUseGroup: "निवासी",
          yearRangeRV: "1700-1997",
          constructionType: "A",
          rateSquareMeter: 96.88,
        },
      ];

      vi.mocked(getDetailedRatesAction).mockResolvedValue({ items: mockRates });

      await downloadDetailedRates("UTHALSAR", mockZones, mockT as unknown as ReturnType<typeof import("next-intl").useTranslations>, mockRateCategories);

      // Verify that the download was triggered
      const linkElement = createElementSpy.mock.results[0]?.value;
      expect(linkElement.setAttribute).toHaveBeenCalledWith("download", expect.stringContaining("Rate_Master_UTHALSAR"));
    });

    it("should handle download failure gracefully", async () => {
      vi.mocked(getDetailedRatesAction).mockRejectedValue(new Error("Network error"));

      await downloadDetailedRates("UTHALSAR", mockZones, mockT as unknown as ReturnType<typeof import("next-intl").useTranslations>, mockRateCategories);

      expect(toast.dismiss).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("Failed to download rates");
    });

    it("should create CSV with BOM for proper UTF-8 encoding", async () => {
      const mockRates = [
        {
          rateSection: "UTHALSAR",
          taxZone: "1",
          typeOfUseGroup: "निवासी",
          yearRangeRV: "1700-1997",
          constructionType: "A",
          rateSquareMeter: 96.88,
        },
      ];

      vi.mocked(getDetailedRatesAction).mockResolvedValue({ items: mockRates });

      let blobContent: string | undefined;
      global.Blob = class MockBlob {
        constructor(content: string[]) {
          blobContent = content[0];
        }
      } as unknown as typeof Blob;

      await downloadDetailedRates("UTHALSAR", mockZones, mockT as unknown as ReturnType<typeof import("next-intl").useTranslations>, mockRateCategories);

      expect(blobContent).toBeDefined();
      expect(typeof blobContent).toBe('string');
      expect(blobContent?.startsWith('\uFEFF')).toBe(true);
    });

    it("should sort tax zones numerically", async () => {
      const mockRates = [
        {
          rateSection: "UTHALSAR",
          taxZone: "10",
          typeOfUseGroup: "निवासी",
          yearRangeRV: "1700-1997",
          constructionType: "A",
          rateSquareMeter: 96.88,
        },
        {
          rateSection: "UTHALSAR",
          taxZone: "2",
          typeOfUseGroup: "निवासी",
          yearRangeRV: "1700-1997",
          constructionType: "A",
          rateSquareMeter: 96.88,
        },
        {
          rateSection: "UTHALSAR",
          taxZone: "1",
          typeOfUseGroup: "निवासी",
          yearRangeRV: "1700-1997",
          constructionType: "A",
          rateSquareMeter: 96.88,
        },
      ];

      vi.mocked(getDetailedRatesAction).mockResolvedValue({ items: mockRates });

      await downloadDetailedRates("UTHALSAR", mockZones, mockT as unknown as ReturnType<typeof import("next-intl").useTranslations>, mockRateCategories);

      expect(toast.success).toHaveBeenCalledWith("Rates downloaded successfully");
    });

    it("should handle multiple grids with different use groups", async () => {
      const mockRates = [
        {
          rateSection: "UTHALSAR",
          taxZone: "1",
          typeOfUseGroup: "निवासी",
          yearRangeRV: "1700-1997",
          constructionType: "A",
          rateSquareMeter: 96.88,
        },
        {
          rateSection: "UTHALSAR",
          taxZone: "1",
          typeOfUseGroup: "व्यावसायिक",
          yearRangeRV: "1700-1997",
          constructionType: "A",
          rateSquareMeter: 419.8,
        },
      ];

      vi.mocked(getDetailedRatesAction).mockResolvedValue({ items: mockRates });

      await downloadDetailedRates("UTHALSAR", mockZones, mockT as unknown as ReturnType<typeof import("next-intl").useTranslations>, mockRateCategories);

      expect(toast.success).toHaveBeenCalledWith("Rates downloaded successfully");
    });
  });
});
