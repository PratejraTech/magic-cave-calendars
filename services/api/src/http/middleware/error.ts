import { Request, Response, NextFunction } from 'express';

/**
 * Global error handler middleware
 * Handles all errors that occur during request processing
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error (silently - logging implementation TBD)
  // TODO: Implement proper error logging service

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';
  let errorCode = 'INTERNAL_ERROR';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    // Joi validation error
    statusCode = 400;
    message = 'Validation failed';
    errorCode = 'VALIDATION_ERROR';
  } else if (error.name === 'UnauthorizedError') {
    // JWT authentication error
    statusCode = 401;
    message = 'Authentication required';
    errorCode = 'AUTH_REQUIRED';
  } else if (error.code === 'PGRST116') {
    // Supabase RLS violation
    statusCode = 403;
    message = 'Access denied';
    errorCode = 'ACCESS_DENIED';
  } else if (error.code === '23505') {
    // PostgreSQL unique constraint violation
    statusCode = 409;
    message = 'Resource already exists';
    errorCode = 'DUPLICATE_RESOURCE';
  } else if (error.code === '23503') {
    // PostgreSQL foreign key constraint violation
    statusCode = 400;
    message = 'Invalid reference';
    errorCode = 'INVALID_REFERENCE';
  } else if (error.message?.includes('JWT')) {
    // JWT-related errors
    statusCode = 401;
    message = 'Invalid authentication token';
    errorCode = 'INVALID_TOKEN';
  }

  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  const errorResponse: any = {
    error: errorCode,
    message,
    timestamp: new Date().toISOString(),
  };

  // Include stack trace and details in development
  if (isDevelopment) {
    errorResponse.details = error.message;
    errorResponse.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Async error wrapper for route handlers
 * Catches async errors and passes them to the error handler
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};