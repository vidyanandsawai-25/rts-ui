import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AssetGrievanceCategoryFormFields } from "@/components/modules/assets/configuration/master-data/grievance-category-master/AssetGrievanceCategoryFormFields";

describe("AssetGrievanceCategoryFormFields", () => {
  const t = (key: string) => {
    const labels: Record<string, string> = {
      "form.fields.name": "Category Name",
      "form.fields.namePlaceholder": "Enter name",
      "form.fields.sla": "SLA Days",
      "form.fields.slaPlaceholder": "Enter SLA",
      "form.fields.description": "Description",
      "form.fields.descPlaceholder": "Enter description",
    };
    return labels[key] ?? key;
  };

  const defaultProps = {
    categoryNameRef: React.createRef<HTMLInputElement>(),
    formData: {
      categoryName: "",
      description: "",
      resolutionSlaDays: NaN,
      isActive: true,
    },
    slaValue: "",
    errors: {},
    showError: () => false,
    handleChange: vi.fn(),
    handleBlur: vi.fn(),
    t,
  };

  it("renders labels and placeholders correctly", () => {
    render(<AssetGrievanceCategoryFormFields {...defaultProps} />);
    expect(screen.getByPlaceholderText("Enter name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter SLA")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter description")).toBeInTheDocument();
  });

  it("renders validation messages when showError resolves to true", () => {
    render(
      <AssetGrievanceCategoryFormFields
        {...defaultProps}
        errors={{ categoryName: "Name is required" }}
        showError={(field) => field === "categoryName"}
      />
    );
    expect(screen.getByText("Name is required")).toBeInTheDocument();
  });

  it("calls handleChange on input edit", () => {
    render(<AssetGrievanceCategoryFormFields {...defaultProps} />);
    const nameInput = screen.getByPlaceholderText("Enter name");
    fireEvent.change(nameInput, { target: { value: "Category A" } });
    expect(defaultProps.handleChange).toHaveBeenCalled();
  });
});
