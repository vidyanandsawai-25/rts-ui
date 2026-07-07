import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MandatoryFieldsNotice } from "@/components/modules/assets/configuration/master-data/asset-room-type-master/MandatoryFieldsNotice";

describe("MandatoryFieldsNotice", () => {
  test("renders the notice message", () => {
    render(<MandatoryFieldsNotice message="All fields are required" />);
    expect(screen.getByText("All fields are required")).toBeInTheDocument();
  });
});
