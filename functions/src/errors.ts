
/**
 * Represents an error that occurs due to validation issues.
 * This error is typically thrown when the provided data does not meet the required criteria.
 */
export class ValidationError extends Error {
  statusCode: number;

  /**
   * Creates an instance of ValidationError.
   * @param {string} message - The error message.
   */
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
}

/**
 * Represents a timeout error that occurs when a request takes too long.
 * This error is typically thrown when the operation times out.
 */
export class TimeoutError extends Error {
  statusCode: number;

  /**
   * Creates an instance of TimeoutError.
   * @param {string} message - The error message.
   */
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
    this.statusCode = 504;
  }
}
