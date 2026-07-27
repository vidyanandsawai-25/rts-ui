import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { getRtsDepartmentColumns } from '@/components/modules/rts/departments/RtsDepartmentColumns';
import { getRtsFieldColumns } from '@/components/modules/rts/fields/RtsFieldColumns';
import { getRtsServiceColumns } from '@/components/modules/rts/services/RtsServiceColumns';
import type { RtsDepartmentApiItem } from '@/types/rts/departments.types';
import type { RtsFieldDefinitionApiItem } from '@/types/rts/field-definition.types';
import type { RtsServiceApiItem } from '@/types/rts/service.types';

const translate = (key: string) => key;

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

describe('RTS master table columns', () => {
  it('uses the row argument when a field cell value is null', () => {
    const column = getRtsFieldColumns(translate, translate).find(
      ({ key }) => key === 'fieldLabelLocal'
    );

    render(<>{column?.render?.(null, fieldRow, 0)}</>);

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('uses the row argument when a service cell value is null', () => {
    const column = getRtsServiceColumns(translate, translate).find(
      ({ key }) => key === 'serviceNameLocal'
    );

    render(<>{column?.render?.(null, serviceRow, 0)}</>);

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('uses the row argument when a department cell value is null', () => {
    const column = getRtsDepartmentColumns(translate, translate).find(
      ({ key }) => key === 'departmentNameLocal'
    );

    render(<>{column?.render?.(null, departmentRow, 0)}</>);

    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
