
import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { siteContent, carouselItems, dogsHero } from '../db/schema';
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
async function migrateSiteContentToS3() {
  try {
    console.log('Starting site content migration to S3...');
    
    // Process site content images
    const allContent = await db.query.siteContent.findMany({
      where: (content, { eq }) => eq(content.type, 'image')
    });
    
    console.log(`Found ${allContent.length} site content images to process`);
    
    for (const content of allContent) {
      if (content.value && !isS3Url(content.value) && content.value.startsWith('/uploads/')) {
        console.log(`\nProcessing site content: ${content.key}`);
        const s3Url = await processFile(content.value, `site-content-${content.key}${path.extname(content.value)}`);
        
        if (s3Url) {
          console.log(`Updating site content ${content.key} to: ${s3Url}`);
          await db.update(siteContent)
            .set({ value: s3Url, updatedAt: new Date() })
            .where(eq(siteContent.id, content.id));
          console.log(`Site content updated successfully`);
        }
      }
    }
    
    // Process carousel items
    const carouselData = await db.query.carouselItems.findMany();
    console.log(`\nFound ${carouselData.length} carousel items to process`);
    
    for (const item of carouselData) {
      if (item.imageUrl && !isS3Url(item.imageUrl) && item.imageUrl.startsWith('/uploads/')) {
        console.log(`\nProcessing carousel item: ${item.title}`);
        const s3Url = await processFile(item.imageUrl, `carousel-${item.id}${path.extname(item.imageUrl)}`);
        
        if (s3Url) {
          console.log(`Updating carousel item ${item.id} to: ${s3Url}`);
          await db.update(carouselItems)
            .set({ imageUrl: s3Url, updatedAt: new Date() })
            .where(eq(carouselItems.id, item.id));
          console.log(`Carousel item updated successfully`);
        }
      }
    }
    
    // Process dogs hero
    const heroData = await db.query.dogsHero.findMany();
    console.log(`\nFound ${heroData.length} dog hero items to process`);
    
    for (const hero of heroData) {
      if (hero.imageUrl && !isS3Url(hero.imageUrl) && hero.imageUrl.startsWith('/uploads/')) {
        console.log(`\nProcessing dog hero item: ${hero.id}`);
        const s3Url = await processFile(hero.imageUrl, `dog-hero-${hero.id}${path.extname(hero.imageUrl)}`);
        
        if (s3Url) {
          console.log(`Updating dog hero ${hero.id} to: ${s3Url}`);
          await db.update(dogsHero)
            .set({ imageUrl: s3Url, updatedAt: new Date() })
            .where(eq(dogsHero.id, hero.id));
          console.log(`Dog hero updated successfully`);
        }
      }
    }
    
    console.log('\n=== Site content migration completed successfully ===');
  } catch (error) {
    console.error('Site content migration failed with error:', error);
  }
}

// Run the migration
migrateSiteContentToS3().then(() => {
  console.log('Site content migration script execution completed');
  process.exit(0);
}).catch(error => {
  console.error('Unhandled error in site content migration script:', error);
  process.exit(1);
});
