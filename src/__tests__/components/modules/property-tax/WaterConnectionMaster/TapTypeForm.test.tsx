import { render, screen } from "@testing-library/react";
import { TapTypeForm } from "@/components/modules/property-tax/WaterConnectionMaster/TapTypeForm";

describe("TapTypeForm", () => {
  it("renders without crashing", () => {
    render(<TapTypeForm />);
    expect(screen.getByRole("form")).toBeInTheDocument();
  });
});
