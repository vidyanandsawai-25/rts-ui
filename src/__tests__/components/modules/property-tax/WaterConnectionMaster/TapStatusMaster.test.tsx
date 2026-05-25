import { render, screen } from "@testing-library/react";
import { TapStatusMaster } from "@/components/modules/property-tax/WaterConnectionMaster/TapStatusMaster";

describe("TapStatusMaster", () => {
  it("renders without crashing", () => {
    const data = { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 1, hasPrevious: false, hasNext: false };
    render(<TapStatusMaster data={data} />);
    expect(screen.getByText(/tap status/i)).toBeInTheDocument();
  });
});
