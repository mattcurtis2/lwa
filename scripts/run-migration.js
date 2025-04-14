const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the SQL file path
const sqlFilePath = path.join(__dirname, 'add-site-id-columns.sql');

// Read the SQL file
const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');

// Check if we have a DATABASE_URL environment variable
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('Running database migration...');

// Execute the SQL using the psql command
const result = spawnSync('psql', [process.env.DATABASE_URL, '-c', sqlQuery], {
  stdio: 'inherit',
  shell: true
});

// Check the result
if (result.error) {
  console.error('Error executing SQL:', result.error);
  process.exit(1);
}

if (result.status !== 0) {
  console.error(`Command failed with exit code ${result.status}`);
  process.exit(result.status);
}

console.log('Migration completed successfully!');