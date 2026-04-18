/**
 * Custom error class for API errors with structured information
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public responseText: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
    // Ensure instanceof works correctly
    Object.setPrototypeOf(this, ApiError.prototype);
    // Optionally capture stack trace for V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}
