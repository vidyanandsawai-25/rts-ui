import { render, screen } from "@testing-library/react";
import { NextIntlProvider } from "next-intl";
import { TapSizeForm } from "@/components/modules/property-tax/WaterConnectionMaster/TapSizeForm";

describe("TapSizeForm", () => {
  it("renders without crashing", () => {
    render(
      <NextIntlProvider locale="en" messages={{}}>
        <TapSizeForm id={null} />
      </NextIntlProvider>
    );
    expect(screen.getByRole("form")).toBeInTheDocument();
  });
});
