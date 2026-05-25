import { render, screen } from "@testing-library/react";
import { TapTypeForm } from "@/components/modules/property-tax/WaterConnectionMaster/TapTypeForm";

describe("TapTypeForm", () => {
  it("renders without crashing", () => {
    render(<TapTypeForm id={null} />);
    expect(screen.getByRole("form")).toBeInTheDocument();
  });
});
