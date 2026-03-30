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
  }
}
