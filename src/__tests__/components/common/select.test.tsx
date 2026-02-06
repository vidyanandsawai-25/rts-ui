import { render, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, beforeAll, vi } from "vitest";
import { Select, Option } from "@/components/common/select";

// Mock scrollIntoView for all tests
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = function() {};
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

  it("navigates options with ArrowDown/ArrowUp and selects with Enter", () => {
    const handleChange = vi.fn();
    render(<Select options={options} onChange={handleChange} />);
    fireEvent.click(screen.getByTestId("select-button"));
    const button = screen.getByTestId("select-button");

    // ArrowDown highlights first option
    fireEvent.keyDown(button, { key: "ArrowDown" });
    const appleOption = screen.getByTestId("select-option-0");
    expect(appleOption).toHaveClass("bg-blue-200");

    // ArrowDown highlights second option
    fireEvent.keyDown(button, { key: "ArrowDown" });
    const bananaOption = screen.getByTestId("select-option-1");
    expect(bananaOption).toHaveClass("bg-blue-200");

    // ArrowUp goes back to first option
    fireEvent.keyDown(button, { key: "ArrowUp" });
    expect(appleOption).toHaveClass("bg-blue-200");

    // Enter selects highlighted option
    fireEvent.keyDown(button, { key: "Enter" });
    expect(handleChange).toHaveBeenCalledWith("apple");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("skips disabled options during keyboard navigation", () => {
    render(<Select options={options} />);
    fireEvent.click(screen.getByTestId("select-button"));
    const button = screen.getByTestId("select-button");

    // ArrowDown to Apple
    fireEvent.keyDown(button, { key: "ArrowDown" });
    const appleOption = screen.getByTestId("select-option-0");
    expect(appleOption).toHaveClass("bg-blue-200");

    // ArrowDown to Banana
    fireEvent.keyDown(button, { key: "ArrowDown" });
    const bananaOption = screen.getByTestId("select-option-1");
    expect(bananaOption).toHaveClass("bg-blue-200");

    // ArrowDown should skip Cherry (disabled) and wrap to Apple
    fireEvent.keyDown(button, { key: "ArrowDown" });
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

  it("aria-activedescendant updates during navigation", () => {
    render(<Select options={options} />);
    fireEvent.click(screen.getByTestId("select-button"));
    const button = screen.getByTestId("select-button");

    fireEvent.keyDown(button, { key: "ArrowDown" });
    expect(button.getAttribute("aria-activedescendant")).toContain("option-0");

    fireEvent.keyDown(button, { key: "ArrowDown" });
    expect(button.getAttribute("aria-activedescendant")).toContain("option-1");
  });
});
