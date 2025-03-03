
import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { dogDocuments } from '../db/schema';
import { eq } from 'drizzle-orm';

// List of missing files based on the migration logs
const missingFiles = [
  '/uploads/file-1741011630584-436283289.pdf',
  '/uploads/file-1741011646286-144056901.pdf',
  '/uploads/file-1741012282680-557730626.pdf',
  '/uploads/file-1741012548129-878861998.pdf',
  '/uploads/file-1741012449487-13007206.pdf',
];

// Helper function to convert local path to file path
function localPathToFilePath(url: string): string {
  if (url.startsWith('/uploads/')) {
    return path.join(process.cwd(), url.substring(1));
  }
  return '';
}

// Check all document records and remove any that reference missing files
async function cleanMissingDocuments() {
  try {
    console.log('Starting cleanup of missing document references...');
    
    // Get all document records
    const allDocuments = await db.query.dogDocuments.findMany();
    console.log(`Found ${allDocuments.length} document records in database`);
    
    let removedCount = 0;
    
    // Process each document
    for (const document of allDocuments) {
      // Skip documents that are already on S3
      if (document.url.includes('s3.amazonaws.com') || 
          document.url.includes('s3.us-east-2.amazonaws.com') ||
          document.url.startsWith('https://lwacontent') ||
          document.url.startsWith('https://askanswercontent')) {
        continue;
      }
      
      // Check if file exists
      const filePath = localPathToFilePath(document.url);
      if (!filePath || !fs.existsSync(filePath) || missingFiles.includes(document.url)) {
        console.log(`File not found for document ID ${document.id}: ${document.url}`);
        
        // Remove the reference from the database
        await db.delete(dogDocuments).where(eq(dogDocuments.id, document.id));
        console.log(`Removed document record with ID ${document.id}`);
        removedCount++;
      }
    }
    
    console.log(`\n=== Cleanup completed ===`);
    console.log(`Removed ${removedCount} document references to missing files`);
    
  } catch (error) {
    console.error('Cleanup failed with error:', error);
  }
}

// Run the cleanup
cleanMissingDocuments().then(() => {
  console.log('Document cleanup script execution completed');
  process.exit(0);
}).catch(error => {
  console.error('Unhandled error in document cleanup script:', error);
  process.exit(1);
});
