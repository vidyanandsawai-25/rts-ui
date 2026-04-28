import { ApiError } from "@/lib/utils/api";
import { OfficeFormModel } from "@/types/office.types";

export function validateOfficeId(id: unknown): id is number {
  return typeof id === "number" && id > 0 && Number.isInteger(id);
}

export function validateAndPrepareSearchTerm(searchTerm?: string): string | undefined {
  if (typeof searchTerm !== "string") return undefined;
  
  const trimmedSearchTerm = searchTerm.trim();
  if (trimmedSearchTerm.length === 0) return undefined;
  
  const MAX_SEARCH_TERM_LENGTH = 100;
  return trimmedSearchTerm.slice(0, MAX_SEARCH_TERM_LENGTH);
}

export function validateCreateFormData(data: OfficeFormModel): void {
  if (!data.officeCode?.trim()) throw new ApiError(400, "Office code is required", "Validation failed");
  if (!data.officeName?.trim()) throw new ApiError(400, "Office name is required", "Validation failed");
}

export function validateUpdateFormData(data: OfficeFormModel): void {
  if (!data.officeId || data.officeId <= 0) throw new ApiError(400, "Valid Office ID is required", "Validation failed");
  validateCreateFormData(data);
}

export function checkBackendResponseErrors(responseData: Record<string, unknown> | null, operation: string): void {
  if (!responseData || typeof responseData !== 'object') return;
  
  const { message: rawMessage, error: rawError } = responseData as {
    message?: unknown;
    error?: unknown;
  };
  const messageValue = rawMessage ?? rawError;
  
  if (typeof messageValue === 'string' && messageValue) {
    const message = messageValue;
    const lowerMsg = message.toLowerCase();

    const isErrorMessage =
      lowerMsg.includes("already exists") ||
      lowerMsg.includes("duplicate") ||
      lowerMsg.includes("error") ||
      lowerMsg.includes("failed") ||
      lowerMsg.includes("invalid") ||
      lowerMsg.includes("not found");

    const isSuccessMessage =
      lowerMsg.includes("success") ||
      lowerMsg.includes("created") ||
      lowerMsg.includes("inserted") ||
      lowerMsg.includes("updated") ||
      lowerMsg.includes("modified");

    if (isErrorMessage && !isSuccessMessage) {
      const isDuplicate =
        lowerMsg.includes("already exists") ||
        lowerMsg.includes("duplicate");

      throw new ApiError(
        isDuplicate ? 409 : 400,
        message,
        `${operation} failed`
      );
    }
  }
}

export function getDeleteErrorStatusCode(errorMsg: string): number {
  const lowerMsg = errorMsg.toLowerCase();

  if (lowerMsg.includes("not found") || lowerMsg.includes("does not exist")) {
    return 404;
  } else if (
    lowerMsg.includes("in use") ||
    lowerMsg.includes("linked") ||
    lowerMsg.includes("referenced") ||
    lowerMsg.includes("associated") ||
    lowerMsg.includes("cannot delete") ||
    lowerMsg.includes("foreign key")
  ) {
    return 409;
  } else if (lowerMsg.includes("invalid") || lowerMsg.includes("bad request")) {
    return 400;
  } else {
    return 500;
  }
}

export function createApiError(statusCode?: number, errorMessage?: string, defaultMessage: string = "Operation failed"): ApiError {
  const errorMsg = errorMessage || "";
  const isDuplicate = errorMsg.toLowerCase().includes("already exists") || 
                      errorMsg.toLowerCase().includes("duplicate");
  
  return new ApiError(
    statusCode ?? (isDuplicate ? 409 : 500),
    errorMessage || defaultMessage,
    defaultMessage
  );
}
