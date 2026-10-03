import { describe, it, expect } from 'vitest';
import {
  buildWardOptions,
  buildPropertyNoOptions,
  buildPartitionOptions,
} from '@/hooks/extendedAreaAssessment/buildCascadingOptions';
import type { WardDropdownOption, ApartmentQcSearchSuggestionDto } from '@/app/[locale]/property-tax/extended-area-assesment/single-assessment/action';

const DROPDOWN_STRINGS: Record<string, string> = {
  'dropdowns.loadingWards': 'Loading Wards...',
  'dropdowns.selectWard': 'Select Ward...',
  'dropdowns.selectWardFirst': 'Select Ward first',
  'dropdowns.loadingProperties': 'Loading Properties...',
  'dropdowns.selectPropertyNo': 'Select Property No...',
  'dropdowns.selectPropertyNoFirst': 'Select Property No first',
  'dropdowns.loadingPartitions': 'Loading Partitions...',
  'dropdowns.selectPartitionNo': 'Select Partition No...',
  'dropdowns.mainProperty': 'Main Property',
};

const t = ((key: string, values?: Record<string, string>) =>
  key === 'dropdowns.partitionLabel' ? `Partition ${values?.partitionNo}` : DROPDOWN_STRINGS[key] ?? key) as unknown as Parameters<
  typeof buildWardOptions
>[2];

describe('buildWardOptions', () => {
  it('prepends a "Select Ward..." placeholder and maps wards by wardNo', () => {
    const wards: WardDropdownOption[] = [
      { id: 1, wardNo: 'MM11', description: null },
      { id: 2, wardNo: 'MM12', description: null },
    ];
    const options = buildWardOptions(wards, false, t);
    expect(options[0]).toEqual({ label: 'Select Ward...', value: '' });
    expect(options).toHaveLength(3);
    expect(options[1]).toEqual({ label: 'MM11', value: '1' });
    expect(options[2]).toEqual({ label: 'MM12', value: '2' });
  });

  it('falls back to the ward id as the label when wardNo is missing', () => {
    const wards: WardDropdownOption[] = [{ id: 5, wardNo: '', description: null }];
    const options = buildWardOptions(wards, false, t);
    expect(options[1]).toEqual({ label: '5', value: '5' });
  });

  it('shows a loading placeholder while wards are loading', () => {
    const options = buildWardOptions([], true, t);
    expect(options[0].label).toBe('Loading Wards...');
  });
});

describe('buildPropertyNoOptions', () => {
  it('prompts to select a ward first when none is selected', () => {
    const options = buildPropertyNoOptions([], '', false, t);
    expect(options[0].label).toBe('Select Ward first');
  });

  it('shows a loading placeholder while properties are loading', () => {
    const options = buildPropertyNoOptions([], '1', true, t);
    expect(options[0].label).toBe('Loading Properties...');
  });

  it('lists each property number once a ward is selected and loaded', () => {
    const options = buildPropertyNoOptions(['P1', 'P2'], '1', false, t);
    expect(options[0].label).toBe('Select Property No...');
    expect(options.slice(1)).toEqual([
      { label: 'P1', value: 'P1' },
      { label: 'P2', value: 'P2' },
    ]);
  });
});

function buildSuggestion(overrides: Partial<ApartmentQcSearchSuggestionDto> = {}): ApartmentQcSearchSuggestionDto {
  return {
    propertyId: 1,
    zoneId: 1,
    wardId: 1,
    category: 1,
    categoryLabel: 'Residential',
    displayLabel: '',
    ...overrides,
  };
}

describe('buildPartitionOptions', () => {
  it('prompts to select a property first when none is selected', () => {
    const options = buildPartitionOptions([], '', false, t);
    expect(options[0].label).toBe('Select Property No first');
  });

  it('shows a loading placeholder while partitions are loading', () => {
    const options = buildPartitionOptions([], 'P1', true, t);
    expect(options[0].label).toBe('Loading Partitions...');
  });

  it('labels a real partition as "Partition <no> (<label>)"', () => {
    const suggestions = [buildSuggestion({ partitionNo: 'A1', upicId: 'U1', propertyNo: 'P1', displayLabel: 'Flat 101' })];
    const options = buildPartitionOptions(suggestions, 'P1', false, t);
    expect(options[1]).toEqual({ label: 'Partition A1 (Flat 101)', value: 'A1' });
  });

  it('labels a non-partitioned suggestion by its display label, falling back to upicId then "Main Property"', () => {
    const withDisplayLabel = [buildSuggestion({ upicId: 'U1', propertyNo: 'P1', displayLabel: 'Main Bldg' })];
    expect(buildPartitionOptions(withDisplayLabel, 'P1', false, t)[1]).toEqual({ label: 'Main Bldg', value: 'U1' });

    const withUpicOnly = [buildSuggestion({ propertyId: 2, upicId: 'U2', propertyNo: 'P2', displayLabel: '' })];
    expect(buildPartitionOptions(withUpicOnly, 'P2', false, t)[1]).toEqual({ label: 'U2', value: 'U2' });

    const withNeither = [buildSuggestion({ propertyId: 3, propertyNo: 'P3', displayLabel: '' })];
    expect(buildPartitionOptions(withNeither, 'P3', false, t)[1]).toEqual({ label: 'Main Property', value: '3' });
  });
});
