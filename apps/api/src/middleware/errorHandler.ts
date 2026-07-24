/**
 * FleetNest — Global Error Handler
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

/**
 * Custom API Error class with HTTP status code
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found handler — must be registered AFTER all routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
}

/**
 * Global error handling middleware — must be last middleware registered
 */
export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  logger.error(`[${req.method} ${req.originalUrl}] ${err.message}`, {
    stack: err.stack,
    body: req.body,
  });

  // Prisma-specific errors
  if (err.name === 'PrismaClientInitializationError') {
    res.status(503).json({
      success: false,
      message: 'Database service is currently unreachable. Please make sure PostgreSQL server is running on port 5432.',
    });
    return;
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    if (prismaError.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'A record with this data already exists.',
        field: prismaError.meta?.target,
      });
      return;
    }
    if (prismaError.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Record not found.',
      });
      return;
    }
  }

  // Validation errors from express-validator
  if (err.name === 'ValidationError') {
    res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: (err as any).errors,
    });
    return;
  }

  // Custom API errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // Generic server error
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again later.'
      : err.message,
  });
}
