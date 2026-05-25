import { render, screen } from "@testing-library/react";
import { TapTypeMaster } from "@/components/modules/property-tax/WaterConnectionMaster/TapTypeMaster";

describe("TapTypeMaster", () => {
  it("renders without crashing", () => {
    const data = { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 1, hasPrevious: false, hasNext: false };
    render(<TapTypeMaster data={data} />);
    expect(screen.getByText(/tap type/i)).toBeInTheDocument();
  });
});
