import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useReadingSourceForm } from "@/hooks/water-tax/reading-source-master/useReadingSourceForm";
import { useTranslations } from "next-intl";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}));

describe("useReadingSourceForm", () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const defaultProps = {
    open: true,
    initialData: null,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTranslations).mockReturnValue(((key: string) => key) as unknown as ReturnType<typeof useTranslations>);
  });

  it("should initialize default form values in create mode", () => {
    const { result } = renderHook(() => useReadingSourceForm(defaultProps));

    expect(result.current.isEdit).toBe(false);
    expect(result.current.formData.code).toBe("");
    expect(result.current.formData.readingSource).toBe("");
    expect(result.current.formData.isActive).toBe(true);
  });

  it("should initialize with initial data in edit mode", () => {
    const initialData = {
      id: 30,
      code: "FIELD",
      readingSourceCode: "FIELD",
      readingSource: "Field Inspection",
      isActive: true,
    };

    const { result } = renderHook(() =>
      useReadingSourceForm({ ...defaultProps, initialData })
    );

    expect(result.current.isEdit).toBe(true);
    expect(result.current.formData.code).toBe("FIELD");
    expect(result.current.formData.readingSource).toBe("Field Inspection");
  });

  it("should sanitize code input by removing special characters and converting to uppercase", () => {
    const { result } = renderHook(() => useReadingSourceForm(defaultProps));

    act(() => {
      result.current.handleCodeChange("import_file#1");
    });

    expect(result.current.formData.code).toBe("IMPORTFILE1");
  });

  it("should sanitize reading source name input", () => {
    const { result } = renderHook(() => useReadingSourceForm(defaultProps));

    act(() => {
      result.current.handleSourceNameChange("Field Visit (2026)");
    });

    expect(result.current.formData.readingSource).toBe("Field Visit 2026");
  });

  it("should validate required fields on submit", async () => {
    const { result } = renderHook(() => useReadingSourceForm(defaultProps));

    await act(async () => {
      const e = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.handleSubmit(e);
    });

    expect(result.current.errors.code).toBe("validation.codeRequired");
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should call onSubmit and onClose when form is valid", async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    const { result } = renderHook(() => useReadingSourceForm(defaultProps));

    act(() => {
      result.current.handleCodeChange("FIELD");
      result.current.handleSourceNameChange("Field Inspection");
    });

    await act(async () => {
      const e = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.handleSubmit(e);
    });

    expect(mockOnSubmit).toHaveBeenCalledWith({
      code: "FIELD",
      readingSourceCode: "FIELD",
      readingSource: "Field Inspection",
      isActive: true,
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should catch errors thrown by onSubmit without closing modal", async () => {
    mockOnSubmit.mockRejectedValue(new Error("Record with this code or source name already exists. Please use unique values."));
    const { result } = renderHook(() => useReadingSourceForm(defaultProps));

    act(() => {
      result.current.handleCodeChange("FIELD");
      result.current.handleSourceNameChange("Field Inspection");
    });

    await act(async () => {
      const e = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.handleSubmit(e);
    });

    expect(mockOnSubmit).toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
    expect(result.current.isSubmitting).toBe(false);
  });
});
