
// This script executes TypeScript files using tsx
const { spawn } = require('child_process');
const path = require('path');

const scriptName = process.argv[2];

if (!scriptName) {
  console.error('Please provide a script name to run');
  console.error('Example: node run-migration.js migrate-all-to-s3.ts');
  process.exit(1);
}

const scriptPath = path.join(__dirname, scriptName);

console.log(`Running script: ${scriptPath}`);

const child = spawn('npx', ['tsx', scriptPath], {
  stdio: 'inherit'
});

child.on('close', (code) => {
  process.exit(code);
});
