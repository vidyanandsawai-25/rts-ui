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

/**
 * Creates base fetch options with common headers
 *
 * @param method HTTP method (GET, POST, PUT, DELETE)
 * @param body Optional request body
 * @returns Configured RequestInit object
 */
export function createFetchOptions(
  method: string = "GET",
  body?: unknown
): RequestInit {
  const options: RequestInit = {
    method,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  return options;
}
