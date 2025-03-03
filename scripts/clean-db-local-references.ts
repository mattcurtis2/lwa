
import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { dogs, dogMedia, dogDocuments, goats, goatMedia, goatDocuments, siteContent, carouselItems, dogsHero, principles } from '../db/schema';
import { eq, like } from 'drizzle-orm';

// Function to check if a URL is from S3
function isS3Url(url: string): boolean {
  return url && (
    url.includes('s3.amazonaws.com') || 
    url.includes('s3.us-east-2.amazonaws.com') ||
    url.startsWith('https://lwacontent') ||
    url.startsWith('https://askanswercontent')
  );
}

// Helper function to check if a URL is local
function isLocalUrl(url: string): boolean {
  return url && url.startsWith('/uploads/');
}

// Helper function to convert local path to file path
function localPathToFilePath(url: string): string {
  if (url.startsWith('/uploads/')) {
    return path.join(process.cwd(), url.substring(1));
  }
  return '';
}

// Main cleanup function
async function cleanDbLocalReferences() {
  try {
    console.log('Starting cleanup of database records with local file references...');
    
    const uploadsFolderPath = path.join(process.cwd(), 'uploads');
    let totalRemovedRecords = 0;
    
    // Check if uploads folder exists
    const uploadsExists = fs.existsSync(uploadsFolderPath);
    
    // 1. Clean up dog media records
    console.log('\nCleaning dog media records...');
    const dogMediaRecords = await db.query.dogMedia.findMany({
      where: like(dogMedia.url, '/uploads/%')
    });
    
    console.log(`Found ${dogMediaRecords.length} dog media records with local URLs`);
    
    for (const record of dogMediaRecords) {
      // If the file doesn't exist or the folder doesn't exist
      const filePath = localPathToFilePath(record.url);
      if (!uploadsExists || !filePath || !fs.existsSync(filePath)) {
        await db.delete(dogMedia).where(eq(dogMedia.id, record.id));
        console.log(`Removed dog media record with ID ${record.id} (missing file: ${record.url})`);
        totalRemovedRecords++;
      }
    }
    
    // 2. Clean up dog documents records
    console.log('\nCleaning dog documents records...');
    const dogDocsRecords = await db.query.dogDocuments.findMany({
      where: like(dogDocuments.url, '/uploads/%')
    });
    
    console.log(`Found ${dogDocsRecords.length} dog document records with local URLs`);
    
    for (const record of dogDocsRecords) {
      const filePath = localPathToFilePath(record.url);
      if (!uploadsExists || !filePath || !fs.existsSync(filePath)) {
        await db.delete(dogDocuments).where(eq(dogDocuments.id, record.id));
        console.log(`Removed dog document record with ID ${record.id} (missing file: ${record.url})`);
        totalRemovedRecords++;
      }
    }
    
    // 3. Clean up goat media records
    console.log('\nCleaning goat media records...');
    const goatMediaRecords = await db.query.goatMedia.findMany({
      where: like(goatMedia.url, '/uploads/%')
    });
    
    console.log(`Found ${goatMediaRecords.length} goat media records with local URLs`);
    
    for (const record of goatMediaRecords) {
      const filePath = localPathToFilePath(record.url);
      if (!uploadsExists || !filePath || !fs.existsSync(filePath)) {
        await db.delete(goatMedia).where(eq(goatMedia.id, record.id));
        console.log(`Removed goat media record with ID ${record.id} (missing file: ${record.url})`);
        totalRemovedRecords++;
      }
    }
    
    // 4. Clean up goat documents records
    console.log('\nCleaning goat documents records...');
    const goatDocsRecords = await db.query.goatDocuments.findMany({
      where: like(goatDocuments.url, '/uploads/%')
    });
    
    console.log(`Found ${goatDocsRecords.length} goat document records with local URLs`);
    
    for (const record of goatDocsRecords) {
      const filePath = localPathToFilePath(record.url);
      if (!uploadsExists || !filePath || !fs.existsSync(filePath)) {
        await db.delete(goatDocuments).where(eq(goatDocuments.id, record.id));
        console.log(`Removed goat document record with ID ${record.id} (missing file: ${record.url})`);
        totalRemovedRecords++;
      }
    }
    
    // 5. Update dog profileImageUrl if it's missing
    console.log('\nCleaning dog profile images...');
    const dogsWithLocalImages = await db.query.dogs.findMany({
      where: like(dogs.profileImageUrl, '/uploads/%')
    });
    
    console.log(`Found ${dogsWithLocalImages.length} dogs with local profile images`);
    
    for (const dog of dogsWithLocalImages) {
      const filePath = localPathToFilePath(dog.profileImageUrl);
      if (!uploadsExists || !filePath || !fs.existsSync(filePath)) {
        // Try to find a media record with an S3 URL for this dog
        const dogMediaItems = await db.query.dogMedia.findMany({
          where: eq(dogMedia.dogId, dog.id)
        });
        
        const s3Media = dogMediaItems.find(media => isS3Url(media.url) && media.type === 'image');
        
        if (s3Media) {
          // Update the dog's profile image to use the S3 URL
          await db.update(dogs)
            .set({ profileImageUrl: s3Media.url, updatedAt: new Date() })
            .where(eq(dogs.id, dog.id));
          console.log(`Updated dog ${dog.name} (ID: ${dog.id}) to use S3 profile image: ${s3Media.url}`);
        } else {
          // Set profile image to null if no S3 image is available
          await db.update(dogs)
            .set({ profileImageUrl: null, updatedAt: new Date() })
            .where(eq(dogs.id, dog.id));
          console.log(`Set null profile image for dog ${dog.name} (ID: ${dog.id}) - no S3 image available`);
        }
        totalRemovedRecords++;
      }
    }
    
    // 6. Update goat profileImageUrl if it's missing
    console.log('\nCleaning goat profile images...');
    const goatsWithLocalImages = await db.query.goats.findMany({
      where: like(goats.profileImageUrl, '/uploads/%')
    });
    
    console.log(`Found ${goatsWithLocalImages.length} goats with local profile images`);
    
    for (const goat of goatsWithLocalImages) {
      const filePath = localPathToFilePath(goat.profileImageUrl);
      if (!uploadsExists || !filePath || !fs.existsSync(filePath)) {
        // Try to find a media record with an S3 URL for this goat
        const goatMediaItems = await db.query.goatMedia.findMany({
          where: eq(goatMedia.goatId, goat.id)
        });
        
        const s3Media = goatMediaItems.find(media => isS3Url(media.url) && media.type === 'image');
        
        if (s3Media) {
          // Update the goat's profile image to use the S3 URL
          await db.update(goats)
            .set({ profileImageUrl: s3Media.url, updatedAt: new Date() })
            .where(eq(goats.id, goat.id));
          console.log(`Updated goat ${goat.name} (ID: ${goat.id}) to use S3 profile image: ${s3Media.url}`);
        } else {
          // Set profile image to null if no S3 image is available
          await db.update(goats)
            .set({ profileImageUrl: null, updatedAt: new Date() })
            .where(eq(goats.id, goat.id));
          console.log(`Set null profile image for goat ${goat.name} (ID: ${goat.id}) - no S3 image available`);
        }
        totalRemovedRecords++;
      }
    }
    
    // 7. Clean up site content images
    console.log('\nCleaning site content image references...');
    const siteContentRecords = await db.query.siteContent.findMany({
      where: (content, { and, eq, like }) => and(
        eq(content.type, 'image'),
        like(content.value, '/uploads/%')
      )
    });
    
    console.log(`Found ${siteContentRecords.length} site content records with local image URLs`);
    
    for (const record of siteContentRecords) {
      const filePath = localPathToFilePath(record.value);
      if (!uploadsExists || !filePath || !fs.existsSync(filePath)) {
        // For site content, we'll set the value to a placeholder instead of deleting
        await db.update(siteContent)
          .set({ value: 'https://placehold.co/600x400?text=Image+Missing', updatedAt: new Date() })
          .where(eq(siteContent.id, record.id));
        console.log(`Updated site content record with ID ${record.id} to use placeholder (missing file: ${record.value})`);
        totalRemovedRecords++;
      }
    }
    
    // 8. Clean up carousel items
    console.log('\nCleaning carousel item images...');
    const carouselRecords = await db.query.carouselItems.findMany({
      where: like(carouselItems.imageUrl, '/uploads/%')
    });
    
    console.log(`Found ${carouselRecords.length} carousel items with local image URLs`);
    
    for (const record of carouselRecords) {
      const filePath = localPathToFilePath(record.imageUrl);
      if (!uploadsExists || !filePath || !fs.existsSync(filePath)) {
        // For carousel items, we'll set the image to a placeholder
        await db.update(carouselItems)
          .set({ imageUrl: 'https://placehold.co/1200x600?text=Carousel+Image', updatedAt: new Date() })
          .where(eq(carouselItems.id, record.id));
        console.log(`Updated carousel item with ID ${record.id} to use placeholder (missing file: ${record.imageUrl})`);
        totalRemovedRecords++;
      }
    }
    
    // 9. Clean up principles images
    console.log('\nCleaning principles images...');
    const principlesRecords = await db.query.principles.findMany({
      where: like(principles.imageUrl, '/uploads/%')
    });
    
    console.log(`Found ${principlesRecords.length} principles with local image URLs`);
    
    for (const record of principlesRecords) {
      const filePath = localPathToFilePath(record.imageUrl);
      if (!uploadsExists || !filePath || !fs.existsSync(filePath)) {
        await db.update(principles)
          .set({ imageUrl: 'https://placehold.co/600x400?text=Principle+Image', updatedAt: new Date() })
          .where(eq(principles.id, record.id));
        console.log(`Updated principle with ID ${record.id} to use placeholder (missing file: ${record.imageUrl})`);
        totalRemovedRecords++;
      }
    }
    
    // 10. Clean up dogs hero image
    console.log('\nCleaning dogs hero image...');
    const heroRecords = await db.query.dogsHero.findMany({
      where: like(dogsHero.imageUrl, '/uploads/%')
    });
    
    console.log(`Found ${heroRecords.length} dogs hero records with local image URLs`);
    
    for (const record of heroRecords) {
      const filePath = localPathToFilePath(record.imageUrl);
      if (!uploadsExists || !filePath || !fs.existsSync(filePath)) {
        await db.update(dogsHero)
          .set({ imageUrl: 'https://placehold.co/1200x600?text=Hero+Image', updatedAt: new Date() })
          .where(eq(dogsHero.id, record.id));
        console.log(`Updated dogs hero with ID ${record.id} to use placeholder (missing file: ${record.imageUrl})`);
        totalRemovedRecords++;
      }
    }
    
    console.log(`\n=== Database cleanup completed ===`);
    console.log(`Processed or updated ${totalRemovedRecords} records with missing local file references`);
    
  } catch (error) {
    console.error('Database cleanup failed with error:', error);
  }
}

// Run the cleanup
cleanDbLocalReferences().then(() => {
  console.log('Database cleanup script execution completed');
  process.exit(0);
}).catch(error => {
  console.error('Unhandled error in database cleanup script:', error);
  process.exit(1);
});
