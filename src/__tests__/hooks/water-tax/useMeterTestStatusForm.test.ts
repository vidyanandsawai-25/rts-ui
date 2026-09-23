import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useMeterTestStatusForm } from "@/hooks/water-tax/meter-test-status-master/useMeterTestStatusForm";
import { useTranslations } from "next-intl";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}));

describe("useMeterTestStatusForm", () => {
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
    const { result } = renderHook(() => useMeterTestStatusForm(defaultProps));

    expect(result.current.isEdit).toBe(false);
    expect(result.current.formData.code).toBe("");
    expect(result.current.formData.meterTestStatus).toBe("");
    expect(result.current.formData.isActive).toBe(true);
  });

  it("should initialize with initial data in edit mode", () => {
    const initialData = {
      id: 10,
      code: "PENDING",
      meterTestStatusCode: "PENDING",
      meterTestStatus: "Pending",
      isActive: true,
    };

    const { result } = renderHook(() =>
      useMeterTestStatusForm({ ...defaultProps, initialData })
    );

    expect(result.current.isEdit).toBe(true);
    expect(result.current.formData.code).toBe("PENDING");
    expect(result.current.formData.meterTestStatus).toBe("Pending");
  });

  it("should sanitize code input by removing special characters and converting to uppercase", () => {
    const { result } = renderHook(() => useMeterTestStatusForm(defaultProps));

    act(() => {
      result.current.handleCodeChange("pass#123@!");
    });

    expect(result.current.formData.code).toBe("PASS123");
    expect(result.current.formData.meterTestStatusCode).toBe("PASS123");
  });

  it("should sanitize status name input by removing special characters", () => {
    const { result } = renderHook(() => useMeterTestStatusForm(defaultProps));

    act(() => {
      result.current.handleStatusNameChange("Passed Test #1");
    });

    expect(result.current.formData.meterTestStatus).toBe("Passed Test 1");
  });

  it("should toggle active status", () => {
    const { result } = renderHook(() => useMeterTestStatusForm(defaultProps));

    act(() => {
      result.current.handleToggleStatus(false);
    });

    expect(result.current.formData.isActive).toBe(false);
  });

  it("should validate required fields on submit", async () => {
    const { result } = renderHook(() => useMeterTestStatusForm(defaultProps));

    await act(async () => {
      const e = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.handleSubmit(e);
    });

    expect(result.current.errors.code).toBe("validation.codeRequired");
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should call onSubmit and onClose when form is valid", async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    const { result } = renderHook(() => useMeterTestStatusForm(defaultProps));

    act(() => {
      result.current.handleCodeChange("PASS");
      result.current.handleStatusNameChange("Pass");
    });

    await act(async () => {
      const e = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.handleSubmit(e);
    });

    expect(mockOnSubmit).toHaveBeenCalledWith({
      code: "PASS",
      meterTestStatusCode: "PASS",
      meterTestStatus: "Pass",
      isActive: true,
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should catch errors thrown by onSubmit without closing modal", async () => {
    mockOnSubmit.mockRejectedValue(new Error("Record with this code or status name already exists. Please use unique values."));
    const { result } = renderHook(() => useMeterTestStatusForm(defaultProps));

    act(() => {
      result.current.handleCodeChange("PENDING");
      result.current.handleStatusNameChange("Pending");
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
