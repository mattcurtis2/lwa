
import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { dogs, dogMedia, dogDocuments, goats, goatMedia, goatDocuments, siteContent, carouselItems } from '../db/schema';

// Function to check if a URL is from S3
function isS3Url(url: string): boolean {
  return url && (
    url.includes('s3.amazonaws.com') || 
    url.includes('s3.us-east-2.amazonaws.com') ||
    url.startsWith('https://lwacontent') ||
    url.startsWith('https://askanswercontent')
  );
}

// Helper function to convert local path to file path
function localPathToFilePath(url: string): string {
  if (url.startsWith('/uploads/')) {
    return path.join(process.cwd(), url.substring(1));
  }
  return '';
}

// Main cleanup function
async function cleanupLocalFiles() {
  try {
    console.log('Starting cleanup of local files...');
    
    let removedCount = 0;
    let skippedCount = 0;
    const uploadsFolderPath = path.join(process.cwd(), 'uploads');
    
    // Check if uploads folder exists
    if (!fs.existsSync(uploadsFolderPath)) {
      console.log('The uploads folder does not exist. Nothing to clean up.');
      return;
    }

    // Get all database entities that might reference files
    console.log('Fetching all media references from the database...');
    
    // Fetch dogs with their media and documents
    const allDogs = await db.query.dogs.findMany({
      with: {
        media: true,
        documents: true
      }
    });
    
    // Fetch goats with their media and documents
    const allGoats = await db.query.goats.findMany({
      with: {
        media: true,
        documents: true
      }
    });
    
    // Fetch site content images
    const allSiteContent = await db.query.siteContent.findMany({
      where: (content, { eq }) => eq(content.type, 'image')
    });
    
    // Fetch carousel items
    const allCarouselItems = await db.query.carouselItems.findMany();
    
    // Create a set of all URLs being used in the database
    const usedUrls = new Set<string>();
    
    // Add dog profile images and media
    for (const dog of allDogs) {
      if (dog.profileImageUrl) {
        usedUrls.add(dog.profileImageUrl);
      }
      
      for (const media of dog.media || []) {
        if (media.url) {
          usedUrls.add(media.url);
        }
      }
      
      for (const doc of dog.documents || []) {
        if (doc.url) {
          usedUrls.add(doc.url);
        }
      }
    }
    
    // Add goat profile images and media
    for (const goat of allGoats) {
      if (goat.profileImageUrl) {
        usedUrls.add(goat.profileImageUrl);
      }
      
      for (const media of goat.media || []) {
        if (media.url) {
          usedUrls.add(media.url);
        }
      }
      
      for (const doc of goat.documents || []) {
        if (doc.url) {
          usedUrls.add(doc.url);
        }
      }
    }
    
    // Add site content images
    for (const content of allSiteContent) {
      if (content.value) {
        usedUrls.add(content.value);
      }
    }
    
    // Add carousel item images
    for (const item of allCarouselItems) {
      if (item.imageUrl) {
        usedUrls.add(item.imageUrl);
      }
    }
    
    console.log(`Found ${usedUrls.size} media URLs in the database`);
    
    // Get all local files in uploads directory
    const allLocalFiles = fs.readdirSync(uploadsFolderPath);
    console.log(`Found ${allLocalFiles.length} files in the uploads directory`);
    
    // Process each local file
    for (const fileName of allLocalFiles) {
      const filePath = path.join(uploadsFolderPath, fileName);
      const localUrl = `/uploads/${fileName}`;
      
      // Check if file stats are available
      try {
        const stats = fs.statSync(filePath);
        if (!stats.isFile()) {
          console.log(`Skipping non-file: ${filePath}`);
          continue;
        }
      } catch (error) {
        console.error(`Error checking file stats for ${filePath}:`, error);
        continue;
      }
      
      // Case 1: File is no longer referenced in the database
      if (!usedUrls.has(localUrl)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`Removed unreferenced file: ${fileName}`);
          removedCount++;
        } catch (error) {
          console.error(`Error removing unreferenced file ${fileName}:`, error);
        }
        continue;
      }
      
      // Case 2: File is referenced, but check if it's now in S3
      for (const url of usedUrls) {
        if (url === localUrl) {
          // Check if this entity has been migrated to S3
          const isEntityMigrated = Array.from(usedUrls).some(u => u.includes(fileName) && isS3Url(u));
          
          if (isEntityMigrated) {
            try {
              fs.unlinkSync(filePath);
              console.log(`Removed local file that's now on S3: ${fileName}`);
              removedCount++;
            } catch (error) {
              console.error(`Error removing S3-migrated file ${fileName}:`, error);
            }
          } else {
            console.log(`Skipping file that's not yet migrated to S3: ${fileName}`);
            skippedCount++;
          }
          break;
        }
      }
    }
    
    console.log(`\n=== Cleanup completed ===`);
    console.log(`Removed ${removedCount} local files`);
    console.log(`Skipped ${skippedCount} files that are not yet migrated to S3`);
    
  } catch (error) {
    console.error('Cleanup failed with error:', error);
  }
}

// Run the cleanup
cleanupLocalFiles().then(() => {
  console.log('Local file cleanup script execution completed');
  process.exit(0);
}).catch(error => {
  console.error('Unhandled error in local file cleanup script:', error);
  process.exit(1);
});
