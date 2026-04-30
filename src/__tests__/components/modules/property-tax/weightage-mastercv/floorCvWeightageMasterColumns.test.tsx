import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { getFloorCvWeightageMasterColumns } from '@/components/modules/property-tax/weightage-mastercv/floorCvWeightageMasterColumns';
import { FloorFactorCVMaster } from '@/types/floor-cv-weightageMaster.types';

// Extend FloorFactorCVMaster to add index signature
type FloorFactorCVMasterWithIndex = FloorFactorCVMaster & Record<string, unknown>;

describe('getFloorCvWeightageMasterColumns', () => {
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'columns.floorCode': 'Floor Code',
      'columns.description': 'Description',
      'columns.factorWithLift': 'With Lift',
      'columns.factorWithoutLift': 'Without Lift',
      'columns.assessmentYear': 'Assessment Year',
      'columns.status': 'Status',
    };
    return translations[key] || key;
  });

  const mockTW = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'common.labels.active': 'Active',
      'common.labels.inactive': 'Inactive',
    };
    return translations[key] || key;
  });

  const mockHandleCellChange = vi.fn();
  const mockGetRowUid = vi.fn((row: FloorFactorCVMaster) => `${row.id}-${row.floorId}`);

  const mockEditableRows: Record<string, FloorFactorCVMaster> = {};

  const mockRow: FloorFactorCVMasterWithIndex = {
    id: 1,
    floorId: 101,
    floorCode: 'F1',
    floorDescription: 'First Floor',
    factorWithLift: 1.2,
    factorWithoutLift: 1.0,
    yearRangeCVId: 2024,
    yearRangeCVID: 2024,
    fromYear: 2024,
    toYear: 2025,
    isActive: true,
  };

  it('returns correct number of columns', () => {
    const columns = getFloorCvWeightageMasterColumns({
      t: mockT,
      tW: mockTW,
      editableRows: mockEditableRows,
      handleCellChange: mockHandleCellChange,
      getRowUid: mockGetRowUid,
    });

    expect(columns).toHaveLength(6);
  });

  it('floorCode column renders correctly', () => {
    const columns = getFloorCvWeightageMasterColumns({
      t: mockT,
      tW: mockTW,
      editableRows: mockEditableRows,
      handleCellChange: mockHandleCellChange,
      getRowUid: mockGetRowUid,
    });

    const floorCodeColumn = columns[0];
    expect(floorCodeColumn.key).toBe('floorCode');
    expect(floorCodeColumn.label).toBe('Floor Code');
    expect(floorCodeColumn.width).toBe('10%');
    expect(floorCodeColumn.render?.('F1', mockRow, 0)).toBe('F1');
  });

  it('floorCode column renders "-" for undefined value', () => {
    const columns = getFloorCvWeightageMasterColumns({
      t: mockT,
      tW: mockTW,
      editableRows: mockEditableRows,
      handleCellChange: mockHandleCellChange,
      getRowUid: mockGetRowUid,
    });

    const floorCodeColumn = columns[0];
    expect(floorCodeColumn.render?.(undefined, mockRow, 0)).toBe('-');
  });

  it('floorDescription column renders correctly', () => {
    const columns = getFloorCvWeightageMasterColumns({
      t: mockT,
      tW: mockTW,
      editableRows: mockEditableRows,
      handleCellChange: mockHandleCellChange,
      getRowUid: mockGetRowUid,
    });

    const descriptionColumn = columns[1];
    expect(descriptionColumn.key).toBe('floorDescription');
    expect(descriptionColumn.label).toBe('Description');
    expect(descriptionColumn.width).toBe('14%');
    expect(descriptionColumn.render?.('First Floor', mockRow, 0)).toBe('First Floor');
  });

  it('factorWithLift column renders MatrixCellInput', () => {
    const columns = getFloorCvWeightageMasterColumns({
      t: mockT,
      tW: mockTW,
      editableRows: mockEditableRows,
      handleCellChange: mockHandleCellChange,
      getRowUid: mockGetRowUid,
    });

    const factorWithLiftColumn = columns[2];
    expect(factorWithLiftColumn.key).toBe('factorWithLift');
    expect(factorWithLiftColumn.label).toBe('With Lift');
    expect(factorWithLiftColumn.width).toBe('14%');

    const result = factorWithLiftColumn.render?.(1.2, mockRow, 0);
    const { container } = render(<>{result}</>);
    
    const input = container.querySelector('input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveDisplayValue('1.20');
  });

  it('factorWithLift column uses editable value when available', () => {
    const editableRows = {
      '1-101': {
        ...mockRow,
        factorWithLift: 1.5,
      },
    };

    const columns = getFloorCvWeightageMasterColumns({
      t: mockT,
      tW: mockTW,
      editableRows,
      handleCellChange: mockHandleCellChange,
      getRowUid: mockGetRowUid,
    });

    const factorWithLiftColumn = columns[2];
    const result = factorWithLiftColumn.render?.(1.2, mockRow, 0);
    const { container } = render(<>{result}</>);
    
    const input = container.querySelector('input');
    expect(input).toHaveDisplayValue('1.50');
  });

  it('factorWithoutLift column renders MatrixCellInput', () => {
    const columns = getFloorCvWeightageMasterColumns({
      t: mockT,
      tW: mockTW,
      editableRows: mockEditableRows,
      handleCellChange: mockHandleCellChange,
      getRowUid: mockGetRowUid,
    });

    const factorWithoutLiftColumn = columns[3];
    expect(factorWithoutLiftColumn.key).toBe('factorWithoutLift');
    expect(factorWithoutLiftColumn.label).toBe('Without Lift');

    const result = factorWithoutLiftColumn.render?.(1.0, mockRow, 0);
    const { container } = render(<>{result}</>);
    
    const input = container.querySelector('input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveDisplayValue('1.00');
  });

  it('fromYear column renders assessment year range', () => {
    const columns = getFloorCvWeightageMasterColumns({
      t: mockT,
      tW: mockTW,
      editableRows: mockEditableRows,
      handleCellChange: mockHandleCellChange,
      getRowUid: mockGetRowUid,
    });

    const fromYearColumn = columns[4];
    expect(fromYearColumn.key).toBe('fromYear');
    expect(fromYearColumn.label).toBe('Assessment Year');
    expect(fromYearColumn.render?.(2024, mockRow, 0)).toBe('2024-2025');
  });

  it('isActive column renders pending badge for new records', () => {
    const newRow: FloorFactorCVMasterWithIndex = { ...mockRow, id: 0 };
    
    const columns = getFloorCvWeightageMasterColumns({
      t: mockT,
      tW: mockTW,
      editableRows: mockEditableRows,
      handleCellChange: mockHandleCellChange,
      getRowUid: mockGetRowUid,
    });

    const statusColumn = columns[5];
    expect(statusColumn.key).toBe('isActive');
    expect(statusColumn.label).toBe('Status');
    expect(statusColumn.isStatus).toBe(true);

    const result = statusColumn.render?.(true, newRow, 0);
    const { container } = render(<>{result}</>);
    
    // StatusBadge with pending variant should have amber background
    const badge = container.querySelector('span');
    expect(badge).toBeInTheDocument();
    expect(badge?.className).toContain('bg-amber-50');
  });

  it('isActive column renders active status badge', () => {
    const columns = getFloorCvWeightageMasterColumns({
      t: mockT,
      tW: mockTW,
      editableRows: mockEditableRows,
      handleCellChange: mockHandleCellChange,
      getRowUid: mockGetRowUid,
    });

    const statusColumn = columns[5];
    const result = statusColumn.render?.(true, mockRow, 0);
    const { container } = render(<>{result}</>);
    
    // Active status should have emerald background and show "Active" text
    const badge = container.querySelector('span');
    expect(badge).toBeInTheDocument();
    expect(badge?.className).toContain('bg-emerald-50');
    expect(badge?.textContent).toContain('Active');
  });

  it('isActive column renders inactive status badge', () => {
    const inactiveRow: FloorFactorCVMasterWithIndex = { ...mockRow, isActive: false };
    
    const columns = getFloorCvWeightageMasterColumns({
      t: mockT,
      tW: mockTW,
      editableRows: mockEditableRows,
      handleCellChange: mockHandleCellChange,
      getRowUid: mockGetRowUid,
    });

    const statusColumn = columns[5];
    const result = statusColumn.render?.(false, inactiveRow, 0);
    const { container } = render(<>{result}</>);
    
    // Inactive status should have rose background and show "Inactive" text
    const badge = container.querySelector('span');
    expect(badge).toBeInTheDocument();
    expect(badge?.className).toContain('bg-rose-50');
    expect(badge?.textContent).toContain('Inactive');
  });

  it('MatrixCellInput calls handleCellChange on value change', () => {
    const columns = getFloorCvWeightageMasterColumns({
      t: mockT,
      tW: mockTW,
      editableRows: mockEditableRows,
      handleCellChange: mockHandleCellChange,
      getRowUid: mockGetRowUid,
    });

    const factorWithLiftColumn = columns[2];
    const result = factorWithLiftColumn.render?.(1.2, mockRow, 0);
    const { container } = render(<>{result}</>);
    
    const input = container.querySelector('input');
    expect(input).toBeInTheDocument();
    
    fireEvent.change(input!, { target: { value: '1.5' } });
    
    expect(mockHandleCellChange).toHaveBeenCalled();
  });

  it('all column keys are unique', () => {
    const columns = getFloorCvWeightageMasterColumns({
      t: mockT,
      tW: mockTW,
      editableRows: mockEditableRows,
      handleCellChange: mockHandleCellChange,
      getRowUid: mockGetRowUid,
    });

    const keys = columns.map(col => col.key);
    const uniqueKeys = new Set(keys);
    
    expect(keys.length).toBe(uniqueKeys.size);
  });

  it('all columns have labels', () => {
    const columns = getFloorCvWeightageMasterColumns({
      t: mockT,
      tW: mockTW,
      editableRows: mockEditableRows,
      handleCellChange: mockHandleCellChange,
      getRowUid: mockGetRowUid,
    });

    columns.forEach(column => {
      expect(column.label).toBeTruthy();
      expect(typeof column.label).toBe('string');
    });
  });
});
