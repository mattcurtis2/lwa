import { Request, Response, NextFunction } from 'express';

// Central error handler middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler caught:', err);
  
  // Check if the error is a database connection error
  if (isDatabaseConnectionError(err)) {
    return res.status(503).json({
      error: 'Database service temporarily unavailable',
      message: 'We are experiencing temporary issues with our database. Please try again in a moment.',
      retryable: true
    });
  }
  
  // Default error response
  return res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
};

// Helper function to identify database connection errors
function isDatabaseConnectionError(err: any): boolean {
  const errorMessage = err?.message || err?.toString() || '';
  
  const connectionErrorPatterns = [
    'connection reset',
    'socket hang up',
    'ECONNRESET',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'Connection terminated',
    'Failed to fetch',
    'Control plane request failed'
  ];
  
  return connectionErrorPatterns.some(pattern => errorMessage.includes(pattern));
}

// Middleware to wrap async route handlers with error handling
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};