/**
 * Base application error class
 * All application-specific errors should extend this
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string = "APP_ERROR",
    public statusCode: number = 400,
    public details?: unknown,
  ) {
    super(message);
    this.name = "AppError";

    // Ensures proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Resource not found error
 * Used when a requested resource cannot be found
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with id '${id}' not found` : `${resource} not found`,
      "NOT_FOUND",
      404,
    );
    this.name = "NotFoundError";

    // Ensures proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Validation error
 * Used when input data fails validation
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";

    // Ensures proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Internal error
 * Used for unexpected internal errors
 */
export class InternalError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, "INTERNAL_ERROR", 500, details);
    this.name = "InternalError";

    // Ensures proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, InternalError.prototype);
  }
}
