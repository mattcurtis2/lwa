import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("Running migration to add siteId columns to media tables...");
  
  // Connect to the database using the same approach as the main app
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);
  
  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'add-media-site-id-columns.sql');
    const sqlFile = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the SQL into separate statements
    const statements = sqlFile.split(';').filter(stmt => stmt.trim());
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.trim()}`);
        await sql(statement.trim());
        console.log("Statement executed successfully");
      }
    }
    
    console.log("Media tables migration completed successfully!");
  } catch (error) {
    console.error("Error running migration:", error);
    process.exit(1);
  }
}

runMigration();