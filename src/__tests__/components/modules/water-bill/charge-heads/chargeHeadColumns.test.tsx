import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { getChargeHeadColumns } from "@/components/modules/water-bill/charge-heads/chargeHeadColumns";
import type { ChargeHead } from "@/types/waterBill/chargeHeads.types";

describe("chargeHeadColumns Tests", () => {
  const mockT = (key: string) => key;
  const mockTCommon = (key: string) => key;

  const sampleRow: ChargeHead = {
    id: 1,
    code: "WTR_CHG",
    name: "Water Supply Charge",
    chargeType: "Charge",
    isTax: true,
    isPenalty: false,
    isRefundable: true,
    isActive: true,
  };

  it("should return the correct number of column definitions", () => {
    const columns = getChargeHeadColumns(mockT, mockTCommon);
    expect(columns.length).toBe(7);
  });

  it("should render code, name, and chargeType cell values", () => {
    const columns = getChargeHeadColumns(mockT, mockTCommon);

    expect(columns[0].key).toBe("code");
    expect(columns[1].key).toBe("name");
    expect(columns[2].key).toBe("chargeType");
  });

  it("should format boolean flags (isTax, isPenalty, isRefundable) using StatusBadge", () => {
    const columns = getChargeHeadColumns(mockT, mockTCommon);

    const taxCol = columns.find((c) => c.key === "isTax");
    const penaltyCol = columns.find((c) => c.key === "isPenalty");
    const refundableCol = columns.find((c) => c.key === "isRefundable");

    expect(taxCol?.render).toBeDefined();
    expect(penaltyCol?.render).toBeDefined();
    expect(refundableCol?.render).toBeDefined();

    if (taxCol?.render) {
      const { container } = render(<>{taxCol.render(true, sampleRow, 0)}</>);
      expect(container.firstChild).toBeInTheDocument();
    }

    if (penaltyCol?.render) {
      const { container } = render(<>{penaltyCol.render(false, sampleRow, 0)}</>);
      expect(container.firstChild).toBeInTheDocument();
    }
  });

  it("should work correctly without translation functions", () => {
    const columns = getChargeHeadColumns();
    expect(columns.length).toBe(7);
    expect(columns[0].label).toBe("Code");
    expect(columns[1].label).toBe("Name");
  });
});
