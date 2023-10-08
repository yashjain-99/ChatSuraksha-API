export class AppError extends Error {
  constructor(statusCode, message, errors = []) {
    super();
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
  }
}

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    if (err.errors.length > 0)
      return res.status(err.statusCode).json({ errors: err.errors });
    res.status(err.statusCode).json({ error: err.message });
  } else {
    res.status(500).json({ error: "Something went wrong!" });
  }
}
