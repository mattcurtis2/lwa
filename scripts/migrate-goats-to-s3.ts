
import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { goats, goatMedia, goatDocuments } from '../db/schema';
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

// Process a single file
async function processFile(url: string, fileName: string): Promise<string | null> {
  try {
    if (isS3Url(url)) {
      console.log(`Skipping already S3 hosted file: ${url}`);
      return null;
    }

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
async function migrateGoatsToS3() {
  try {
    console.log('Starting goat media migration to S3...');
    
    // Fetch all goats with their media and documents
    const allGoats = await db.query.goats.findMany({
      with: {
        media: true,
        documents: true
      }
    });
    
    console.log(`Found ${allGoats.length} goats to process`);
    
    // Process each goat
    for (const goat of allGoats) {
      console.log(`\n=== Processing goat: ${goat.name} (ID: ${goat.id}) ===`);
      
      // Process profile image
      if (goat.profileImageUrl && !isS3Url(goat.profileImageUrl)) {
        console.log(`Processing profile image: ${goat.profileImageUrl}`);
        const s3Url = await processFile(goat.profileImageUrl, `${goat.name}-profile.jpg`);
        
        if (s3Url) {
          console.log(`Updating goat profile image to: ${s3Url}`);
          await db.update(goats)
            .set({ profileImageUrl: s3Url, updatedAt: new Date() })
            .where(eq(goats.id, goat.id));
          console.log(`Profile image updated successfully`);
        }
      }
      
      // Process media files
      if (goat.media && goat.media.length > 0) {
        console.log(`Processing ${goat.media.length} media files`);
        
        for (const media of goat.media) {
          if (!isS3Url(media.url)) {
            const s3Url = await processFile(media.url, `${goat.name}-media-${media.id}.${media.type === 'video' ? 'mp4' : 'jpg'}`);
            
            if (s3Url) {
              console.log(`Updating media ID ${media.id} to: ${s3Url}`);
              await db.update(goatMedia)
                .set({ url: s3Url })
                .where(eq(goatMedia.id, media.id));
              console.log(`Media updated successfully`);
            }
          }
        }
      }
      
      // Process documents
      if (goat.documents && goat.documents.length > 0) {
        console.log(`Processing ${goat.documents.length} documents`);
        
        for (const document of goat.documents) {
          if (!isS3Url(document.url)) {
            const s3Url = await processFile(document.url, document.name || `${goat.name}-doc-${document.id}.pdf`);
            
            if (s3Url) {
              console.log(`Updating document ID ${document.id} to: ${s3Url}`);
              await db.update(goatDocuments)
                .set({ url: s3Url })
                .where(eq(goatDocuments.id, document.id));
              console.log(`Document updated successfully`);
            }
          }
        }
      }
      
      console.log(`Completed processing for goat: ${goat.name}`);
    }
    
    console.log('\n=== Goat migration completed successfully ===');
  } catch (error) {
    console.error('Goat migration failed with error:', error);
  }
}

// Run the migration
migrateGoatsToS3().then(() => {
  console.log('Goat migration script execution completed');
  process.exit(0);
}).catch(error => {
  console.error('Unhandled error in goat migration script:', error);
  process.exit(1);
});
