import { render, screen } from "@testing-library/react";
import { NextIntlProvider } from "next-intl";
import { TapTypeForm } from "@/components/modules/property-tax/WaterConnectionMaster/TapTypeForm";

describe("TapTypeForm", () => {
  it("renders without crashing", () => {
    render(
      <NextIntlProvider locale="en" messages={{}}>
        <TapTypeForm id={null} />
      </NextIntlProvider>
    );
    expect(screen.getByRole("form")).toBeInTheDocument();
  });
});
