
import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { dogs, dogMedia, dogDocuments } from '../db/schema';
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
async function migrateToS3() {
  try {
    console.log('Starting media migration to S3...');
    
    // Fetch all dogs with their media and documents
    const allDogs = await db.query.dogs.findMany({
      with: {
        media: true,
        documents: true
      }
    });
    
    console.log(`Found ${allDogs.length} dogs to process`);
    
    // Process each dog
    for (const dog of allDogs) {
      console.log(`\n=== Processing dog: ${dog.name} (ID: ${dog.id}) ===`);
      
      // Process profile image
      if (dog.profileImageUrl && !isS3Url(dog.profileImageUrl)) {
        console.log(`Processing profile image: ${dog.profileImageUrl}`);
        const s3Url = await processFile(dog.profileImageUrl, `${dog.name}-profile.jpg`);
        
        if (s3Url) {
          console.log(`Updating dog profile image to: ${s3Url}`);
          await db.update(dogs)
            .set({ profileImageUrl: s3Url, updatedAt: new Date() })
            .where(eq(dogs.id, dog.id));
          console.log(`Profile image updated successfully`);
        }
      }
      
      // Process media files
      if (dog.media && dog.media.length > 0) {
        console.log(`Processing ${dog.media.length} media files`);
        
        for (const media of dog.media) {
          if (!isS3Url(media.url)) {
            const s3Url = await processFile(media.url, `${dog.name}-media-${media.id}.${media.type === 'video' ? 'mp4' : 'jpg'}`);
            
            if (s3Url) {
              console.log(`Updating media ID ${media.id} to: ${s3Url}`);
              await db.update(dogMedia)
                .set({ url: s3Url })
                .where(eq(dogMedia.id, media.id));
              console.log(`Media updated successfully`);
            }
          }
        }
      }
      
      // Process documents
      if (dog.documents && dog.documents.length > 0) {
        console.log(`Processing ${dog.documents.length} documents`);
        
        for (const document of dog.documents) {
          if (!isS3Url(document.url)) {
            const s3Url = await processFile(document.url, document.name || `${dog.name}-doc-${document.id}.pdf`);
            
            if (s3Url) {
              console.log(`Updating document ID ${document.id} to: ${s3Url}`);
              await db.update(dogDocuments)
                .set({ url: s3Url })
                .where(eq(dogDocuments.id, document.id));
              console.log(`Document updated successfully`);
            }
          }
        }
      }
      
      console.log(`Completed processing for dog: ${dog.name}`);
    }
    
    console.log('\n=== Migration completed successfully ===');
  } catch (error) {
    console.error('Migration failed with error:', error);
  }
}

// Run the migration
migrateToS3().then(() => {
  console.log('Migration script execution completed');
  process.exit(0);
}).catch(error => {
  console.error('Unhandled error in migration script:', error);
  process.exit(1);
});
