import { render, screen } from "@testing-library/react";
import { TapTypeMaster } from "@/components/modules/property-tax/WaterConnectionMaster/TapTypeMaster";

describe("TapTypeMaster", () => {
  it("renders without crashing", () => {
    render(<TapTypeMaster />);
    expect(screen.getByText(/tap type/i)).toBeInTheDocument();
  });
});
