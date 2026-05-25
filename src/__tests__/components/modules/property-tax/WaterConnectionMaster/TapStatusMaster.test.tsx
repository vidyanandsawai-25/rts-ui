import { render, screen } from "@testing-library/react";
import { TapStatusMaster } from "@/components/modules/property-tax/WaterConnectionMaster/TapStatusMaster";

describe("TapStatusMaster", () => {
  it("renders without crashing", () => {
    render(<TapStatusMaster />);
    expect(screen.getByText(/tap status/i)).toBeInTheDocument();
  });
});
