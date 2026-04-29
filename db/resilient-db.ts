/**
 * Resilient Database Module
 * 
 * This module provides a more robust database connection with automatic retry
 * capability for transient connection issues. It's designed to prevent application
 * crashes when temporary database availability problems occur.
 */

import { drizzle } from "drizzle-orm/neon-serverless";
import { neonConfig, Pool } from '@neondatabase/serverless';
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

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// Configure WebSocket constructor for Node.js environments
neonConfig.webSocketConstructor = ws;

// Create a pool and attach an error listener so a failed connection
// does not emit an unhandled 'error' event that crashes the process.
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
pool.on('error', (err) => {
  console.error('Database pool error (non-fatal):', err.message);
});

export const db = drizzle(pool, { schema });

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