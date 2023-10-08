import { validationResult } from "express-validator";
import { AppError } from "./errorHandler.js";

const errorValidatorHandler = (req, res, next) => {
  const err = validationResult(req);
  if (err.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  err.array().map((e) => extractedErrors.push({ [e.path]: e.msg }));
  const error = new AppError(400, "Invalid input", extractedErrors);
  next(error);
};

export default errorValidatorHandler;
