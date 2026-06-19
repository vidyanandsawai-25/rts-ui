import { vi } from "vitest";
import { render } from "@testing-library/react";
import { IntlProvider } from "next-intl";
import { TapSizeForm } from "@/components/modules/property-tax/WaterConnectionMaster/TapSizeForm";

vi.mock("@/app/[locale]/property-tax/water-connection-master/actions", () => ({
  createTapSizeAction: vi.fn(),
  updateTapSizeAction: vi.fn(),
}));

describe("TapSizeForm", () => {
  it("renders without crashing", () => {
    render(
      <IntlProvider locale="en" messages={{}}>
        <TapSizeForm id={null} />
      </IntlProvider>
    );
    expect(document.getElementById("tap-size-form")).toBeInTheDocument();
  });
});
