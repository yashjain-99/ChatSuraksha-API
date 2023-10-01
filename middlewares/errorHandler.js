export class AppError extends Error {
  constructor(statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

export function errorHandler(err, req, res, next) {
  console.log(err.stack);
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
  } else {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  }
}
