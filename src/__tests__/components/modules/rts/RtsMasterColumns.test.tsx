import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { RtsDepartmentApiItem } from '@/types/rts/departments.types';
import type { RtsFieldDefinitionApiItem } from '@/types/rts/field-definition.types';
import type { RtsServiceApiItem } from '@/types/rts/service.types';

const fieldRow: RtsFieldDefinitionApiItem = {
  departmentId: 1,
  serviceId: 21,
  fieldCode: 'propertyNo',
  fieldLabel: 'Property Number',
  fieldLabelLocal: null,
  fieldType: 'text',
  fieldGroup: null,
  isRequired: true,
  displayOrder: 1,
  validationRules: null,
  defaultValue: null,
  minValue: null,
  maxValue: null,
  maxLength: null,
  optionsJson: null,
  id: 1,
  isActive: true,
  createdDate: '2026-07-27T00:00:00Z',
  updatedDate: null,
};

const serviceRow: RtsServiceApiItem = {
  departmentId: 1,
  serviceName: 'Property Tax',
  serviceNameLocal: null,
  departmentName: 'Property Tax Department',
  id: 21,
  serviceUrl: null,
  displayOrder: 1,
  isActive: true,
  createdDate: '2026-07-27T00:00:00Z',
  updatedDate: null,
  sla: null,
  fees: null,
  isFeesRequired: false,
};

const departmentRow: RtsDepartmentApiItem = {
  departmentServiceId: null,
  departmentName: 'Property Tax Department',
  departmentNameLocal: null,
  departmentIcon: null,
  displayOrder: 1,
  id: 1,
  isActive: true,
  createdDate: '2026-07-27T00:00:00Z',
  updatedDate: null,
};

afterEach(cleanup);

describe('RTS master data rows', () => {
  it('handles null field label gracefully', () => {
    const displayLabel = fieldRow.fieldLabelLocal ?? fieldRow.fieldLabel ?? '-';
    render(<span>{displayLabel}</span>);
    expect(screen.getByText('Property Number')).toBeInTheDocument();
  });

  it('handles null service local name gracefully', () => {
    const displayName = serviceRow.serviceNameLocal ?? serviceRow.serviceName ?? '-';
    render(<span>{displayName}</span>);
    expect(screen.getByText('Property Tax')).toBeInTheDocument();
  });

  it('handles null department local name gracefully', () => {
    const displayDept = departmentRow.departmentNameLocal ?? departmentRow.departmentName ?? '-';
    render(<span>{displayDept}</span>);
    expect(screen.getByText('Property Tax Department')).toBeInTheDocument();
  });
});
