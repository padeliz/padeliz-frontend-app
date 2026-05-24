/**
 * Error thrown by the API client for any non-2xx response (or transport failure).
 * Carries the HTTP status, a human message (from the API body when available),
 * and parsed 422 validation errors.
 */
export class ApiError extends Error {
  status: number;
  validationErrors?: Record<string, string[]>;
  body?: unknown;

  constructor(
    status: number,
    message: string,
    opts?: { validationErrors?: Record<string, string[]>; body?: unknown }
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.validationErrors = opts?.validationErrors;
    this.body = opts?.body;
    // Restore prototype chain (TS target < ES2015 interop safety).
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isValidation(): boolean {
    return this.status === 422;
  }

  /** First validation message, useful for a quick banner. */
  get firstValidationMessage(): string | undefined {
    if (!this.validationErrors) return undefined;
    const first = Object.values(this.validationErrors)[0];
    return first?.[0];
  }
}
