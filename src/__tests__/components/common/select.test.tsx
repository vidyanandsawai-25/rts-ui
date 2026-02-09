import { render, fireEvent, screen, act } from "@testing-library/react";
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { Select, Option } from "@/components/common/select";

// Mock scrollIntoView for all tests
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = function() {};
});

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Select", () => {
  const options: Option[] = [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Cherry", value: "cherry", disabled: true },
  ];

  it("renders placeholder when no value", () => {
    render(<Select options={options} placeholder="Pick one" />);
    expect(screen.getByText("Pick one")).toBeInTheDocument();
  });

  it("renders selected value label", () => {
    render(<Select options={options} value="banana" />);
    expect(screen.getByText("Banana")).toBeInTheDocument();
  });

  it("opens dropdown on button click", () => {
    render(<Select options={options} />);
    fireEvent.click(screen.getByTestId("select-button"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
  });

  it("selects option and calls onChange", () => {
    const handleChange = vi.fn();
    render(<Select options={options} onChange={handleChange} />);
    fireEvent.click(screen.getByTestId("select-button"));
    fireEvent.click(screen.getByText("Banana"));
    expect(handleChange).toHaveBeenCalledWith("banana");
    // Should close dropdown
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("does not select disabled option", () => {
    const handleChange = vi.fn();
    render(<Select options={options} onChange={handleChange} />);
    fireEvent.click(screen.getByTestId("select-button"));
    fireEvent.click(screen.getByText("Cherry"));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("applies custom className", () => {
    const { container } = render(<Select options={options} className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders with selectSize 'sm' and 'md'", () => {
    const { rerender, container } = render(<Select options={options} selectSize="sm" />);
    expect(container.querySelector("button")).toHaveClass("h-8");
    rerender(<Select options={options} selectSize="md" />);
    expect(container.querySelector("button")).toHaveClass("h-10");
  });

  it("renders as disabled", () => {
    render(<Select options={options} disabled />);
    const button = screen.getByTestId("select-button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("cursor-not-allowed");
  });

  it("closes dropdown on blur", () => {
    render(<Select options={options} />);
    const selectDiv = screen.getByTestId("select-root");
    fireEvent.click(screen.getByTestId("select-button"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.blur(selectDiv);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("navigates options with ArrowDown/ArrowUp and selects with Enter", async () => {
    const handleChange = vi.fn();
    render(<Select options={options} onChange={handleChange} />);
    fireEvent.click(screen.getByTestId("select-button"));
    const button = screen.getByTestId("select-button");

    // ArrowDown highlights first option
    fireEvent.keyDown(button, { key: "ArrowDown" });
    await act(async () => { vi.runOnlyPendingTimers(); });
    const appleOption = screen.getByTestId("select-option-0");
    expect(appleOption).toHaveClass("bg-blue-200");

    // ArrowDown highlights second option
    fireEvent.keyDown(button, { key: "ArrowDown" });
    await act(async () => { vi.runOnlyPendingTimers(); });
    const bananaOption = screen.getByTestId("select-option-1");
    expect(bananaOption).toHaveClass("bg-blue-200");

    // ArrowUp goes back to first option
    fireEvent.keyDown(button, { key: "ArrowUp" });
    await act(async () => { vi.runOnlyPendingTimers(); });
    expect(appleOption).toHaveClass("bg-blue-200");

    // Enter selects highlighted option
    fireEvent.keyDown(button, { key: "Enter" });
    expect(handleChange).toHaveBeenCalledWith("apple");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("skips disabled options during keyboard navigation", async () => {
    render(<Select options={options} />);
    fireEvent.click(screen.getByTestId("select-button"));
    const button = screen.getByTestId("select-button");

    // ArrowDown to Apple
    fireEvent.keyDown(button, { key: "ArrowDown" });
    await act(async () => { vi.runOnlyPendingTimers(); });
    const appleOption = screen.getByTestId("select-option-0");
    expect(appleOption).toHaveClass("bg-blue-200");

    // ArrowDown to Banana
    fireEvent.keyDown(button, { key: "ArrowDown" });
    await act(async () => { vi.runOnlyPendingTimers(); });
    const bananaOption = screen.getByTestId("select-option-1");
    expect(bananaOption).toHaveClass("bg-blue-200");

    // ArrowDown should skip Cherry (disabled) and wrap to Apple
    fireEvent.keyDown(button, { key: "ArrowDown" });
    await act(async () => { vi.runOnlyPendingTimers(); });
    expect(appleOption).toHaveClass("bg-blue-200");
  });

  it("closes dropdown with Escape key", () => {
    render(<Select options={options} />);
    fireEvent.click(screen.getByTestId("select-button"));
    const button = screen.getByTestId("select-button");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.keyDown(button, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("aria-activedescendant updates during navigation", async () => {
    render(<Select options={options} />);
    fireEvent.click(screen.getByTestId("select-button"));
    const button = screen.getByTestId("select-button");

    fireEvent.keyDown(button, { key: "ArrowDown" });
    await act(async () => { vi.runOnlyPendingTimers(); });
    expect(button.getAttribute("aria-activedescendant")).toContain("option-0");

    fireEvent.keyDown(button, { key: "ArrowDown" });
    await act(async () => { vi.runOnlyPendingTimers(); });
    expect(button.getAttribute("aria-activedescendant")).toContain("option-1");
  });

  it("highlights first enabled option when first option is disabled and opening with keyboard", async () => {
    const optionsWithDisabledFirst: Option[] = [
      { label: "Disabled1", value: "disabled1", disabled: true },
      { label: "Disabled2", value: "disabled2", disabled: true },
      { label: "Enabled", value: "enabled" },
    ];
    render(<Select options={optionsWithDisabledFirst} />);
    const button = screen.getByTestId("select-button");

    // Open dropdown with ArrowDown key (not click)
    fireEvent.keyDown(button, { key: "ArrowDown" });
    await act(async () => { vi.runOnlyPendingTimers(); });

    // Should highlight the first ENABLED option (index 2), not the disabled first option
    const enabledOption = screen.getByTestId("select-option-2");
    expect(enabledOption).toHaveClass("bg-blue-200");
  });

  it("highlights first enabled option when value is invalid and opening with keyboard", async () => {
    render(<Select options={options} value="nonexistent" />);
    const button = screen.getByTestId("select-button");

    // Open dropdown with ArrowDown key
    fireEvent.keyDown(button, { key: "ArrowDown" });
    await act(async () => { vi.runOnlyPendingTimers(); });

    // Should highlight the first enabled option (Apple at index 0)
    const appleOption = screen.getByTestId("select-option-0");
    expect(appleOption).toHaveClass("bg-blue-200");
  });
});
