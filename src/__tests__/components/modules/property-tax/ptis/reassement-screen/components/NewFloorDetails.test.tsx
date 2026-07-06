import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NewFloorDetails } from "@/components/modules/property-tax/ptis/reassement-screen/components/NewFloorDetails";
import { NextIntlClientProvider } from "next-intl";
import { MappedFloorDetail } from "@/types/reassessment.types";

const mockMessages = {
  reassessment: {
    floorDetails: {
      newTitle: "New Floor Details",
      columns: {
        floor: "Floor",
        conYear: "Con Year",
        asstYear: "Asst Year",
        constType: "Const Type",
        use: "Use",
        carpetArea: "Carpet Area",
        builtUpArea: "Built Up Area",
        rate: "Rate",
        taxLiability: "Tax Liability",
        rentMy: "Rent My",
        rentalValue: "Rental Value",
        depreciation: "Depreciation",
        alv: "ALV",
        mr: "MR",
        rv: "RV",
        status: "Status",
      },
      statuses: {
        same: "Same",
        changed: "Changed",
        new: "New",
      },
    },
    buttons: {
      startAutoScroll: "Start Auto Scroll",
      stopAutoScroll: "Stop Auto Scroll",
    },
  },
};

describe("NewFloorDetails", () => {
  const mockData: MappedFloorDetail[] = [
    {
      floor: "GF",
      conYear: "2021",
      asstYear: "2022",
      constType: "RCC",
      use: "Commercial",
      carpetAreaSqFt: 600,
      carpetAreaSqM: 55.74,
      builtUpAreaSqFt: 700,
      builtUpAreaSqM: 65.03,
      rate: 120,
      renter: "Jane Doe",
      taxLiability: "₹7000",
      rentMy: 12000,
      rentalValue: 144000,
      depreciation: 10,
      alv: 129600,
      mr: 120,
      rv: 144000,
      status: "Changed",
    },
  ];

  function setup(data = mockData, isAutoScrolling = false, onToggleAutoScroll = vi.fn()) {
    return render(
      <NextIntlClientProvider locale="en" messages={mockMessages}>
        <NewFloorDetails
          data={data}
          isAutoScrolling={isAutoScrolling}
          onToggleAutoScroll={onToggleAutoScroll}
        />
      </NextIntlClientProvider>
    );
  }

  it("renders the component title", () => {
    setup();
    expect(screen.getByText("New Floor Details")).toBeInTheDocument();
  });

  it("renders the floor data", () => {
    setup();
    expect(screen.getByText("GF")).toBeInTheDocument();
    expect(screen.getByText("2021")).toBeInTheDocument();
    expect(screen.getByText("Commercial")).toBeInTheDocument();
  });

  it("renders the status correctly", () => {
    setup();
    expect(screen.getByText("Changed")).toBeInTheDocument();
  });

  it("calls onToggleAutoScroll when the button is clicked", () => {
    const onToggleAutoScroll = vi.fn();
    setup(mockData, false, onToggleAutoScroll);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(onToggleAutoScroll).toHaveBeenCalledTimes(1);
  });
});
