
import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { principles } from '../db/schema';
import { eq } from 'drizzle-orm';

// Import S3 utility dynamically
async function importS3Utils() {
  return import('../server/utils/s3.js');
}

// Helper function to convert local path to file path
function localPathToFilePath(url: string): string {
  if (url.startsWith('/uploads/')) {
    return path.join(process.cwd(), url.substring(1));
  }
  return '';
}

// Helper function to check if a URL is already on S3
function isS3Url(url: string): boolean {
  return url && (
    url.includes('s3.amazonaws.com') || 
    url.includes('s3.us-east-2.amazonaws.com') ||
    url.startsWith('https://lwacontent') ||
    url.startsWith('https://askanswercontent')
  );
}

// Helper function to check if a URL is data URL (base64 encoded)
function isDataUrl(url: string): boolean {
  return url && url.startsWith('data:');
}

// Process a single file
async function processFile(url: string, fileName: string): Promise<string | null> {
  try {
    if (isS3Url(url)) {
      console.log(`Skipping already S3 hosted file: ${url}`);
      return null;
    }

    // Handle base64/data URLs
    if (isDataUrl(url)) {
      console.log(`Processing base64 data URL`);
      // Extract the MIME type and base64 data
      const matches = url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      
      if (!matches || matches.length !== 3) {
        console.error('Invalid data URL format');
        return null;
      }
      
      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Create a temporary file
      const tempFilePath = path.join(process.cwd(), 'temp-image.jpg');
      fs.writeFileSync(tempFilePath, buffer);
      
      // Create a file object for S3 upload
      const file = {
        originalname: fileName || 'principle-image.jpg',
        path: tempFilePath,
        mimetype: mimeType,
        size: buffer.length
      };
      
      // Import and use S3 upload utility
      const { uploadToS3 } = await importS3Utils();
      const s3Url = await uploadToS3(file);
      
      // Clean up the temporary file
      fs.unlinkSync(tempFilePath);
      
      console.log(`Successfully uploaded base64 image to S3: ${s3Url}`);
      return s3Url;
    }

    // Handle local file URLs
    const filePath = localPathToFilePath(url);
    if (!filePath || !fs.existsSync(filePath)) {
      console.error(`File not found at path: ${filePath}`);
      return null;
    }

    console.log(`Processing file: ${filePath}`);
    
    // Create a "file" object similar to what multer would provide
    const fileData = fs.readFileSync(filePath);
    const mimeType = path.extname(filePath).toLowerCase() === '.pdf' 
      ? 'application/pdf'
      : path.extname(filePath).toLowerCase() === '.mp4'
        ? 'video/mp4'
        : 'image/jpeg';
    
    const file = {
      originalname: fileName || path.basename(filePath),
      path: filePath,
      mimetype: mimeType,
      size: fileData.length
    };

    // Import and use S3 upload utility
    const { uploadToS3 } = await importS3Utils();
    const s3Url = await uploadToS3(file);
    
    console.log(`Successfully uploaded to S3: ${s3Url}`);
    return s3Url;
  } catch (error) {
    console.error(`Error processing file ${url}:`, error);
    return null;
  }
}

// Main migration function
async function migratePrinciplesToS3() {
  try {
    console.log('Starting principles migration to S3...');
    
    // Fetch all principles
    const allPrinciples = await db.query.principles.findMany();
    
    console.log(`Found ${allPrinciples.length} principles to process`);
    
    // Process each principle
    for (const principle of allPrinciples) {
      console.log(`\n=== Processing principle: ${principle.title} (ID: ${principle.id}) ===`);
      
      // Process image
      if (principle.imageUrl && !isS3Url(principle.imageUrl)) {
        console.log(`Processing principle image: ${principle.imageUrl.substring(0, 50)}...`);
        const s3Url = await processFile(principle.imageUrl, `principle-${principle.id}-${principle.title.replace(/\s+/g, '-').toLowerCase()}.jpg`);
        
        if (s3Url) {
          console.log(`Updating principle image to: ${s3Url}`);
          await db.update(principles)
            .set({ imageUrl: s3Url, updatedAt: new Date() })
            .where(eq(principles.id, principle.id));
          console.log(`Principle image updated successfully`);
        }
      } else {
        console.log(`Principle already has an S3 URL or no image URL`);
      }
      
      console.log(`Completed processing for principle: ${principle.title}`);
    }
    
    console.log('\n=== Principles migration completed successfully ===');
  } catch (error) {
    console.error('Principles migration failed with error:', error);
  }
}

// Run the migration
migratePrinciplesToS3().then(() => {
  console.log('Principles migration script execution completed');
  process.exit(0);
}).catch(error => {
  console.error('Unhandled error in principles migration script:', error);
  process.exit(1);
});
