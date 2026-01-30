import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MatrixGrid, MatrixColumn, MatrixRow } from '@/components/common/MatrixGrid';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      action: 'Action',
      currencySymbol: '₹',
    };
    return translations[key] || key;
  },
}));

describe('MatrixGrid', () => {
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
    render(<MatrixGrid columns={columns} rows={rows} />);
    
    expect(screen.getByText('Column 1')).toBeInTheDocument();
    expect(screen.getByText('(kg)')).toBeInTheDocument();
    expect(screen.getByText('Column 2')).toBeInTheDocument();
    
    expect(screen.getByText('₹10.00')).toBeInTheDocument();
    expect(screen.getByText('₹20.00')).toBeInTheDocument();
  });

  it('renders meta columns correctly', () => {
    render(<MatrixGrid columns={columns} rows={rows} metaColumns={metaColumns} />);
    
    expect(screen.getByText('Meta 1')).toBeInTheDocument();
    expect(screen.getByText('Meta Value 1')).toBeInTheDocument();
    expect(screen.getByText('Meta Value 2')).toBeInTheDocument();
  });

  it('renders action column when onRowDelete is provided', () => {
    const onRowDelete = vi.fn();
    render(<MatrixGrid columns={columns} rows={rows} onRowDelete={onRowDelete} />);
    
    expect(screen.getByText('Action')).toBeInTheDocument();
    const deleteButtons = screen.getAllByRole('button');
    expect(deleteButtons).toHaveLength(2);
  });

  it('calls onRowDelete when delete button is clicked', () => {
    const onRowDelete = vi.fn();
    render(<MatrixGrid columns={columns} rows={rows} onRowDelete={onRowDelete} />);
    
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
      />
    );
    
    // col1 should be inputs, col2 should be text
    const inputs = screen.getAllByRole('spinbutton'); // input type="number"
    expect(inputs).toHaveLength(2); // 2 rows, col1 is editable
    expect(inputs[0]).toHaveValue(10);
    
    expect(screen.getByText('₹20.00')).toBeInTheDocument();
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
});
