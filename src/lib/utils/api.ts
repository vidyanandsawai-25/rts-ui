import { ApiResponse } from "@/types/common.types";

export class ApiError extends Error {
  public responseText: string;

  constructor(
    public statusCode: number,
    public error: string,
    public contextMessage: string
  ) {
    super(`${contextMessage}: ${error} (${statusCode})`);
    this.name = "ApiError";
    this.responseText = error; // Keep compatibility with existing code that uses responseText
    
    // Ensure instanceof works correctly
    Object.setPrototypeOf(this, ApiError.prototype);
    // Optionally capture stack trace for V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Identifies wrapped inner API payloads that encode failure with their own success flag.
 * This intentionally excludes generic action/result payloads like { success: false, error }
 * so callers can handle those responses without an exception being thrown.
 */
function isWrappedInnerApiError(data: unknown): data is Record<string, unknown> {
  if (!data || typeof data !== "object") {
    return false;
  }
  const payload = data as Record<string, unknown>;
  // We check for 'items' or 'errors' to identify a wrapped API response vs a simple ActionResult
  return payload["success"] === false && ("items" in payload || "errors" in payload);
}

/**
 * Validates API response and throws ApiError if unsuccessful
 */
export function handleApiResponse<T>(response: ApiResponse<T>, message: string): T {
  if (!response.success || response.data === undefined || response.data === null) {
    throw new ApiError(
      response.statusCode || 500,
      response.error || "Unknown error",
      message
    );
  }

  // Check for wrapped inner API failures without treating generic ActionResult payloads as exceptions
  const data = response.data as Record<string, unknown>;
  if (isWrappedInnerApiError(data)) {
    throw new ApiError(
      response.statusCode || 500,
      String(data["message"] || data["error"] || "API execution failed"),
      message
    );
  }

  return response.data;
}
