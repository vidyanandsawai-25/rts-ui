import { render, screen } from "@testing-library/react";
import { IntlProvider } from "next-intl";
import { TapTypeMaster } from "@/components/modules/property-tax/WaterConnectionMaster/TapTypeMaster";

describe("TapTypeMaster", () => {
  it("renders without crashing", () => {
    const data = { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 1, hasPrevious: false, hasNext: false };
    render(
      <IntlProvider locale="en" messages={{}}>
        <TapTypeMaster data={data} />
      </IntlProvider>
    );
    expect(screen.getByText(/tap type/i)).toBeInTheDocument();
  });
});
