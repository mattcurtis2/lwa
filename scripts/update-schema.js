// Script to apply schema changes
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Temporary drizzle config
const tempConfigPath = path.join(__dirname, 'temp-drizzle.config.ts');

// Create a temporary config that will auto-accept schema changes
const drizzleConfigContent = `
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // Auto-approve migrations
  verbose: true,
  strict: false,
});
`;

try {
  // Write temporary config
  fs.writeFileSync(tempConfigPath, drizzleConfigContent);
  
  // Run the migration with custom config
  console.log('Applying schema changes...');
  execSync(`npx drizzle-kit push --config=${tempConfigPath}`, { stdio: 'inherit' });
  
  console.log('Schema changes applied successfully!');
} catch (error) {
  console.error('Error applying schema changes:', error);
} finally {
  // Clean up temporary config
  if (fs.existsSync(tempConfigPath)) {
    fs.unlinkSync(tempConfigPath);
  }
}