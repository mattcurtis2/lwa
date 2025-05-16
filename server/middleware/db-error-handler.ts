/**
 * Database Error Handler Middleware
 * 
 * This middleware provides centralized error handling for database connection issues,
 * allowing the application to gracefully handle temporary database availability problems.
 */
import { Request, Response, NextFunction } from 'express';

/**
 * List of error messages that indicate temporary database connection issues
 */
const DB_CONNECTION_ERROR_PATTERNS = [
  'connection reset',
  'socket hang up',
  'ECONNRESET',
  'ETIMEDOUT', 
  'ECONNREFUSED',
  'Connection terminated',
  'Failed to fetch',
  'Control plane request failed',
  'could not connect to server',
  'connection refused'
];

/**
 * Middleware to handle database-related errors
 */
export const dbErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Check if this is a database connection error
  if (isDatabaseConnectionError(err)) {
    console.warn('Database connection error detected, returning friendly response', {
      url: req.url,
      method: req.method,
      errorMessage: err.message
    });
    
    // Return a user-friendly error response
    return res.status(503).json({
      error: 'Database service temporarily unavailable',
      message: 'We are experiencing temporary technical issues. Please try again in a moment.',
      retryable: true
    });
  }
  
  // If it's not a database error, pass to the next error handler
  next(err);
};

/**
 * Helper function to check if an error is related to database connectivity
 */
function isDatabaseConnectionError(err: any): boolean {
  if (!err) return false;
  
  const errorMessage = err.message || err.toString();
  return DB_CONNECTION_ERROR_PATTERNS.some(pattern => 
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
}

/**
 * Wrapper for async route handlers to automatically catch errors
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};