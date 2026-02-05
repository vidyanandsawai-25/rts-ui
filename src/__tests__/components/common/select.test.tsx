
import { render, fireEvent, screen } from "@testing-library/react";
// Add this as the first line
import { describe, it, expect } from "vitest";
// ...existing code...
import { vi } from "vitest";
import { Select, Option } from "@/components/common/select";

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
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
  });

  it("selects option and calls onChange", () => {
    const handleChange = vi.fn();
    render(<Select options={options} onChange={handleChange} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Banana"));
    expect(handleChange).toHaveBeenCalledWith("banana");
    // Should close dropdown
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("does not select disabled option", () => {
    const handleChange = vi.fn();
    render(<Select options={options} onChange={handleChange} />);
    fireEvent.click(screen.getByRole("button"));
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
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("cursor-not-allowed");
  });

  it("closes dropdown on blur", () => {
    render(<Select options={options} />);
    const selectDiv = screen.getByRole("button").parentElement;
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.blur(selectDiv!);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
