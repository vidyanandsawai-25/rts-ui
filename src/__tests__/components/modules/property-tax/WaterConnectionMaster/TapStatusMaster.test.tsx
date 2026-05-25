import { render, screen } from "@testing-library/react";
import { NextIntlProvider } from "next-intl";
import { TapStatusMaster } from "@/components/modules/property-tax/WaterConnectionMaster/TapStatusMaster";

describe("TapStatusMaster", () => {
  it("renders without crashing", () => {
    const data = { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 1, hasPrevious: false, hasNext: false };
    render(
      <NextIntlProvider locale="en" messages={{}}>
        <TapStatusMaster data={data} />
      </NextIntlProvider>
    );
    expect(screen.getByText(/tap status/i)).toBeInTheDocument();
  });
});
