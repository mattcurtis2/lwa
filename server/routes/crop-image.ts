import { Request, Response } from 'express';
import { db } from '@db';
import { dogMedia } from '@db/schema';
import { eq } from 'drizzle-orm';
import axios from 'axios';
import sharp from 'sharp';
import { uploadToS3 } from '../utils/s3.js';

// Export the route handler as a named export
export const cropImage = async (req: Request, res: Response) => {
  try {
    console.log('Crop image request received:', req.body);
    const { imageUrl, crop, mediaId, dogId } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    if (!crop) {
      return res.status(400).json({ error: 'Crop parameters are required' });
    }

    console.log('Fetching image from URL:', imageUrl);

    // Download the image
    let imageBuffer: Buffer;

    if (imageUrl.startsWith('data:image')) {
      // Handle base64 image data
      const base64Data = imageUrl.split(',')[1];
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      // Handle URL image
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      imageBuffer = Buffer.from(response.data);
    }

    // Apply the crop using sharp
    const { x, y, width, height, unit } = crop;
    console.log('Applying crop with dimensions:', { x, y, width, height, unit });

    let cropOptions: any = {};

    if (unit === 'px') {
      // Use absolute pixel values
      cropOptions = {
        left: Math.round(x),
        top: Math.round(y),
        width: Math.round(width),
        height: Math.round(height)
      };
    } else {
      // Convert percentage to pixels using sharp's metadata
      const metadata = await sharp(imageBuffer).metadata();
      const imgWidth = metadata.width || 0;
      const imgHeight = metadata.height || 0;

      cropOptions = {
        left: Math.round((x / 100) * imgWidth),
        top: Math.round((y / 100) * imgHeight),
        width: Math.round((width / 100) * imgWidth),
        height: Math.round((height / 100) * imgHeight)
      };
    }

    console.log('Calculated crop dimensions:', cropOptions);

    // Process the image with sharp
    const processedImageBuffer = await sharp(imageBuffer)
      .extract(cropOptions)
      .jpeg({ quality: 90 })
      .toBuffer();

    // Upload the cropped image to S3
    console.log('Uploading cropped image to S3');
    const s3Url = await uploadToS3({
      buffer: processedImageBuffer,
      mimetype: 'image/jpeg',
      originalname: `cropped-${Date.now()}.jpg`
    });

    console.log('Cropped image uploaded to S3:', s3Url);

    // If mediaId is provided, update the media object in the database
    if (mediaId) {
      console.log(`Updating media ${mediaId} with new URL`);
      await db.update(dogMedia)
        .set({ url: s3Url, updatedAt: new Date() })
        .where(eq(dogMedia.id, mediaId));
    }

    // Return the S3 URL of the cropped image
    return res.status(200).json({ url: s3Url, dogId });
  } catch (error) {
    console.error('Error in crop-image handler:', error);
    return res.status(500).json({ 
      error: 'Failed to crop image',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

// Also export as default for backward compatibility
export default cropImage;