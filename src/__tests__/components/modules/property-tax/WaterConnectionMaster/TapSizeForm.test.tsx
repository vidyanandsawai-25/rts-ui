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
      <IntlProvider locale="en" messages={{}} onError={() => {}}>
        <TapSizeForm id={null} />
      </IntlProvider>
    );
    expect(document.getElementById("tap-size-form")).toBeInTheDocument();
  });

  it("has a maximum length of 2 on size field", () => {
    const { container } = render(
      <IntlProvider locale="en" messages={{}} onError={() => {}}>
        <TapSizeForm id={null} />
      </IntlProvider>
    );
    const sizeInput = container.querySelector("#tap-size-name");
    expect(sizeInput).toHaveAttribute("maxlength", "2");
  });
});
