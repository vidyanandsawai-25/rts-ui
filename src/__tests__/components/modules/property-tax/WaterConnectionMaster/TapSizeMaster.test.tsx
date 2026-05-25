import { render, screen } from "@testing-library/react";
import { IntlProvider } from "next-intl";
import { TapSizeMaster } from "@/components/modules/property-tax/WaterConnectionMaster/TapSizeMaster";

describe("TapSizeMaster", () => {
  it("renders without crashing", () => {
    const data = { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 1, hasPrevious: false, hasNext: false };
    render(
      <IntlProvider locale="en" messages={{}}>
        <TapSizeMaster data={data} />
      </IntlProvider>
    );
    expect(screen.getByText(/tap size/i)).toBeInTheDocument();
  });
});
