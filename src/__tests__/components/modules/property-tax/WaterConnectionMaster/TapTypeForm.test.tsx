import { render, screen } from "@testing-library/react";
import { IntlProvider } from "next-intl";
import { TapTypeForm } from "@/components/modules/property-tax/WaterConnectionMaster/TapTypeForm";

describe("TapTypeForm", () => {
  it("renders without crashing", () => {
    render(
      <IntlProvider locale="en" messages={{}}>
        <TapTypeForm id={null} />
      </IntlProvider>
    );
    expect(screen.getByRole("form")).toBeInTheDocument();
  });
});
