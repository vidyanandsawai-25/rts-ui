import { render, screen } from "@testing-library/react";
import { TapStatusForm } from "@/components/modules/property-tax/WaterConnectionMaster/TapStatusForm";

describe("TapStatusForm", () => {
  it("renders without crashing", () => {
    render(<TapStatusForm />);
    expect(screen.getByRole("form")).toBeInTheDocument();
  });
});
