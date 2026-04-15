
// No import of PagedResponse; define interface below
 
export interface AssessmentYearRV {
  yearRangeRVId: number;
  yearId?: number; // Optional for backward compatibility
  fromYear: number;
  toYear: number;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
  [key: string]: unknown;
}

export interface AssessmentYearCV {
  yearRangeCVId: number;
  yearId?: number; // Optional for backward compatibility
  fromYear: number;
  toYear: number;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
  [key: string]: unknown;
}


 
export interface AssessmentYearPagedResponseRV {
  items: AssessmentYearRV[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface AssessmentYearPagedResponseCV {
  items: AssessmentYearCV[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

/* ================= COMPONENT PROPS ================= */

export interface AssessmentYearMasterRVProps {
  paginatedData: AssessmentYearPagedResponseRV;
}

export interface AssessmentYearMasterCVProps {
  paginatedData: AssessmentYearPagedResponseCV;
}

export interface AssessmentYearFormRVProps {
  open: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  initialData?: AssessmentYearRV | null;
}

export interface AssessmentYearFormCVProps {
  open: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  initialData?: AssessmentYearCV | null;
}

