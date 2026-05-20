import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAliasMasterPagination } from "@/hooks/configuration-settings/alias-master/useAliasMasterPagination";
import { SupportedLanguageCode } from "@/types/alias-master.types";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

function makeStartTransition() {
  return vi.fn((cb: () => void) => cb());
}

function makeProps(overrides = {}) {
  return {
    pageNumber: 1,
    pageSize: 10,
    totalCount: 50,
    locale: "en",
    resource: undefined,
    languages: [] as SupportedLanguageCode[],
    autoTranslate: false,
    startTransition: makeStartTransition(),
    ...overrides,
  };
}

describe("useAliasMasterPagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("buildUrl", () => {
    it("should build URL with page and pageSize", () => {
      const { result } = renderHook(() => useAliasMasterPagination(makeProps()));
      const url = result.current.buildUrl(2, 20);

      expect(url).toContain("/en/configuration-settings/alias-master");
      expect(url).toContain("page=2");
      expect(url).toContain("pageSize=20");
    });

    it("should include resource when provided", () => {
      const { result } = renderHook(() => useAliasMasterPagination(makeProps()));
      const url = result.current.buildUrl(1, 10, "common");

      expect(url).toContain("resource=common");
    });

    it("should omit resource when not provided", () => {
      const { result } = renderHook(() => useAliasMasterPagination(makeProps()));
      const url = result.current.buildUrl(1, 10);

      expect(url).not.toContain("resource=");
    });

    it("should include languages as multiple query params", () => {
      const { result } = renderHook(() => useAliasMasterPagination(makeProps()));
      const languages: SupportedLanguageCode[] = ["hi", "mr"];
      const url = result.current.buildUrl(1, 10, undefined, languages);

      expect(url).toContain("languages=hi");
      expect(url).toContain("languages=mr");
    });

    it("should handle empty languages array", () => {
      const { result } = renderHook(() => useAliasMasterPagination(makeProps()));
      const url = result.current.buildUrl(1, 10, undefined, []);

      // URL should not contain languages param
      expect(url.split("languages=").length).toBe(1);
    });

    it("should include autoTranslate when true", () => {
      const { result } = renderHook(() => useAliasMasterPagination(makeProps()));
      const url = result.current.buildUrl(1, 10, undefined, undefined, true);

      expect(url).toContain("autoTranslate=true");
    });

    it("should omit autoTranslate when false", () => {
      const { result } = renderHook(() => useAliasMasterPagination(makeProps()));
      const url = result.current.buildUrl(1, 10, undefined, undefined, false);

      expect(url).not.toContain("autoTranslate");
    });

    it("should handle all parameters together", () => {
      const { result } = renderHook(() => useAliasMasterPagination(makeProps()));
      const languages: SupportedLanguageCode[] = ["hi", "mr"];
      const url = result.current.buildUrl(3, 25, "validation", languages, true);

      expect(url).toContain("page=3");
      expect(url).toContain("pageSize=25");
      expect(url).toContain("resource=validation");
      expect(url).toContain("languages=hi");
      expect(url).toContain("languages=mr");
      expect(url).toContain("autoTranslate=true");
    });

    it("should use current resource from props when nextResource is undefined", () => {
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ resource: "common" }))
      );
      const url = result.current.buildUrl(1, 10);

      expect(url).toContain("resource=common");
    });

    it("should use current languages from props when nextLanguages is undefined", () => {
      const languages: SupportedLanguageCode[] = ["hi"];
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ languages }))
      );
      const url = result.current.buildUrl(1, 10);

      expect(url).toContain("languages=hi");
    });

    it("should use current autoTranslate from props when nextAutoTranslate is undefined", () => {
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ autoTranslate: true }))
      );
      const url = result.current.buildUrl(1, 10);

      expect(url).toContain("autoTranslate=true");
    });
  });

  describe("changePage", () => {
    it("should navigate to new page", () => {
      const startTransition = makeStartTransition();
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ startTransition }))
      );

      act(() => {
        result.current.changePage(3);
      });

      expect(startTransition).toHaveBeenCalledOnce();
      expect(mockPush).toHaveBeenCalledOnce();
      expect(mockPush.mock.calls[0][0]).toContain("page=3");
    });

    it("should preserve resource when changing page", () => {
      const startTransition = makeStartTransition();
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ startTransition, resource: "common" }))
      );

      act(() => {
        result.current.changePage(2);
      });

      expect(mockPush.mock.calls[0][0]).toContain("resource=common");
    });

    it("should preserve languages when changing page", () => {
      const startTransition = makeStartTransition();
      const languages: SupportedLanguageCode[] = ["hi", "mr"];
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ startTransition, languages }))
      );

      act(() => {
        result.current.changePage(2);
      });

      const url = mockPush.mock.calls[0][0];
      expect(url).toContain("languages=hi");
      expect(url).toContain("languages=mr");
    });

    it("should preserve autoTranslate when changing page", () => {
      const startTransition = makeStartTransition();
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ startTransition, autoTranslate: true }))
      );

      act(() => {
        result.current.changePage(2);
      });

      expect(mockPush.mock.calls[0][0]).toContain("autoTranslate=true");
    });

    it("should preserve pageSize when changing page", () => {
      const startTransition = makeStartTransition();
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ startTransition, pageSize: 25 }))
      );

      act(() => {
        result.current.changePage(2);
      });

      expect(mockPush.mock.calls[0][0]).toContain("pageSize=25");
    });
  });

  describe("handlePageSizeChange", () => {
    it("should reset to page 1 when page size changes", () => {
      const startTransition = makeStartTransition();
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ pageNumber: 3, startTransition }))
      );

      act(() => {
        result.current.handlePageSizeChange("25");
      });

      expect(startTransition).toHaveBeenCalledOnce();
      const url = mockPush.mock.calls[0][0];
      expect(url).toContain("page=1");
      expect(url).toContain("pageSize=25");
    });

    it("should preserve resource when changing page size", () => {
      const startTransition = makeStartTransition();
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ startTransition, resource: "validation" }))
      );

      act(() => {
        result.current.handlePageSizeChange("50");
      });

      expect(mockPush.mock.calls[0][0]).toContain("resource=validation");
    });

    it("should preserve languages when changing page size", () => {
      const startTransition = makeStartTransition();
      const languages: SupportedLanguageCode[] = ["hi"];
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ startTransition, languages }))
      );

      act(() => {
        result.current.handlePageSizeChange("20");
      });

      expect(mockPush.mock.calls[0][0]).toContain("languages=hi");
    });

    it("should preserve autoTranslate when changing page size", () => {
      const startTransition = makeStartTransition();
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ startTransition, autoTranslate: true }))
      );

      act(() => {
        result.current.handlePageSizeChange("15");
      });

      expect(mockPush.mock.calls[0][0]).toContain("autoTranslate=true");
    });

    it("should default to pageSize 10 for invalid values", () => {
      const startTransition = makeStartTransition();
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ startTransition }))
      );

      act(() => {
        result.current.handlePageSizeChange("invalid");
      });

      expect(mockPush.mock.calls[0][0]).toContain("pageSize=10");
    });

    it("should default to pageSize 10 for negative values", () => {
      const startTransition = makeStartTransition();
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ startTransition }))
      );

      act(() => {
        result.current.handlePageSizeChange("-5");
      });

      expect(mockPush.mock.calls[0][0]).toContain("pageSize=10");
    });

    it("should default to pageSize 10 for zero", () => {
      const startTransition = makeStartTransition();
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ startTransition }))
      );

      act(() => {
        result.current.handlePageSizeChange("0");
      });

      expect(mockPush.mock.calls[0][0]).toContain("pageSize=10");
    });

    it("should default to pageSize 10 for values exceeding MAX_PAGE_SIZE", () => {
      const startTransition = makeStartTransition();
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ startTransition }))
      );

      act(() => {
        result.current.handlePageSizeChange("99999");
      });

      expect(mockPush.mock.calls[0][0]).toContain("pageSize=10");
    });
  });

  describe("handleResourceChange", () => {
    it("should reset to page 1 and update resource", () => {
      const startTransition = makeStartTransition();
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ pageNumber: 3, startTransition }))
      );

      act(() => {
        result.current.handleResourceChange("validation");
      });

      expect(startTransition).toHaveBeenCalledOnce();
      const url = mockPush.mock.calls[0][0];
      expect(url).toContain("page=1");
      expect(url).toContain("resource=validation");
    });

    it("should preserve pageSize when changing resource", () => {
      const startTransition = makeStartTransition();
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ startTransition, pageSize: 25 }))
      );

      act(() => {
        result.current.handleResourceChange("common");
      });

      expect(mockPush.mock.calls[0][0]).toContain("pageSize=25");
    });

    it("should preserve languages when changing resource", () => {
      const startTransition = makeStartTransition();
      const languages: SupportedLanguageCode[] = ["hi", "mr"];
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ startTransition, languages }))
      );

      act(() => {
        result.current.handleResourceChange("validation");
      });

      const url = mockPush.mock.calls[0][0];
      expect(url).toContain("languages=hi");
      expect(url).toContain("languages=mr");
    });

    it("should preserve autoTranslate when changing resource", () => {
      const startTransition = makeStartTransition();
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ startTransition, autoTranslate: true }))
      );

      act(() => {
        result.current.handleResourceChange("common");
      });

      expect(mockPush.mock.calls[0][0]).toContain("autoTranslate=true");
    });
  });

  describe("handleLanguagesChange", () => {
    it("should reset to page 1 and update languages", () => {
      const startTransition = makeStartTransition();
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ pageNumber: 3, startTransition }))
      );

      const newLanguages: SupportedLanguageCode[] = ["hi", "mr"];

      act(() => {
        result.current.handleLanguagesChange(newLanguages);
      });

      expect(startTransition).toHaveBeenCalledOnce();
      const url = mockPush.mock.calls[0][0];
      expect(url).toContain("page=1");
      expect(url).toContain("languages=hi");
      expect(url).toContain("languages=mr");
    });

    it("should preserve resource when changing languages", () => {
      const startTransition = makeStartTransition();
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ startTransition, resource: "common" }))
      );

      const newLanguages: SupportedLanguageCode[] = ["hi"];

      act(() => {
        result.current.handleLanguagesChange(newLanguages);
      });

      expect(mockPush.mock.calls[0][0]).toContain("resource=common");
    });

    it("should preserve pageSize when changing languages", () => {
      const startTransition = makeStartTransition();
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ startTransition, pageSize: 25 }))
      );

      const newLanguages: SupportedLanguageCode[] = ["hi"];

      act(() => {
        result.current.handleLanguagesChange(newLanguages);
      });

      expect(mockPush.mock.calls[0][0]).toContain("pageSize=25");
    });

    it("should preserve autoTranslate when changing languages", () => {
      const startTransition = makeStartTransition();
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ startTransition, autoTranslate: true }))
      );

      const newLanguages: SupportedLanguageCode[] = ["mr"];

      act(() => {
        result.current.handleLanguagesChange(newLanguages);
      });

      expect(mockPush.mock.calls[0][0]).toContain("autoTranslate=true");
    });

    it("should handle empty languages array", () => {
      const startTransition = makeStartTransition();
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ startTransition }))
      );

      act(() => {
        result.current.handleLanguagesChange([]);
      });

      const url = mockPush.mock.calls[0][0];
      // Should not contain languages param when array is empty
      expect(url.split("languages=").length).toBe(1);
    });

    it("should handle all supported language codes", () => {
      const startTransition = makeStartTransition();
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ startTransition }))
      );

      const allLanguages: SupportedLanguageCode[] = ["hi", "mr"];

      act(() => {
        result.current.handleLanguagesChange(allLanguages);
      });

      const url = mockPush.mock.calls[0][0];
      expect(url).toContain("languages=hi");
      expect(url).toContain("languages=mr");
    });
  });

  describe("handleAutoTranslateChange", () => {
    it("should reset to page 1 and enable autoTranslate", () => {
      const startTransition = makeStartTransition();
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ pageNumber: 3, startTransition }))
      );

      act(() => {
        result.current.handleAutoTranslateChange(true);
      });

      expect(startTransition).toHaveBeenCalledOnce();
      const url = mockPush.mock.calls[0][0];
      expect(url).toContain("page=1");
      expect(url).toContain("autoTranslate=true");
    });

    it("should reset to page 1 and disable autoTranslate", () => {
      const startTransition = makeStartTransition();
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ pageNumber: 2, startTransition, autoTranslate: true }))
      );

      act(() => {
        result.current.handleAutoTranslateChange(false);
      });

      const url = mockPush.mock.calls[0][0];
      expect(url).toContain("page=1");
      expect(url).not.toContain("autoTranslate");
    });

    it("should preserve resource when changing autoTranslate", () => {
      const startTransition = makeStartTransition();
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ startTransition, resource: "validation" }))
      );

      act(() => {
        result.current.handleAutoTranslateChange(true);
      });

      expect(mockPush.mock.calls[0][0]).toContain("resource=validation");
    });

    it("should preserve languages when changing autoTranslate", () => {
      const startTransition = makeStartTransition();
      const languages: SupportedLanguageCode[] = ["hi"];
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ startTransition, languages }))
      );

      act(() => {
        result.current.handleAutoTranslateChange(true);
      });

      expect(mockPush.mock.calls[0][0]).toContain("languages=hi");
    });

    it("should preserve pageSize when changing autoTranslate", () => {
      const startTransition = makeStartTransition();
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ startTransition, pageSize: 25 }))
      );

      act(() => {
        result.current.handleAutoTranslateChange(true);
      });

      expect(mockPush.mock.calls[0][0]).toContain("pageSize=25");
    });
  });

  describe("paginationInfo", () => {
    it("should calculate correct pagination info for first page", () => {
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ pageNumber: 1, pageSize: 10, totalCount: 100 }))
      );

      expect(result.current.paginationInfo.start).toBe(1);
      expect(result.current.paginationInfo.end).toBe(10);
      expect(result.current.paginationInfo.total).toBe(100);
    });

    it("should calculate correct pagination info for middle page", () => {
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ pageNumber: 3, pageSize: 10, totalCount: 100 }))
      );

      expect(result.current.paginationInfo.start).toBe(21);
      expect(result.current.paginationInfo.end).toBe(30);
      expect(result.current.paginationInfo.total).toBe(100);
    });

    it("should calculate correct pagination info for last page with partial results", () => {
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ pageNumber: 10, pageSize: 10, totalCount: 95 }))
      );

      expect(result.current.paginationInfo.start).toBe(91);
      expect(result.current.paginationInfo.end).toBe(95);
      expect(result.current.paginationInfo.total).toBe(95);
    });

    it("should handle empty results", () => {
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ pageNumber: 1, pageSize: 10, totalCount: 0 }))
      );

      expect(result.current.paginationInfo.start).toBe(0);
      expect(result.current.paginationInfo.end).toBe(0);
      expect(result.current.paginationInfo.total).toBe(0);
    });

    it("should handle different page sizes", () => {
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ pageNumber: 2, pageSize: 25, totalCount: 100 }))
      );

      expect(result.current.paginationInfo.start).toBe(26);
      expect(result.current.paginationInfo.end).toBe(50);
      expect(result.current.paginationInfo.total).toBe(100);
    });

    it("should handle page size of 50", () => {
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ pageNumber: 1, pageSize: 50, totalCount: 75 }))
      );

      expect(result.current.paginationInfo.start).toBe(1);
      expect(result.current.paginationInfo.end).toBe(50);
      expect(result.current.paginationInfo.total).toBe(75);
    });

    it("should not exceed totalCount on last page", () => {
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ pageNumber: 3, pageSize: 10, totalCount: 22 }))
      );

      expect(result.current.paginationInfo.start).toBe(21);
      expect(result.current.paginationInfo.end).toBe(22);
      expect(result.current.paginationInfo.total).toBe(22);
    });

    it("should handle single item", () => {
      const { result } = renderHook(() =>
        useAliasMasterPagination(makeProps({ pageNumber: 1, pageSize: 10, totalCount: 1 }))
      );

      expect(result.current.paginationInfo.start).toBe(1);
      expect(result.current.paginationInfo.end).toBe(1);
      expect(result.current.paginationInfo.total).toBe(1);
    });
  });
});
