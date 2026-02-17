import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
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

  /* 
     Helper to render the component with default props appropriate for testing.
     We default isPagination to true here to match the behavior expected 
     by most existing tests (checking pagination presence).
  */
  function setup(props: Partial<MasterTableProps<Row>> = {}, messages = mockMessages) {
    const defaultProps = {
      columns,
      data,
      pageNumber: 1,
      pageSize: 10,
      totalCount: 2,
      totalPages: 1,
      onPageChange: vi.fn(),
      isPagination: true,
      ...props
    };

    return render(
      <NextIntlClientProvider locale="en" messages={{ common: messages }}>
        <MasterTable {...defaultProps} />
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
    const buttons = screen.getAllByRole("button");
    // Should render Edit and Delete buttons. 
    // Since isPagination is true by default in setup, pagination buttons might also be present.
    // 2 rows * 2 actions = 4 action buttons at least.
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });

  it("calls onEdit and onDelete when buttons clicked", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    setup({ onEdit, onDelete });

    // Select specific action buttons to ensure we aren't clicking pagination
    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });

    // Click first edit button
    fireEvent.click(editButtons[0]);
    expect(onEdit).toHaveBeenCalledWith(data[0]);

    // Click second delete button
    fireEvent.click(deleteButtons[1]);
    expect(onDelete).toHaveBeenCalledWith(data[1]);
  });

  it("renders header and footer content", () => {
    setup({ headerTitle: "Table Title", headerSubtitle: "Subtitle", headerExtra: <span>Extra</span>, footerLeftContent: <span>Left</span>, footerRightContent: <span>Right</span> });
    expect(screen.getByText("Table Title")).toBeInTheDocument();
    expect(screen.getByText("Subtitle")).toBeInTheDocument();
    expect(screen.getByText("Extra")).toBeInTheDocument();
    expect(screen.getByText("Left")).toBeInTheDocument();
    expect(screen.getByText("Right")).toBeInTheDocument();
  });

  it("shows correct pagination info when isPagination is true", () => {
    setup({ pageNumber: 1, pageSize: 10, totalCount: 2, totalPages: 1, isPagination: true });
    expect(screen.getByText(/Showing 1-2 of 2/)).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument();
  });

  it("calls onPageChange when pagination buttons clicked", () => {
    const onPageChange = vi.fn();
    setup({ pageNumber: 2, pageSize: 1, totalCount: 2, totalPages: 2, onPageChange, isPagination: true });

    const prevBtn = screen.getByRole("button", { name: /Go to previous page/i });
    fireEvent.click(prevBtn);
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("renders custom row key and row className", () => {
    setup({ getRowKey: (row) => `row-${row.id}`, rowClassName: () => "custom-row" });
    // Assuming standard table render, check for class on tr
    // We can't easily query by row key unless it's an ID, but we can check the class
    const table = screen.getByRole("table");
    // The rows are inside tbody
    const rows = table.querySelectorAll("tbody tr");
    expect(rows[0]).toHaveClass("custom-row");
  });

  it("does not render pagination when isPagination is false", () => {
    setup({ isPagination: false });
    // "Showing X-Y of Z" text should not be present
    const paginationText = screen.queryByText(/Showing/);
    expect(paginationText).not.toBeInTheDocument();

    // Pagination buttons should not be present
    const prevBtn = screen.queryByRole("button", { name: /Go to previous page/i });
    expect(prevBtn).not.toBeInTheDocument();
  });

  it("does not render pagination when paging props are missing (isPagination defaults to undefined)", () => {
    // Manually render without setup helper to avoid default props
    render(
      <NextIntlClientProvider locale="en" messages={{ common: mockMessages }}>
        <MasterTable
          columns={columns}
          data={data}
        // No pagination props provided
        />
      </NextIntlClientProvider>
    );

    const paginationText = screen.queryByText(/Showing/);
    expect(paginationText).not.toBeInTheDocument();
  });

  it("applies containerClassName to the outer wrapper", () => {
    const { container } = setup({ containerClassName: "my-custom-container" });
    // The first child of the render result should be the wrapper div
    expect(container.firstChild).toHaveClass("my-custom-container");
  });
  it("calls onPageSizeChange when page size dropdown changes", () => {
    const onPageSizeChange = vi.fn();
    setup({
      isPageSize: true,
      pageSize: 10,
      onPageSizeChange,
      totalCount: 100,
      isPagination: true
    });

    const selects = screen.getAllByRole("combobox");
    // Depending on layout, there might be multiple dropdowns (top/bottom)
    // We'll target the first one found or iterate
    fireEvent.change(selects[0], { target: { value: "20" } });

    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });

  it("does not render page size dropdown when isPageSize is false", () => {
    setup({
      isPageSize: false,
      pageSize: 10,
      totalCount: 100
    });

    // Look for the select element which shouldn't exist
    const select = screen.queryByRole("combobox");
    expect(select).not.toBeInTheDocument();
  });

  it("renders page size dropdown when isPageSize is true", () => {
    setup({
      isPageSize: true,
      pageSize: 10,
      totalCount: 100,
      isPagination: true
    });

    expect(screen.getAllByRole("combobox")[0]).toBeInTheDocument();
  });

  it("renders standalone page size dropdown when isPagination is false but isPageSize is true", () => {
    setup({
      isPagination: false,
      isPageSize: true,
      pageSize: 10,
      totalCount: 100
    });

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders page size dropdown with custom pageSizeOptions", () => {
    setup({
      isPageSize: true,
      pageSize: 10,
      pageSizeOptions: [5, 15, 25],
      totalCount: 100,
      isPagination: true
    });

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent("5");
    expect(options[1]).toHaveTextContent("15");
    expect(options[2]).toHaveTextContent("25");
  });
});
