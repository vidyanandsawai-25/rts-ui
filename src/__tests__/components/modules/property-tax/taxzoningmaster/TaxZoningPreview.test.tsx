import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TaxZoningPreview } from "@/components/modules/property-tax/taxzoningmaster/TaxZoningPreview";
import { NextIntlClientProvider } from "next-intl";
import { TaxZone, Ward } from "@/types/taxzoning.types";

describe("TaxZoningPreview", () => {
  const mockProps = {
    t: (key: string) => key,
    previewData: [],
    pagedPreviewData: [],
    previewColumns: [],
    previewPage: 1,
    setPreviewPage: vi.fn(),
    PREVIEW_PAGE_SIZE: 5,
    zone: "",
    ward: [],
    fromProps: "",
    toProps: "",
    taxZones: { items: [], pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 0, hasPrevious: false, hasNext: false },
    wardsData: { items: [], pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 0, hasPrevious: false, hasNext: false },
  };

  const renderWithIntl = (component: React.ReactNode) => {
    return render(
      <NextIntlClientProvider locale="en" messages={{}}>
        {component}
      </NextIntlClientProvider>
    );
  };

  it("renders preview title and empty state", () => {
    renderWithIntl(<TaxZoningPreview {...mockProps} />);
    
    expect(screen.getByText(/preview\.title/i)).toBeInTheDocument();
    expect(screen.getByText(/preview\.noPropertiesToPreview/i)).toBeInTheDocument();
  });

  it("renders current selection summary", () => {
    const propsWithSelection = {
      ...mockProps,
      zone: "1",
      ward: ["1"],
      fromProps: "001",
      toProps: "005",
      taxZones: {
        ...mockProps.taxZones,
        items: [{ taxZoneId: 1, taxZoneNo: "TZ1" } as unknown as TaxZone]
      },
      wardsData: {
        ...mockProps.wardsData,
        items: [{ wardId: 1, wardNo: "W1" } as unknown as Ward]
      }
    };
    renderWithIntl(<TaxZoningPreview {...propsWithSelection} />);
    
    expect(screen.getByText("TZ1")).toBeInTheDocument();
    expect(screen.getByText("W1")).toBeInTheDocument();
    expect(screen.getByText("001 → 005")).toBeInTheDocument();
  });

  it("shows property count in header", () => {
    const propsWithData = {
      ...mockProps,
      previewData: [{ taxZoneNo: "1", wardNo: "1", propertyNo: "001" }]
    };
    renderWithIntl(<TaxZoningPreview {...propsWithData} />);
    expect(screen.getByText(/1.*columns\.propertyNo/i)).toBeInTheDocument();
  });
});
