import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { OldFloorDetails } from "@/components/modules/property-tax/ptis/reassement-screen/components/OldFloorDetails";
import { NextIntlClientProvider } from "next-intl";
import { MappedFloorDetail } from "@/types/reassessment.types";

const mockMessages = {
  reassessment: {
    floorDetails: {
      oldTitle: "Old Floor Details",
      columns: {
        floor: "Floor",
        conYear: "Con Year",
        asstYear: "Asst Year",
        constType: "Const Type",
        use: "Use",
        carpetArea: "Carpet Area",
        builtUpArea: "Built Up Area",
        rate: "Rate",
        renter: "Renter",
        taxLiability: "Tax Liability",
        rentMy: "Rent My",
        rentalValue: "Rental Value",
        depreciation: "Depreciation",
        alv: "ALV",
        mr: "MR",
        rv: "RV",
      },
    },
    buttons: {
      startAutoScroll: "Start Auto Scroll",
      stopAutoScroll: "Stop Auto Scroll",
    },
  },
};

describe("OldFloorDetails", () => {
  const mockData: MappedFloorDetail[] = [
    {
      floor: "GF",
      conYear: "2020",
      asstYear: "2021",
      constType: "RCC",
      use: "Residential",
      carpetAreaSqFt: 500,
      carpetAreaSqM: 46.45,
      builtUpAreaSqFt: 600,
      builtUpAreaSqM: 55.74,
      rate: 100,
      renter: "John Doe",
      taxLiability: "₹5000",
      rentMy: 10000,
      rentalValue: 120000,
      depreciation: 10,
      alv: 108000,
      mr: 100,
      rv: 120000,
    },
  ];

  function setup(data = mockData, isAutoScrolling = false, onToggleAutoScroll = vi.fn()) {
    return render(
      <NextIntlClientProvider locale="en" messages={mockMessages}>
        <OldFloorDetails
          data={data}
          isAutoScrolling={isAutoScrolling}
          onToggleAutoScroll={onToggleAutoScroll}
        />
      </NextIntlClientProvider>
    );
  }

  it("renders the component title", () => {
    setup();
    expect(screen.getByText("Old Floor Details")).toBeInTheDocument();
  });

  it("renders the floor data", () => {
    setup();
    expect(screen.getByText("GF")).toBeInTheDocument();
    expect(screen.getByText("2020")).toBeInTheDocument();
    expect(screen.getByText("Residential")).toBeInTheDocument();
  });

  it("calls onToggleAutoScroll when the button is clicked", () => {
    const onToggleAutoScroll = vi.fn();
    setup(mockData, false, onToggleAutoScroll);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(onToggleAutoScroll).toHaveBeenCalledTimes(1);
  });
});
