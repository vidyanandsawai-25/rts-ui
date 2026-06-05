import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SearchSelect } from '@/components/common/SearchSelect';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'multiSelect.noOptionsAvailable': 'No options available',
      'actions.loading': 'Loading...',
    };
    return translations[key] || key;
  },
}));

describe('SearchSelect', () => {
  const options = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
    { label: 'Banana', value: 'banana' },
  ];

  it('renders correctly with default props', () => {
    render(<SearchSelect id="test-select" name="test-select" options={options} value="" onChange={() => {}} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('displays placeholder when no value is selected', () => {
    render(
      <SearchSelect
        id="test-select"
        name="test-select"
        options={options}
        value=""
        onChange={() => {}}
        placeholder="Select an option"
      />
    );

    expect(screen.getByPlaceholderText('Select an option')).toBeInTheDocument();
  });

  it('displays selected label when value is provided', async () => {
    render(<SearchSelect id="test-select" name="test-select" options={options} value="opt1" onChange={() => {}} />);

    // Since we use Promise.resolve().then() in useEffect, we might need to wait
    await waitFor(() => {
      expect(screen.getByDisplayValue('Option 1')).toBeInTheDocument();
    });
  });

  it('opens dropdown on focus', async () => {
    render(<SearchSelect id="test-select" name="test-select" options={options} value="" onChange={() => {}} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('filters options based on search input', async () => {
    render(<SearchSelect id="test-select" name="test-select" options={options} value="" onChange={() => {}} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Banana' } });

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    const optionsList = screen.getAllByRole('option');
    expect(optionsList).toHaveLength(1);
    expect(optionsList[0]).toHaveTextContent('Banana');
  });

  it('calls onChange when an option is selected', async () => {
    const onChange = vi.fn();
    render(<SearchSelect id="test-select" name="test-select" options={options} value="" onChange={onChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    const option = screen.getByText('Option 2');
    fireEvent.mouseDown(option);

    expect(onChange).toHaveBeenCalledWith('test-select', 'opt2');
  });

  it('handles forceSearchText prop', async () => {
    render(
      <SearchSelect
        id="test-select"
        name="test-select"
        options={options}
        value=""
        onChange={() => {}}
        forceSearchText="Forced Text"
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Forced Text')).toBeInTheDocument();
    });
  });

  it('shows no options available message when options are empty', () => {
    render(
      <SearchSelect
        id="test-select"
        name="test-select"
        options={[]}
        value=""
        onChange={() => {}}
        placeholder="No options available"
        disabled={true}
      />
    );

    expect(screen.getByPlaceholderText('No options available')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('shows loading state when isLoading prop is true', () => {
    render(
      <SearchSelect
        id="test-select"
        name="test-select"
        options={options}
        value=""
        onChange={() => {}}
        isLoading={true}
      />
    );

    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
  });

  it('opens dropdown on focus even if options are empty (async options)', async () => {
    // Simulate async options: initially empty, then update
    const { rerender } = render(
      <SearchSelect id="test-select" name="test-select" options={[]} value="" onChange={() => {}} />
    );
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    // Dropdown should open and show "No options available" message
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('No options available')).toBeInTheDocument();
    // Now rerender with options (simulate async load)
    rerender(
      <SearchSelect id="test-select" name="test-select" options={options} value="" onChange={() => {}} />
    );
    // Dropdown should now show options
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('does not open dropdown on focus if disabled', () => {
    render(
      <SearchSelect id="test-select" name="test-select" options={options} value="" onChange={() => {}} disabled />
    );
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('commits selection on blur when exact match is typed', async () => {
    const onChange = vi.fn();
    render(<SearchSelect id="test-select" name="test-select" options={options} value="" onChange={onChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Banana' } });
    fireEvent.blur(input);

    // Wait for any async state updates
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('test-select', 'banana');
    });
  });
});
