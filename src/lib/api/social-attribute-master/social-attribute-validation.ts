import { SocialAttributeFormModel } from '@/types/social-attribute.types';
import { ApiError } from '@/lib/utils/api';

export function validateId(id: number): boolean {
  return Number.isFinite(id) && id > 0;
}

export function validateAndPrepareSearchTerm(searchTerm?: string): string | undefined {
  if (typeof searchTerm !== 'string') return undefined;

  const trimmedSearchTerm = searchTerm.trim();
  if (trimmedSearchTerm.length === 0) return undefined;

  const MAX_SEARCH_TERM_LENGTH = 100;
  return trimmedSearchTerm.slice(0, MAX_SEARCH_TERM_LENGTH);
}

export function validateCreateFormData(data: SocialAttributeFormModel): void {
  if (!data.socialAttributeCode?.trim()) {
    throw new ApiError(400, 'Social attribute code is required', 'Validation failed');
  }
  if (!data.socialAttributeName?.trim()) {
    throw new ApiError(400, 'Social attribute name is required', 'Validation failed');
  }
  if (!data.dataType?.trim()) {
    throw new ApiError(400, 'Data type is required', 'Validation failed');
  }
}

export function validateUpdateFormData(data: SocialAttributeFormModel): void {
  if (!data.id || data.id <= 0) {
    throw new ApiError(400, 'Social Attribute ID is required for update', 'Validation failed');
  }
  if (!data.socialAttributeCode?.trim()) {
    throw new ApiError(400, 'Social attribute code is required', 'Validation failed');
  }
  if (!data.socialAttributeName?.trim()) {
    throw new ApiError(400, 'Social attribute name is required', 'Validation failed');
  }
  if (!data.dataType?.trim()) {
    throw new ApiError(400, 'Data type is required', 'Validation failed');
  }
}

export function getDeleteErrorStatusCode(errorMsg: string): number {
  const lowerMsg = errorMsg.toLowerCase();

  if (lowerMsg.includes('not found') || lowerMsg.includes('does not exist')) {
    return 404; // Not Found
  } else if (
    lowerMsg.includes('in use') ||
    lowerMsg.includes('linked') ||
    lowerMsg.includes('referenced') ||
    lowerMsg.includes('associated') ||
    lowerMsg.includes('cannot delete')
  ) {
    return 409; // Conflict - record in use
  } else if (lowerMsg.includes('invalid') || lowerMsg.includes('bad request')) {
    return 400; // Bad Request
  } else {
    return 500; // Default to server error
  }
}

export function createApiError(
  statusCode?: number,
  errorMessage?: string,
  defaultMessage: string = 'Operation failed'
): ApiError {
  const errorMsg = errorMessage || '';
  const isDuplicate =
    errorMsg.toLowerCase().includes('already exists') ||
    errorMsg.toLowerCase().includes('duplicate');

  return new ApiError(
    statusCode ?? (isDuplicate ? 409 : 500),
    errorMessage || defaultMessage,
    defaultMessage
  );
}
