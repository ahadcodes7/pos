class ApiError extends Error {
  status: number;
  errors: unknown[];

  constructor(message: string, status = 400, errors: unknown[] = []) {
    super(message);
    this.status = status;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
