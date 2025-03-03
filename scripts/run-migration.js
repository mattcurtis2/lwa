
// This script executes TypeScript files using tsx
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptName = process.argv[2];

if (!scriptName) {
  console.error('Please provide a script name to run');
  console.error('Example: node run-migration.js migrate-all-to-s3.ts');
  process.exit(1);
}

// Get current file's directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptPath = path.join(__dirname, scriptName);

console.log(`Running script: ${scriptPath}`);

const child = spawn('npx', ['tsx', scriptPath], {
  stdio: 'inherit'
});

child.on('close', (code) => {
  process.exit(code);
});
