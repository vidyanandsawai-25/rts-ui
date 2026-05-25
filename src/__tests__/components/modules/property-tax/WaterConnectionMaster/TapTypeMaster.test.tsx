import { render, screen } from "@testing-library/react";
import { NextIntlProvider } from "next-intl";
import { TapTypeMaster } from "@/components/modules/property-tax/WaterConnectionMaster/TapTypeMaster";

describe("TapTypeMaster", () => {
  it("renders without crashing", () => {
    const data = { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 1, hasPrevious: false, hasNext: false };
    render(
      <NextIntlProvider locale="en" messages={{}}>
        <TapTypeMaster data={data} />
      </NextIntlProvider>
    );
    expect(screen.getByText(/tap type/i)).toBeInTheDocument();
  });
});
