export class ValidationError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
}

export class TimeoutError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
    this.statusCode = 504;
  }
}
