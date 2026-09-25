import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CategoryStatusCard } from "@/components/modules/water-bill/connection-category-master/CategoryStatusCard";

describe("CategoryStatusCard Component", () => {
  it("renders active state correctly", () => {
    const handleChange = vi.fn();
    render(
      <CategoryStatusCard
        isActive={true}
        onChange={handleChange}
        title="Category Status"
        onLabel="Active - Enabled"
        offLabel="Inactive - Disabled"
      />
    );

    expect(screen.getByText("Category Status")).toBeInTheDocument();
    expect(screen.getByText("Active - Enabled")).toBeInTheDocument();
  });

  it("renders inactive state correctly", () => {
    const handleChange = vi.fn();
    render(
      <CategoryStatusCard
        isActive={false}
        onChange={handleChange}
        title="Category Status"
        onLabel="Active - Enabled"
        offLabel="Inactive - Disabled"
      />
    );

    expect(screen.getByText("Category Status")).toBeInTheDocument();
    expect(screen.getByText("Inactive - Disabled")).toBeInTheDocument();
  });

  it("triggers onChange when toggle switch is clicked", () => {
    const handleChange = vi.fn();
    render(
      <CategoryStatusCard
        isActive={true}
        onChange={handleChange}
        title="Category Status"
        onLabel="Active - Enabled"
        offLabel="Inactive - Disabled"
      />
    );

    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);
    expect(handleChange).toHaveBeenCalledWith(false);
  });
});
