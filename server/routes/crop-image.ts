import { Router } from 'express';
import sharp from 'sharp';
import fetch from 'node-fetch';
import { db } from '../../db/index.js';
import { dogMedia } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { imageUrl, crop, mediaId, dogId } = req.body;

    if (!imageUrl || !crop) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    console.log(`Processing crop with dimensions:`, crop);
    console.log(`Media ID: ${mediaId}, Dog ID: ${dogId}`);

    if (mediaId && dogId) {
      // Fetch the dog and media before the update for logging
      const dogBefore = await db.query.dogs.findFirst({
        where: eq(db.dogs.id, dogId),
        with: {
          media: true
        }
      });

      console.log('Dog before crop:', JSON.stringify({
        id: dogBefore?.id,
        name: dogBefore?.name,
        mediaCount: dogBefore?.media?.length,
        targetMedia: dogBefore?.media?.find(m => m.id === mediaId)
      }));
    }

    // Import the S3 upload utility
    const { uploadToS3 } = await import('../utils/s3.js');
    const { v4: uuidv4 } = await import('uuid');

    let imageBuffer;
    // Handle base64 images directly
    if (imageUrl.startsWith('data:image')) {
      try {
        const base64Data = imageUrl.split(',')[1];
        imageBuffer = Buffer.from(base64Data, 'base64');
      } catch (err) {
        console.error('Error processing base64 image:', err);
        return res.status(500).json({ error: 'Failed to process base64 image', details: err.message });
      }
    } else {
      // Download the image from URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return res.status(response.status).json({ 
          error: `Failed to download image: ${response.statusText}` 
        });
      }
      imageBuffer = Buffer.from(await response.arrayBuffer());
    }

    // Calculate crop coordinates
    const x = Math.round(crop.x);
    const y = Math.round(crop.y);
    const width = Math.round(crop.width);
    const height = Math.round(crop.height);

    if (width <= 0 || height <= 0) {
      return res.status(400).json({ error: 'Invalid crop dimensions' });
    }

    try {
      // Perform the crop
      const croppedBuffer = await sharp(imageBuffer)
        .extract({ left: x, top: y, width, height })
        .jpeg({ quality: 90 })
        .toBuffer();

      // Create a unique filename for this cropped image
      const filename = `cropped-${uuidv4()}.jpg`;

      // Create a mock file object for S3 upload
      const mockFile = {
        buffer: croppedBuffer,
        mimetype: 'image/jpeg',
        originalname: filename
      };

      console.log('Uploading cropped image to S3...');
      const s3Url = await uploadToS3(mockFile);

      if (!s3Url) {
        throw new Error('Failed to upload to S3 - No URL returned');
      }

      console.log('Received cropped image URL:', s3Url.substring(0, 50) + '...');

      // If we have a mediaId, update the dog media record with the new URL
      if (mediaId) {
        console.log(`Updating dog media record with ID ${mediaId} to use new S3 URL`);
        await db.update(dogMedia)
          .set({ url: s3Url })
          .where(eq(dogMedia.id, mediaId));

        console.log('Database update complete');

        // Fetch the updated dog data
        if (dogId) {
          const dogAfter = await db.query.dogs.findFirst({
            where: eq(db.dogs.id, dogId),
            with: {
              media: true
            }
          });

          console.log('Dog after crop:', JSON.stringify({
            id: dogAfter?.id,
            name: dogAfter?.name,
            mediaCount: dogAfter?.media?.length,
            targetMedia: dogAfter?.media?.find(m => m.id === mediaId)
          }));
        }
      }

      return res.json({ url: s3Url });

    } catch (cropError) {
      console.error('Error completing crop:', cropError);

      // As a fallback, if S3 upload fails, return base64 image
      const croppedBuffer = await sharp(imageBuffer)
        .extract({ left: x, top: y, width, height })
        .toBuffer();

      const base64Image = `data:image/jpeg;base64,${croppedBuffer.toString('base64')}`;
      return res.json({ url: base64Image });
    }
  } catch (error) {
    console.error('Error cropping image:', error);
    res.status(500).json({ error: 'Failed to crop image', details: error.message });
  }
});

export default router;