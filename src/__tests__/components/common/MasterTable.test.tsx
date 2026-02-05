import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MasterTable, MasterTableProps, Column } from "@/components/common/MasterTable";
import { NextIntlClientProvider } from "next-intl";

describe("MasterTable", () => {
  const mockMessages = {
    table: {
      columns: { actions: "Actions" },
      showingEntries: "Showing {start}-{end} of {total}",
      page: "Page {current} of {total}",
    },
    messages: { noData: "No data available" },
    actions: { loading: "Loading..." },
  };

  type Row = { id: number; name: string; status?: string };
  const columns: Column<Row>[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "status", label: "Status", isStatus: true },
  ];
  const data: Row[] = [
    { id: 1, name: "Alice", status: "active" },
    { id: 2, name: "Bob", status: "inactive" },
  ];

  function setup(props: Partial<MasterTableProps<Row>> = {}, messages = mockMessages) {
    return render(
      <NextIntlClientProvider locale="en" messages={{ common: messages }}>
        <MasterTable
          columns={columns}
          data={data}
          pageNumber={1}
          pageSize={10}
          totalCount={2}
          totalPages={1}
          onPageChange={() => {}}
          {...props}
        />
      </NextIntlClientProvider>
    );
  }

  it("renders table headers and rows", () => {
    setup();
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("shows loading text when loading", () => {
    setup({ loading: true });
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows empty text when no data", () => {
    setup({ data: [] });
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("renders action buttons if onEdit/onDelete provided", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    setup({ onEdit, onDelete });
    expect(screen.getByText("Actions")).toBeInTheDocument();
    // Should render Edit and Delete buttons (by role or label)
    expect(screen.getAllByRole("button").length).toBeGreaterThanOrEqual(2);
  });

  it("calls onEdit and onDelete when buttons clicked", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    setup({ onEdit, onDelete });
    const buttons = screen.getAllByRole("button");
    // Find Edit and Delete by aria-label or order
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);
    expect(onEdit).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalled();
  });

  it("renders header and footer content", () => {
    setup({ headerTitle: "Table Title", headerSubtitle: "Subtitle", headerExtra: <span>Extra</span>, footerLeftContent: <span>Left</span>, footerRightContent: <span>Right</span> });
    expect(screen.getByText("Table Title")).toBeInTheDocument();
    expect(screen.getByText("Subtitle")).toBeInTheDocument();
    expect(screen.getByText("Extra")).toBeInTheDocument();
    expect(screen.getByText("Left")).toBeInTheDocument();
    expect(screen.getByText("Right")).toBeInTheDocument();
  });

  it("shows correct pagination info", () => {
    setup({ pageNumber: 1, pageSize: 10, totalCount: 2, totalPages: 1 });
    expect(screen.getByText(/Showing 1-2 of 2/)).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument();
  });

  it("calls onPageChange when pagination buttons clicked", () => {
    const onPageChange = vi.fn();
    setup({ pageNumber: 2, pageSize: 1, totalCount: 2, totalPages: 2, onPageChange });
    // Prev, Next, First, Last, PageNumber buttons
    const buttons = screen.getAllByRole("button");
    buttons.forEach(btn => fireEvent.click(btn));
    expect(onPageChange).toHaveBeenCalled();
  });

  it("renders custom row key and row className", () => {
    setup({ getRowKey: (row) => `row-${row.id}`, rowClassName: () => "custom-row" });
    const rows = screen.getAllByRole("row");
    // At least one row should have custom class
    expect(rows.some(row => row.className.includes("custom-row"))).toBe(true);
  });
});
