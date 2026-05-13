import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { getAgeFactorCvWeightageMasterColumns } from '@/components/modules/property-tax/weightage-mastercv/ageFactorCv/ageFactorCvWeightageMasterColumns';
import { AgeFactorCVMaster } from '@/types/ageFactorCv.types';

describe('getAgeFactorCvWeightageMasterColumns', () => {
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'columns.constructionType': 'Construction Type',
      'columns.ageFrom': 'Age From',
      'columns.ageTo': 'Age To',
      'columns.factor': 'Factor',
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
  const mockGetRowUid = vi.fn((row: AgeFactorCVMaster) => `${row.id}-${row.constructionTypeId}`);

  const mockEditableRows: Record<string, AgeFactorCVMaster> = {};

  const mockRow: AgeFactorCVMaster = {
    id: 1,
    constructionTypeId: 101,
    constructionCode: 'C1',
    ageFrom: 0,
    ageTo: 10,
    factor: 1.5,
    yearRangeCVId: 2024,
    fromYear: 2024,
    toYear: 2025,
    isActive: true,
  };

  it('returns correct number of columns', () => {
    const columns = getAgeFactorCvWeightageMasterColumns({
      t: mockT,
      tW: mockTW,
      editableRows: mockEditableRows,
      handleCellChange: mockHandleCellChange,
      getRowUid: mockGetRowUid,
    });

    expect(columns).toHaveLength(6);
  });

  it('constructionCode column renders correctly', () => {
    const columns = getAgeFactorCvWeightageMasterColumns({
      t: mockT,
      tW: mockTW,
      editableRows: mockEditableRows,
      handleCellChange: mockHandleCellChange,
      getRowUid: mockGetRowUid,
    });

    const column = columns[0];
    expect(column.key).toBe('constructionCode');
    expect(column.label).toBe('Construction Type');
    expect(column.render?.('C1', mockRow, 0)).toBe('C1');
  });

  it('constructionCode column renders "-" for undefined value', () => {
    const columns = getAgeFactorCvWeightageMasterColumns({
      t: mockT,
      tW: mockTW,
      editableRows: mockEditableRows,
      handleCellChange: mockHandleCellChange,
      getRowUid: mockGetRowUid,
    });

    const column = columns[0];
    expect(column.render?.(undefined, mockRow, 0)).toBe('-');
  });

  it('ageFrom and ageTo columns render correctly', () => {
    const columns = getAgeFactorCvWeightageMasterColumns({
      t: mockT,
      tW: mockTW,
      editableRows: mockEditableRows,
      handleCellChange: mockHandleCellChange,
      getRowUid: mockGetRowUid,
    });

    expect(columns[1].render?.(0, mockRow, 0)).toBe(0);
    expect(columns[2].render?.(10, mockRow, 0)).toBe(10);
  });

  it('factor column renders MatrixCellInput', () => {
    const columns = getAgeFactorCvWeightageMasterColumns({
      t: mockT,
      tW: mockTW,
      editableRows: mockEditableRows,
      handleCellChange: mockHandleCellChange,
      getRowUid: mockGetRowUid,
    });

    const factorColumn = columns[3];
    expect(factorColumn.key).toBe('factor');
    expect(factorColumn.label).toBe('Factor');

    const result = factorColumn.render?.(1.5, mockRow, 0);
    const { container } = render(<>{result}</>);
    
    const input = container.querySelector('input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveDisplayValue('1.5');
  });

  it('factor column uses editable value when available', () => {
    const editableRows = {
      '1-101': {
        ...mockRow,
        factor: 2.0,
      },
    };

    const columns = getAgeFactorCvWeightageMasterColumns({
      t: mockT,
      tW: mockTW,
      editableRows,
      handleCellChange: mockHandleCellChange,
      getRowUid: mockGetRowUid,
    });

    const factorColumn = columns[3];
    const result = factorColumn.render?.(1.5, mockRow, 0);
    const { container } = render(<>{result}</>);
    
    const input = container.querySelector('input');
    expect(input).toHaveDisplayValue('2');
  });

  it('assessmentYear column renders range correctly', () => {
    const columns = getAgeFactorCvWeightageMasterColumns({
      t: mockT,
      tW: mockTW,
      editableRows: mockEditableRows,
      handleCellChange: mockHandleCellChange,
      getRowUid: mockGetRowUid,
    });

    const column = columns[4];
    expect(column.render?.(undefined, mockRow, 0)).toBe('2024-2025');
  });

  it('isActive column renders pending badge for new records', () => {
    const newRow: AgeFactorCVMaster = { ...mockRow, id: 0 };
    
    const columns = getAgeFactorCvWeightageMasterColumns({
      t: mockT,
      tW: mockTW,
      editableRows: mockEditableRows,
      handleCellChange: mockHandleCellChange,
      getRowUid: mockGetRowUid,
    });

    const statusColumn = columns[5];
    const result = statusColumn.render?.(true, newRow, 0);
    const { container } = render(<>{result}</>);
    
    const badge = container.querySelector('span');
    expect(badge).toBeInTheDocument();
    expect(badge?.className).toContain('bg-amber-50');
  });

  it('isActive column renders status badge for existing records', () => {
    const columns = getAgeFactorCvWeightageMasterColumns({
      t: mockT,
      tW: mockTW,
      editableRows: mockEditableRows,
      handleCellChange: mockHandleCellChange,
      getRowUid: mockGetRowUid,
    });

    const statusColumn = columns[5];
    const result = statusColumn.render?.(true, mockRow, 0);
    const { container } = render(<>{result}</>);
    
    const badge = container.querySelector('span');
    expect(badge).toBeInTheDocument();
    expect(badge?.textContent).toContain('Active');
  });
});
