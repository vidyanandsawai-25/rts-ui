import { render, screen } from "@testing-library/react";
import { TapSizeMaster } from "@/components/modules/property-tax/WaterConnectionMaster/TapSizeMaster";

describe("TapSizeMaster", () => {
  it("renders without crashing", () => {
    render(<TapSizeMaster />);
    expect(screen.getByText(/tap size/i)).toBeInTheDocument();
  });
});
