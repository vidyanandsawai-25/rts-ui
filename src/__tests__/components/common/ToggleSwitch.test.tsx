import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ToggleSwitch } from "@/components/common/ToggleSwitch";

describe("ToggleSwitch", () => {
  it("renders with label", () => {
    render(<ToggleSwitch checked={false} onChange={() => {}} label="Status" />);
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("renders switch button", () => {
    render(<ToggleSwitch checked={false} onChange={() => {}} />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });


  it("calls onChange(checked) when toggled (new signature)", () => {
    const handleChange = vi.fn();
    render(<ToggleSwitch checked={false} onChange={handleChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange() when toggled (legacy signature)", () => {
    let called = false;
    function legacyChange() { called = true; }
    render(<ToggleSwitch checked={false} onChange={legacyChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(called).toBe(true);
  });

  it("shows popup when toggled and hides after timeout", async () => {
    vi.useFakeTimers();
    render(<ToggleSwitch checked={false} onChange={() => {}} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(screen.getByText("Active")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("shows 'Inactive' popup when toggling off", () => {
    render(<ToggleSwitch checked={true} onChange={() => {}} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("does not show popup if showPopup is false", () => {
    render(<ToggleSwitch checked={false} onChange={() => {}} showPopup={false} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
  });

  it("switch thumb moves when checked", () => {
    render(<ToggleSwitch checked={true} onChange={() => {}} />);
    const thumb = screen.getByRole("switch").querySelector("span");
    expect(thumb).toHaveAttribute("data-state", "checked");
  });

  it("switch thumb moves when unchecked", () => {
    render(<ToggleSwitch checked={false} onChange={() => {}} />);
    const thumb = screen.getByRole("switch").querySelector("span");
    expect(thumb).toHaveAttribute("data-state", "unchecked");
  });
});
