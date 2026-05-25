import { render, screen } from "@testing-library/react";
import { TapSizeMaster } from "@/components/modules/property-tax/WaterConnectionMaster/TapSizeMaster";

describe("TapSizeMaster", () => {
  it("renders without crashing", () => {
    const data = { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 1, hasPrevious: false, hasNext: false };
    render(<TapSizeMaster data={data} />);
    expect(screen.getByText(/tap size/i)).toBeInTheDocument();
  });
});
