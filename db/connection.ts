import { drizzle } from "drizzle-orm/neon-serverless";
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from "@db/schema";
import { withRetry } from "./retry-wrapper";
import ws from 'ws';

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure Neon for better connection resilience
neonConfig.webSocketConstructor = ws;
neonConfig.fetchConnectionCache = true;
neonConfig.wsConnectionTimeout = 30_000; // 30 seconds
neonConfig.pipelineConnect = false; // More conservative connection approach
neonConfig.useSecureWebSocket = true;

// Create a database connection function that uses the connection string
function createDbConnection() {
  // Using the connection string directly works better with Drizzle
  return process.env.DATABASE_URL;
}

// Initialize Drizzle ORM with the database connection
export const db = drizzle(createDbConnection(), { schema });

/**
 * Execute a database query with automatic retry for transient connection issues
 * @param queryFn Function that performs the database query
 * @returns Result of the query
 */
export async function executeQuery<T>(queryFn: () => Promise<T>): Promise<T> {
  return withRetry(queryFn);
}

// Export the schema and retry helper for convenience
export { schema, withRetry };