import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@db/schema";
import { setTimeout } from "timers/promises";

// Maximum number of retry attempts
const MAX_RETRIES = 3;
// Base delay in milliseconds (using exponential backoff)
const BASE_DELAY = 1000;

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Helper function to create a Drizzle instance
function createDrizzleInstance() {
  return drizzle({
    connection: process.env.DATABASE_URL,
    schema,
    ws: ws,
  });
}

// Create the initial database instance
export const db = createDrizzleInstance();

// Wrapper function for database operations with retry logic
export async function withRetry<T>(
  operation: () => Promise<T>, 
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    // Don't retry if we've exhausted our retries
    if (retries <= 0) {
      console.error("Database operation failed after maximum retries:", error);
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

// Helper function to determine if an error is retryable
function isRetryableError(error: any): boolean {
  // List of error messages/codes that indicate connection issues
  const connectionErrorPatterns = [
    "connection reset",
    "socket hang up",
    "ECONNRESET",
    "ETIMEDOUT",
    "ECONNREFUSED",
    "Connection terminated",
    "Failed to fetch",
    "Control plane request failed"
  ];
  
  const errorMessage = error.message || error.toString();
  return connectionErrorPatterns.some(pattern => errorMessage.includes(pattern));
}

// Helper to execute a query with retry logic
export async function executeQuery<T>(queryFn: () => Promise<T>): Promise<T> {
  return withRetry(queryFn);
}