import { drizzle } from "drizzle-orm/neon-http";
import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import * as schema from "@db/schema";
import { withRetry } from "./retry-wrapper";

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// @neondatabase/serverless v1.0.0 changed neon() to tagged-template-only at runtime,
// but drizzle-orm/neon-http calls the client as a conventional function (sql, params, opts).
// We compose a NeonQueryFunction-compatible client that routes those calls to .query().
const _neonSql = neon(process.env.DATABASE_URL!);
const neonHttpClient: NeonQueryFunction<false, false> = Object.assign(
  (sql: string, params?: unknown[], options?: Parameters<typeof _neonSql.query>[2]) =>
    _neonSql.query(sql, params as Parameters<typeof _neonSql.query>[1], options),
  _neonSql
);

// Initialize Drizzle ORM using HTTP transport (no WebSocket required)
export const db = drizzle(neonHttpClient, { schema });

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