import { render, screen } from "@testing-library/react";
import { TapSizeForm } from "@/components/modules/property-tax/WaterConnectionMaster/TapSizeForm";

describe("TapSizeForm", () => {
  it("renders without crashing", () => {
    render(<TapSizeForm />);
    expect(screen.getByRole("form")).toBeInTheDocument();
  });
});
