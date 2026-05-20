import { ApiError } from "@/lib/utils/api";

/**
 * Validates ID
 */
export function validateId(id: number | string): boolean {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  return Number.isFinite(numId) && numId > 0;
}

/**
 * Validates and prepares search term for API request
 */
export function validateAndPrepareSearchTerm(searchTerm?: string): string | undefined {
  if (typeof searchTerm !== "string") return undefined;
  
  const trimmedSearchTerm = searchTerm.trim();
  if (trimmedSearchTerm.length === 0) return undefined;
  
  const MAX_SEARCH_TERM_LENGTH = 100;
  return trimmedSearchTerm.slice(0, MAX_SEARCH_TERM_LENGTH);
}

/**
 * Determines status code from error message for delete operations
 */
export function getDeleteErrorStatusCode(errorMsg: string): number {
  const lowerMsg = errorMsg.toLowerCase();

  if (lowerMsg.includes("not found") || lowerMsg.includes("does not exist")) {
    return 404; // Not Found
  } else if (
    lowerMsg.includes("in use") ||
    lowerMsg.includes("linked") ||
    lowerMsg.includes("referenced") ||
    lowerMsg.includes("associated") ||
    lowerMsg.includes("cannot delete") ||
    lowerMsg.includes("referenced by other entities")
  ) {
    return 409; // Conflict - record in use
  } else if (
    lowerMsg.includes("invalid") ||
    lowerMsg.includes("bad request")
  ) {
    return 400; // Bad Request
  } else {
    return 500; // Default to server error
  }
}

/**
 * Creates appropriate ApiError based on response status and message
 * Maps backend reference errors to i18n keys
 */
export function createApiError(
  statusCode?: number, 
  errorMessage?: string, 
  defaultMessage: string = "Operation failed"
): ApiError {
  const errorMsg = errorMessage || "";
  const lowerMsg = errorMsg.toLowerCase();
  
  // Detect duplicate error from backend message
  const isDuplicate = lowerMsg.includes("already exists") || lowerMsg.includes("duplicate");
  
  // Detect reference constraint errors and map to i18n keys
  let finalErrorMessage = errorMessage || defaultMessage;
  
  if (lowerMsg.includes("referenced by other entities")) {
    // Map to i18n key based on context - will be handled by forms
    finalErrorMessage = errorMessage || defaultMessage;
  }
  
  return new ApiError(
    statusCode ?? (isDuplicate ? 409 : 500),
    finalErrorMessage,
    defaultMessage
  );
}

/**
 * Maps reference errors to appropriate i18n keys for specific entity types
 */
export function mapReferenceErrorToI18nKey(
  errorMessage: string,
  entityType: 'group' | 'type' | 'subtype',
  errorConstant: string
): string {
  const lowerMsg = errorMessage.toLowerCase();
  
  if (lowerMsg.includes("referenced by other entities") || lowerMsg.includes("referenced in:")) {
    // Map to entity-specific referenced error i18n key
    switch (entityType) {
      case 'group':
        return 'messages.deleteGroupReferenced';
      case 'type':
        return 'messages.deleteTypeReferenced';
      case 'subtype':
        return 'messages.deleteSubTypeReferenced';
      default:
        return errorConstant;
    }
  }
  
  return errorMessage.startsWith('messages.') ? errorMessage : errorConstant;
}
