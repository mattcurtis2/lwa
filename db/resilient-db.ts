/**
 * Resilient Database Module
 * 
 * This module provides a more robust database connection with automatic retry
 * capability for transient connection issues. It's designed to prevent application
 * crashes when temporary database availability problems occur.
 */

import { drizzle } from "drizzle-orm/neon-serverless";
import { neonConfig } from '@neondatabase/serverless';
import * as schema from "@db/schema";
import ws from 'ws';
import { setTimeout } from 'timers/promises';

// Maximum number of retry attempts
const MAX_RETRIES = 3;
// Base delay in milliseconds (using exponential backoff)
const BASE_DELAY = 1000;

// Error patterns that indicate temporary connection issues
const RETRYABLE_ERROR_PATTERNS = [
  'connection reset',
  'socket hang up',
  'ECONNRESET',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'Connection terminated',
  'Failed to fetch',
  'Control plane request failed'
];

// Configure Neon database client for better resilience
neonConfig.webSocketConstructor = ws;
neonConfig.fetchConnectionCache = true; // Enable connection caching
neonConfig.useSecureWebSocket = true;

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// Initialize the database with Drizzle ORM
// Use non-null assertion since we've checked above
export const db = drizzle(process.env.DATABASE_URL!, { schema });

/**
 * Wrapper function to add retry capability to database operations
 * @param operation The database operation function to execute
 * @param retries Number of retries remaining
 * @returns The result of the operation
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // If we're out of retries, log and throw the error
    if (retries <= 0) {
      console.error('Database operation failed after maximum retries:', error);
      throw error;
    }

    // Check if the error is retryable
    if (isRetryableError(error)) {
      // Calculate delay with exponential backoff
      const delay = BASE_DELAY * Math.pow(2, MAX_RETRIES - retries);
      console.warn(`Database operation failed, retrying in ${delay}ms... (${retries} retries left)`);
      
      // Wait before retrying
      await setTimeout(delay);
      
      // Retry with one less retry attempt
      return withRetry(operation, retries - 1);
    }

    // For non-retryable errors, just throw
    throw error;
  }
}

/**
 * Helper function to check if an error is related to a temporary connection issue
 * @param error The error to check
 * @returns True if the error should be retried
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || error.toString();
  return RETRYABLE_ERROR_PATTERNS.some(pattern => errorMessage.toLowerCase().includes(pattern.toLowerCase()));
}

/**
 * Execute a database query with automatic retry for transient connection issues
 * @param queryFn Function that performs the database query
 * @returns Result of the query
 */
export async function executeQuery<T>(queryFn: () => Promise<T>): Promise<T> {
  return withRetry(queryFn);
}

// Export the schema for convenience
export { schema };