
// Master script to run all migrations in sequence

import { spawn } from 'child_process';

const scripts = [
  'migrate-media-to-s3.ts',
  'migrate-goats-to-s3.ts',
  'migrate-dogs-to-s3.ts',
  'migrate-site-content-to-s3.ts'
];

async function runScript(scriptName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`\n=== RUNNING ${scriptName} ===\n`);
    
    const child = spawn('npx', ['tsx', `scripts/${scriptName}`], {
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n=== COMPLETED ${scriptName} ===\n`);
        resolve();
      } else {
        console.error(`\n=== FAILED ${scriptName} with code ${code} ===\n`);
        reject(new Error(`Script ${scriptName} failed with code ${code}`));
      }
    });
    
    child.on('error', (err) => {
      console.error(`\n=== ERROR RUNNING ${scriptName}: ${err.message} ===\n`);
      reject(err);
    });
  });
}

async function runAllMigrations() {
  console.log('=== STARTING ALL MIGRATIONS ===');
  
  for (const script of scripts) {
    try {
      await runScript(script);
    } catch (error) {
      console.error(`Failed to run ${script}:`, error);
      process.exit(1);
    }
  }
  
  console.log('=== ALL MIGRATIONS COMPLETED SUCCESSFULLY ===');
}

runAllMigrations().catch(error => {
  console.error('Migration master script failed:', error);
  process.exit(1);
});
