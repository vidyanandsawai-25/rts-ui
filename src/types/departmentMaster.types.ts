export interface DepartmentMaster {
    departmentId: number;
    departmentCode: string; // varchar, YES
    departmentName: string; // varchar, YES
    departmentNameLocal?: string; // nvarchar, YES
    departmentIcon?: string; // varchar, YES
    departmentDescription?: string; // nvarchar, YES
    isActive: boolean; // bit, YES -> boolean
    createdBy?: number;
    createdAt?: string; // datetime -> string (ISO)
    updatedBy?: number;
    updatedAt?: string; // datetime -> string (ISO)
    [key: string]: unknown;
}

export interface DepartmentMasterFormModel {
    departmentId?: number;
    departmentCode: string;
    departmentName: string;
    departmentNameLocal: string;
    departmentIcon: string;
    departmentDescription: string;
    isActive: boolean;
}

export interface DepartmentMasterFormData {
    departmentCode: string;
    departmentName: string;
    departmentNameLocal: string;
    departmentIcon: string;
    departmentDescription: string;
    isActive: boolean;
}

export interface DashboardCardProps {
    label: string;
    value: string;
    iconBg: string;
    valueColor: string;
    icon: React.ElementType;
}


export interface DepartmentMasterFormProps {
    open: boolean;
    onClose: () => void;
    editingDepartment: DepartmentMaster | null;
    onSuccess: () => void;
}


export interface Props {
    initialData: DepartmentMaster[];
    allData?: DepartmentMaster[];
    initialPageNumber: number;
    initialPageSize: number;
    initialTotalCount: number;
    initialTotalPages: number;
    initialSearchTerm?: string;
}

// Use shared PagedResponse from common.types instead of duplicating
export type { PagedResponse } from './common.types';
