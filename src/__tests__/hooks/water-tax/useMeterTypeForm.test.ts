import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useMeterTypeForm } from "@/hooks/water-tax/meter-type-master/useMeterTypeForm";
import { useTranslations } from "next-intl";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}));

describe("useMeterTypeForm", () => {
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
    const { result } = renderHook(() => useMeterTypeForm(defaultProps));

    expect(result.current.isEdit).toBe(false);
    expect(result.current.formData.code).toBe("");
    expect(result.current.formData.meterType).toBe("");
    expect(result.current.formData.description).toBe("");
    expect(result.current.formData.isActive).toBe(true);
  });

  it("should initialize with initial data in edit mode", () => {
    const initialData = {
      id: 20,
      code: "AMR",
      meterTypeCode: "AMR",
      meterType: "AMR Meter",
      description: "Automatic Meter Reading",
      isActive: true,
    };

    const { result } = renderHook(() =>
      useMeterTypeForm({ ...defaultProps, initialData })
    );

    expect(result.current.isEdit).toBe(true);
    expect(result.current.formData.code).toBe("AMR");
    expect(result.current.formData.meterType).toBe("AMR Meter");
    expect(result.current.formData.description).toBe("Automatic Meter Reading");
  });

  it("should sanitize code input by removing special characters and converting to uppercase", () => {
    const { result } = renderHook(() => useMeterTypeForm(defaultProps));

    act(() => {
      result.current.handleCodeChange("ultra_sound#1!");
    });

    expect(result.current.formData.code).toBe("ULTRASOUND1");
  });

  it("should sanitize meter type name input", () => {
    const { result } = renderHook(() => useMeterTypeForm(defaultProps));

    act(() => {
      result.current.handleMeterTypeChange("Ultrasonic Meter <v2>");
    });

    expect(result.current.formData.meterType).toBe("Ultrasonic Meter v2");
  });

  it("should update description", () => {
    const { result } = renderHook(() => useMeterTypeForm(defaultProps));

    act(() => {
      result.current.handleDescriptionChange("High precision ultrasonic flow sensor");
    });

    expect(result.current.formData.description).toBe("High precision ultrasonic flow sensor");
  });

  it("should validate required fields on submit", async () => {
    const { result } = renderHook(() => useMeterTypeForm(defaultProps));

    await act(async () => {
      const e = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.handleSubmit(e);
    });

    expect(result.current.errors.code).toBe("validation.codeRequired");
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should call onSubmit and onClose when form is valid", async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    const { result } = renderHook(() => useMeterTypeForm(defaultProps));

    act(() => {
      result.current.handleCodeChange("MECH");
      result.current.handleMeterTypeChange("Mechanical Meter");
      result.current.handleDescriptionChange("Standard dial meter");
    });

    await act(async () => {
      const e = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.handleSubmit(e);
    });

    expect(mockOnSubmit).toHaveBeenCalledWith({
      code: "MECH",
      meterTypeCode: "MECH",
      meterType: "Mechanical Meter",
      description: "Standard dial meter",
      isActive: true,
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should catch errors thrown by onSubmit without closing modal", async () => {
    mockOnSubmit.mockRejectedValue(new Error("Record with this code or type name already exists. Please use unique values."));
    const { result } = renderHook(() => useMeterTypeForm(defaultProps));

    act(() => {
      result.current.handleCodeChange("MECH");
      result.current.handleMeterTypeChange("Mechanical Meter");
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
