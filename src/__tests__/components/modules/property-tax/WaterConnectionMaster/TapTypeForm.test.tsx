import { render } from "@testing-library/react";
import { IntlProvider } from "next-intl";
import { TapTypeForm } from "@/components/modules/property-tax/WaterConnectionMaster/TapTypeForm";
import { ConfirmProvider } from "@/components/common/ConfirmProvider";

describe("TapTypeForm", () => {
  it("renders without crashing", () => {
    render(
      <IntlProvider
        locale="en"
        messages={{
          common: { save: "Save", cancel: "Cancel" },
          waterConnectionMaster: { tapType: { title: "Tap Type" } }
        }}
        onError={(err) => {
          if (err.code === 'MISSING_MESSAGE') return;
          console.error(err);
        }}
      >
        <ConfirmProvider>
          <TapTypeForm id={null} />
        </ConfirmProvider>
      </IntlProvider>
    );
    expect(document.getElementById("tap-type-form")).toBeInTheDocument();
  });
});
