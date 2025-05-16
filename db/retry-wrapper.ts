/**
 * Database operation retry wrapper
 * This module provides functions to make database operations more resilient
 * by automatically retrying failed operations due to temporary connection issues.
 */

import { setTimeout } from 'timers/promises';

// Maximum number of retry attempts
const MAX_RETRIES = 3;
// Base delay in milliseconds (using exponential backoff)
const BASE_DELAY = 1000;

// List of error patterns that indicate retryable connection issues
const RETRYABLE_ERROR_PATTERNS = [
  'connection reset',
  'socket hang up',
  'ECONNRESET',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'Connection terminated',
  'Failed to fetch',
  'Control plane request failed',
  'Connection refused',
  'network timeout',
  'availability zone outage'
];

/**
 * Wrapper function that adds retry capability to database operations
 * @param operation Function that performs the database operation
 * @param retries Number of retries remaining
 * @returns Result of the operation
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // Don't retry if we've exhausted our retries
    if (retries <= 0) {
      console.error('Database operation failed after maximum retries:', error);
      throw error;
    }

    // Check if this is a connection error that we should retry
    if (isRetryableError(error)) {
      // Calculate delay with exponential backoff
      const delay = BASE_DELAY * Math.pow(2, MAX_RETRIES - retries);
      console.warn(`Database operation failed, retrying in ${delay}ms... (${retries} retries left)`);
      
      // Wait before retrying
      await setTimeout(delay);
      
      // Retry the operation with one less retry attempt
      return withRetry(operation, retries - 1);
    }

    // For non-retryable errors, just throw
    throw error;
  }
}

/**
 * Determines if an error is related to a temporary connection issue that should be retried
 * @param error The error to check
 * @returns True if the error is retryable
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || error.toString();
  return RETRYABLE_ERROR_PATTERNS.some(pattern => errorMessage.toLowerCase().includes(pattern.toLowerCase()));
}