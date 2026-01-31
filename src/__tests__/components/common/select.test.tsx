
import { render, fireEvent, screen } from "@testing-library/react";
// Add this as the first line
import { describe, it, expect } from "vitest";
// ...existing code...
import { vi } from "vitest";
import { Select, Option } from "@/components/common/select";

describe("Select", () => {
  const options: Option[] = [
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" },
    { label: "Option 3", value: "3", disabled: true },
  ];

  it("renders with placeholder", () => {
    render(<Select options={options} placeholder="Pick one" />);
    expect(screen.getByText("Pick one")).toBeInTheDocument();
  });

  it("shows options on click and selects value", () => {
    const handleChange = vi.fn();
    render(<Select options={options} onChange={handleChange} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Option 2"));
    expect(handleChange).toHaveBeenCalledWith("2");
  });

  it("does not select disabled option", () => {
    const handleChange = vi.fn();
    render(<Select options={options} onChange={handleChange} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Option 3"));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("shows selected value", () => {
    render(<Select options={options} value="1" />);
    expect(screen.getByText("Option 1")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Select options={options} className="custom-select" />
    );
    expect(container.firstChild).toHaveClass("custom-select");
  });
});
