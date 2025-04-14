import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("Running migration to add siteId columns to tables...");
  
  // Connect to the database
  const connectionString = process.env.DATABASE_URL;
  const sql = postgres(connectionString, { max: 1 });
  
  try {
    // Read the SQL file
    const sqlFile = fs.readFileSync(path.join(__dirname, 'add-site-id-columns.sql'), 'utf8');
    
    // Split the SQL into separate statements
    const statements = sqlFile.split(';').filter(stmt => stmt.trim());
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.trim()}`);
        await sql.unsafe(statement.trim());
        console.log("Statement executed successfully");
      }
    }
    
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Error running migration:", error);
    process.exit(1);
  } finally {
    // Close the connection
    await sql.end();
  }
}

runMigration();