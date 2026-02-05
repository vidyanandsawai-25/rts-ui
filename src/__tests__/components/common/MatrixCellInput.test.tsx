import { render, screen, fireEvent } from '@testing-library/react';
import { MatrixCellInput } from '@/components/common/MatrixCellInput';
import { vi } from 'vitest';

describe('MatrixCellInput', () => {
  const defaultProps = {
    value: 100,
    rowId: 'row-1',
    columnId: 'col-1',
    onCellChange: vi.fn(),
  };

  it('renders correctly with initial value', () => {
    render(<MatrixCellInput {...defaultProps} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(100);
  });

  it('renders placeholder when value is 0', () => {
    render(<MatrixCellInput {...defaultProps} value={0} />);
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    // When value is 0, the component renders an empty string so the placeholder is visible
    expect(input.value).toBe('');
    expect(input).toHaveAttribute('placeholder', '0');
  });

  it('calls onCellChange with correct arguments on change', () => {
    render(<MatrixCellInput {...defaultProps} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '200' } });
    
    expect(defaultProps.onCellChange).toHaveBeenCalledWith('row-1', 'col-1', 200);
  });

  it('handles empty input by sending 0', () => {
    render(<MatrixCellInput {...defaultProps} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '' } });
    
    expect(defaultProps.onCellChange).toHaveBeenCalledWith('row-1', 'col-1', 0);
  });

  it('prevents negative values by clamping to 0', () => {
    render(<MatrixCellInput {...defaultProps} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '-50' } });
    
    expect(defaultProps.onCellChange).toHaveBeenCalledWith('row-1', 'col-1', 0);
  });

  it('applies custom color class', () => {
    render(<MatrixCellInput {...defaultProps} colorClass="bg-red-500" />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveClass('bg-red-500');
  });

  it('applies aria-label correctly', () => {
    render(<MatrixCellInput {...defaultProps} metaLabel="Test Input" />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('aria-label', 'Test Input');
  });
});
