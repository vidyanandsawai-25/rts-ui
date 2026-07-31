import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { PendingAssessmentItems, SendToApproveData } from "@/types/automation-dashboard/assessment/assessmentgrid.type";
import SendToApproveDashboard from "@/components/modules/property-tax/automation-dashboard/Assessment/send-to-approve/SendToApproveDashboard";

// Mock next/navigation
const mockPush = vi.fn();
const mockBack = vi.fn();
const mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => "/en/property-tax",
}));

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock AutomationTable component to simplify testing
vi.mock("@/components/common/AutomationTable", () => ({
  AutomationTable: ({ data, headerExtra }: { data: SendToApproveData[]; headerExtra?: ReactNode }) => (
    <div data-testid="automation-table">
      {headerExtra}
      {data.map((row, idx) => (
        <div key={idx} data-testid={`table-row-${idx}`}>
          {row.propertyNo?.new}
        </div>
      ))}
    </div>
  ),
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("SendToApproveDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockServerData = {
    properties: [
      {
        propertyId: "123",
        propertyNo: "Property A",
        ownerName: "Owner A",
        occupierName: "Occupier A",
        flatOrShopName: "",
        category: "Category",
        propertyDescription: "Property Description",
        floorCount: 1,
        additionalRevenue: "0",
        propertyType: "R",
        address: "Address A",
        mobileNo: "1234567890",
        propertyDetailsComparison: null,
        qcChecklist: null,
      },
    ],
    zoneName: "Zone 1",
    totalCount: 1,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  } as unknown as PendingAssessmentItems;

  const mockZoneOptions = [{ value: "1", label: "Zone 1" }];
  const mockWardOptions = [{ value: "10", label: "Ward 10" }];
  const mockPropertyTypeOptions = [{ value: "all", label: "All" }];
  const mockPropertyDescriptionOptions = [{ value: "all", label: "All" }];
  const mockSurveyTypeOptions = [{ value: "all", label: "All" }];

  it("renders correctly with empty data", () => {
    render(
      <SendToApproveDashboard
        serverData={null}
        pageNumber={1}
        pageSize={10}
        zoneOptions={mockZoneOptions}
        wardOptions={mockWardOptions}
        propertyTypeOptions={mockPropertyTypeOptions}
        propertyDescriptionOptions={mockPropertyDescriptionOptions}
        surveyTypeOptions={mockSurveyTypeOptions}
      />
    );
    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
    expect(screen.queryByTestId("table-row-0")).not.toBeInTheDocument();
  });

  it("renders table with data correctly", () => {
    render(
      <SendToApproveDashboard
        serverData={mockServerData}
        pageNumber={1}
        pageSize={10}
        zoneOptions={mockZoneOptions}
        wardOptions={mockWardOptions}
        propertyTypeOptions={mockPropertyTypeOptions}
        propertyDescriptionOptions={mockPropertyDescriptionOptions}
        surveyTypeOptions={mockSurveyTypeOptions}
      />
    );
    
    // Check if table rows are rendered
    expect(screen.getByTestId("table-row-0")).toHaveTextContent("Property A");
  });

  it("navigates back when back button is clicked", () => {
    render(
      <SendToApproveDashboard
        serverData={null}
        pageNumber={1}
        pageSize={10}
        zoneOptions={mockZoneOptions}
        wardOptions={mockWardOptions}
        propertyTypeOptions={mockPropertyTypeOptions}
        propertyDescriptionOptions={mockPropertyDescriptionOptions}
        surveyTypeOptions={mockSurveyTypeOptions}
      />
    );
    
    const backButton = screen.getByRole("button", { name: /back/i });
    fireEvent.click(backButton);
    
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
