import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTapSizeForm } from "@/hooks/water-bill/tap-size-master/useTapSizeForm";
import * as actions from "@/app/[locale]/water-bill/tap-size-master/actions";
import { toast } from "sonner";

const mockRouterPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
  usePathname: () => "/en/water-bill/tap-size-master",
}));

vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string) => key,
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/app/[locale]/water-bill/tap-size-master/actions", () => ({
  createTapSizeAction: vi.fn(),
  updateTapSizeAction: vi.fn(),
}));

describe("useTapSizeForm Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes create form with default values", () => {
    const { result } = renderHook(() => useTapSizeForm(null));

    expect(result.current.isEdit).toBe(false);
    expect(result.current.formData).toEqual({
      tapSizeCode: "",
      tapSize: "",
      nominalSizeValue: "",
      sizeUnit: "",
      isActive: true,
    });
  });

  it("initializes edit form with formatted initial values", () => {
    const initialData = {
      id: 1,
      tapSizeCode: "TAP01",
      tapSize: "3/4 Inch",
      nominalSizeValue: 0.75,
      sizeUnit: "Inch",
      isActive: true,
    };
    const { result } = renderHook(() => useTapSizeForm(1, initialData));

    expect(result.current.isEdit).toBe(true);
    expect(result.current.formData.tapSizeCode).toBe("TAP01");
    expect(result.current.formData.tapSize).toBe("3/4 Inch");
    expect(result.current.formData.nominalSizeValue).toBe("0.75");
    expect(result.current.formData.sizeUnit).toBe("Inch");
  });

  it("validates all 4 required fields when values are empty", () => {
    const { result } = renderHook(() => useTapSizeForm(null));

    expect(result.current.errors.tapSizeCode).toBeDefined();
    expect(result.current.errors.tapSize).toBeDefined();
    expect(result.current.errors.nominalSizeValue).toBeDefined();
    expect(result.current.errors.sizeUnit).toBeDefined();
  });

  it("auto-populates nominalSizeValue and sizeUnit when tapSize is entered", () => {
    const { result } = renderHook(() => useTapSizeForm(null));

    act(() => {
      result.current.handleChange("tapSize", "1/2 Inch");
    });

    expect(result.current.formData.tapSize).toBe("1/2 Inch");
    expect(result.current.formData.nominalSizeValue).toBe("0.5");
    expect(result.current.formData.sizeUnit).toBe("Inch");
  });

  it("does not overwrite manually edited nominalSizeValue on subsequent tapSize changes", () => {
    const { result } = renderHook(() => useTapSizeForm(null));

    act(() => {
      result.current.handleChange("nominalSizeValue", "0.6");
    });

    act(() => {
      result.current.handleChange("tapSize", "3/4 Inch");
    });

    // nominalSizeValue should remain 0.6 because user edited it manually
    expect(result.current.formData.nominalSizeValue).toBe("0.6");
  });

  it("formats nominalSizeValue on blur (e.g. 0.750 -> 0.75)", () => {
    const { result } = renderHook(() => useTapSizeForm(null));

    act(() => {
      result.current.handleChange("nominalSizeValue", "0.750");
    });

    act(() => {
      result.current.handleBlur("nominalSizeValue");
    });

    expect(result.current.formData.nominalSizeValue).toBe("0.75");
  });

  it("submits create form and redirects on success", async () => {
    vi.mocked(actions.createTapSizeAction).mockResolvedValueOnce({
      success: true,
      data: { id: 10, tapSizeCode: "TAP10", tapSize: "1 Inch", isActive: true },
    });

    const { result } = renderHook(() => useTapSizeForm(null));

    act(() => {
      result.current.handleChange("tapSizeCode", "TAP10");
      result.current.handleChange("tapSize", "1 Inch");
      result.current.handleChange("nominalSizeValue", "1");
      result.current.handleChange("sizeUnit", "Inch");
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    expect(actions.createTapSizeAction).toHaveBeenCalledWith(
      expect.objectContaining({
        tapSizeCode: "TAP10",
        tapSize: "1 Inch",
        nominalSizeValue: "1",
        sizeUnit: "Inch",
        isActive: true,
      })
    );
    expect(toast.success).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith("/en/water-bill/tap-size-master");
  });

  it("submits update form and redirects on success", async () => {
    vi.mocked(actions.updateTapSizeAction).mockResolvedValueOnce({
      success: true,
      data: { id: 5, tapSizeCode: "TAP05", tapSize: "2 Inch", isActive: true },
    });

    const { result } = renderHook(() =>
      useTapSizeForm(5, {
        id: 5,
        tapSizeCode: "TAP05",
        tapSize: "2 Inch",
        nominalSizeValue: 2,
        sizeUnit: "Inch",
        isActive: true,
      })
    );

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    expect(actions.updateTapSizeAction).toHaveBeenCalledWith(5, expect.objectContaining({ tapSizeCode: "TAP05" }));
    expect(toast.success).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith("/en/water-bill/tap-size-master");
  });
});
