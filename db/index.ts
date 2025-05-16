// Import from our new connection module
import { db, executeQuery, withRetry } from "./connection";
import * as schema from "@db/schema";

// Re-export the schema and the db instance for backwards compatibility
export { db, schema, executeQuery, withRetry };
