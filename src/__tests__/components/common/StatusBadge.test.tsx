import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusBadge } from "@/components/common/StatusBadge";

describe("StatusBadge", () => {
  it("renders active status with default label", () => {
    render(<StatusBadge value="active" />);
    const badge = screen.getByText("Active").closest('span');
    expect(badge).toHaveClass("bg-emerald-50");
  });

  it("renders inactive status with default label", () => {
    render(<StatusBadge value="inactive" />);
    const badge = screen.getByText("Inactive").closest('span');
    expect(badge).toHaveClass("bg-rose-50");
  });

  it("renders custom active/inactive labels", () => {
    render(<StatusBadge value="active" activeLabel="Enabled" inactiveLabel="Disabled" />);
    expect(screen.getByText("Enabled")).toBeInTheDocument();
    // Render separately for inactive
    render(<StatusBadge value="inactive" activeLabel="Enabled" inactiveLabel="Disabled" />);
    expect(screen.getByText("Disabled")).toBeInTheDocument();
  });

  it("handles numeric value 1 as active", () => {
    render(<StatusBadge value={1} />);
    const badge = screen.getByText("Active").closest('span');
    expect(badge).toHaveClass("bg-emerald-50");
  });

  it("handles boolean true as active", () => {
    render(<StatusBadge value={true} />);
    const badge = screen.getByText("Active").closest('span');
    expect(badge).toHaveClass("bg-emerald-50");
  });

  it("handles numeric value 0 as inactive", () => {
    render(<StatusBadge value={0} />);
    const badge = screen.getByText("Inactive").closest('span');
    expect(badge).toHaveClass("bg-rose-50");
  });

  it("handles boolean false as inactive", () => {
    render(<StatusBadge value={false} />);
    const badge = screen.getByText("Inactive").closest('span');
    expect(badge).toHaveClass("bg-rose-50");
  });

  it("renders correct icon for active", () => {
    render(<StatusBadge value="active" />);
    const badge = screen.getByText("Active").closest('span');
    const icon = badge?.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("w-3");
  });

  it("renders correct icon for inactive", () => {
    render(<StatusBadge value="inactive" />);
    const badge = screen.getByText("Inactive").closest('span');
    const icon = badge?.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("w-3");
  });
});
