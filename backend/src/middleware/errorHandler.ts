import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";
import { HttpError } from "../utils/httpError";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const statusCode = err instanceof HttpError ? err.statusCode : 500;
  const message = err.message || "Internal Server Error";

  if (statusCode >= 500) {
    logger.error({ err }, "Unhandled server error");
  } else {
    logger.warn({ err }, "Handled error");
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: err instanceof HttpError ? err.details : undefined,
  });
}
