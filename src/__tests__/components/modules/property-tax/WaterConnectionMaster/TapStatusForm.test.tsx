import { render, screen } from "@testing-library/react";
import { NextIntlProvider } from "next-intl";
import { TapStatusForm } from "@/components/modules/property-tax/WaterConnectionMaster/TapStatusForm";

describe("TapStatusForm", () => {
  it("renders without crashing", () => {
    render(
      <NextIntlProvider locale="en" messages={{}}>
        <TapStatusForm id={null} />
      </NextIntlProvider>
    );
    expect(screen.getByRole("form")).toBeInTheDocument();
  });
});
