import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MatrixGrid, MatrixColumn, MatrixRow } from '@/components/common/MatrixGrid';

const mockTranslations = {
  action: 'Action',
  currencySymbol: '₹',
  deleteRow: 'Delete Row',
};

describe('MatrixGrid', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const columns: MatrixColumn[] = [
    { id: 'col1', label: 'Column 1', unit: 'kg' },
    { id: 'col2', label: 'Column 2' },
  ];

  const metaColumns = [
    { id: 'meta1', label: 'Meta 1' },
  ];

  const rows: MatrixRow[] = [
    {
      id: 'row1',
      cells: { col1: 10, col2: 20 },
      meta: { meta1: 'Meta Value 1' },
    },
    {
      id: 'row2',
      cells: { col1: 30, col2: 40 },
      meta: { meta1: 'Meta Value 2' },
    },
  ];

  it('renders correctly with required props', () => {
    render(<MatrixGrid columns={columns} rows={rows} translations={mockTranslations} />);
    
    expect(screen.getByText('Column 1')).toBeInTheDocument();
    expect(screen.getByText('(kg)')).toBeInTheDocument();
    expect(screen.getByText('Column 2')).toBeInTheDocument();
    
    // All cells are now MatrixCellInput (inputs), so check values via inputs
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs).toHaveLength(4); // 2 rows × 2 columns
    expect(inputs[0]).toHaveValue(10);
    expect(inputs[1]).toHaveValue(20);
  });

  it('renders meta columns correctly', () => {
    render(<MatrixGrid columns={columns} rows={rows} metaColumns={metaColumns} translations={mockTranslations} />);
    
    expect(screen.getByText('Meta 1')).toBeInTheDocument();
    expect(screen.getByText('Meta Value 1')).toBeInTheDocument();
    expect(screen.getByText('Meta Value 2')).toBeInTheDocument();
  });

  it('renders action column when onRowDelete is provided', () => {
    const onRowDelete = vi.fn();
    render(<MatrixGrid columns={columns} rows={rows} onRowDelete={onRowDelete} translations={mockTranslations} />);
    
    expect(screen.getByText('Action')).toBeInTheDocument();
    const deleteButtons = screen.getAllByRole('button');
    expect(deleteButtons).toHaveLength(2);
  });

  it('calls onRowDelete when delete button is clicked', () => {
    const onRowDelete = vi.fn();
    render(<MatrixGrid columns={columns} rows={rows} onRowDelete={onRowDelete} translations={mockTranslations} />);
    
    const deleteButtons = screen.getAllByRole('button');
    fireEvent.click(deleteButtons[0]);
    
    expect(onRowDelete).toHaveBeenCalledWith(0);
  });

  it('renders inputs in edit mode for editable columns', () => {
    const onCellChange = vi.fn();
    render(
      <MatrixGrid 
        columns={columns} 
        rows={rows} 
        mode="edit" 
        editableColumns={['col1']} 
        onCellChange={onCellChange}
        translations={mockTranslations}
      />
    );
    
    // All cells are rendered as inputs, but only col1 is editable
    const inputs = screen.getAllByRole('spinbutton'); // input type="number"
    expect(inputs).toHaveLength(4); // 2 rows × 2 columns
    // col1 inputs (first and third) are editable, col2 inputs are readOnly
    expect(inputs[0]).toHaveValue(10);
    expect(inputs[0]).not.toHaveAttribute('readOnly');
    expect(inputs[1]).toHaveValue(20);
    expect(inputs[1]).toHaveAttribute('readOnly');
    expect(inputs[2]).toHaveValue(30);
    expect(inputs[2]).not.toHaveAttribute('readOnly');
    expect(inputs[3]).toHaveValue(40);
    expect(inputs[3]).toHaveAttribute('readOnly');
  });

  it('calls onCellChange when input value changes', () => {
    const onCellChange = vi.fn();
    render(
      <MatrixGrid 
        columns={columns} 
        rows={rows} 
        mode="edit" 
        editableColumns={['col1']} 
        onCellChange={onCellChange}
        translations={mockTranslations}
      />
    );
    
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '15' } });
    
    expect(onCellChange).toHaveBeenCalledWith('row1', 'col1', 15);
  });

  it('handles empty/invalid input gracefully', () => {
    const onCellChange = vi.fn();
    render(
      <MatrixGrid 
        columns={columns} 
        rows={rows} 
        mode="edit" 
        editableColumns={['col1']} 
        onCellChange={onCellChange}
        translations={mockTranslations}
      />
    );
    
    const inputs = screen.getAllByRole('spinbutton');
    
    // Empty string -> 0
    fireEvent.change(inputs[0], { target: { value: '' } });
    expect(onCellChange).toHaveBeenCalledWith('row1', 'col1', 0);
    
    // Negative value -> 0
    fireEvent.change(inputs[0], { target: { value: '-5' } });
    expect(onCellChange).toHaveBeenCalledWith('row1', 'col1', 0);
  });

  it('applies colorMap to headers and cells', () => {
    const colorMap = { 'COL1': 'bg-red-100', 'COL2': 'bg-green-100' };
    render(<MatrixGrid columns={columns} rows={rows} colorMap={colorMap} translations={mockTranslations} />);
    
    // Check header for Col1
    // The text 'Column 1' is inside a div which is inside the th
    const col1Header = screen.getByText('Column 1').closest('th');
    expect(col1Header).toHaveClass('bg-red-100');
    
    // Check cell for Col1 (in row 1)
    // The input for col1, row1 should have the color class
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveClass('bg-red-100');
  });

  it('renders tooltip for columns with tooltip property', () => {
    const columnsWithTooltip: MatrixColumn[] = [
      { id: 'col1', label: 'Column 1', tooltip: 'Helpful info' }
    ];
    
    render(<MatrixGrid columns={columnsWithTooltip} rows={rows} translations={mockTranslations} />);
    
    // The tooltip trigger is the header cell wrapper
    // The structure is Tooltip -> headerCell
    const headerText = screen.getByText('Column 1');
    
    fireEvent.mouseEnter(headerText);
    
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('Helpful info')).toBeInTheDocument();
  });
});