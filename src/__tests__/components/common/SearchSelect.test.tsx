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
    render(<SearchSelect name="test-select" options={options} value="" onChange={() => {}} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('displays placeholder when no value is selected', () => {
    render(
      <SearchSelect
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
    render(<SearchSelect name="test-select" options={options} value="opt1" onChange={() => {}} />);

    // Since we use Promise.resolve().then() in useEffect, we might need to wait
    await waitFor(() => {
      expect(screen.getByDisplayValue('Option 1')).toBeInTheDocument();
    });
  });

  it('opens dropdown on focus', async () => {
    render(<SearchSelect name="test-select" options={options} value="" onChange={() => {}} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('filters options based on search input', async () => {
    render(<SearchSelect name="test-select" options={options} value="" onChange={() => {}} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Banana' } });

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    const optionsList = screen.getAllByRole('option');
    expect(optionsList).toHaveLength(1);
    expect(optionsList[0]).toHaveTextContent('Banana');
  });

  it('calls onChange when an option is selected', async () => {
    const onChange = vi.fn();
    render(<SearchSelect name="test-select" options={options} value="" onChange={onChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    const option = screen.getByText('Option 2');
    fireEvent.mouseDown(option);

    expect(onChange).toHaveBeenCalledWith('test-select', 'opt2');
  });

  it('handles forceSearchText prop', async () => {
    render(
      <SearchSelect
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
});
