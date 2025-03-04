import { Request, Response } from 'express';
import sharp from 'sharp';
import fetch from 'node-fetch';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

export const cropImage = async (req: Request, res: Response) => {
  try {
    const { imageUrl, crop } = req.body;

    if (!imageUrl || !crop) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Handle base64 images directly
    if (imageUrl.startsWith('data:image')) {
      try {
        const base64Data = imageUrl.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Calculate crop coordinates
        const x = Math.round(crop.x);
        const y = Math.round(crop.y);
        const width = Math.round(crop.width);
        const height = Math.round(crop.height);

        if (width <= 0 || height <= 0) {
          return res.status(400).json({ error: 'Invalid crop dimensions' });
        }

        // Perform the crop
        const croppedBuffer = await sharp(imageBuffer)
          .extract({ left: x, top: y, width, height })
          .toBuffer();

        // Return as base64 data URL
        const base64Image = `data:image/jpeg;base64,${croppedBuffer.toString('base64')}`;

        return res.json({ url: base64Image });
      } catch (err) {
        console.error('Error processing base64 image:', err);
        return res.status(500).json({ error: 'Failed to process base64 image', details: err.message });
      }
    }

    // Download the image from URL
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Failed to download image: ${response.statusText}` 
      });
    }

    const imageBuffer = await response.arrayBuffer();

    // Calculate crop coordinates
    const x = Math.round(crop.x);
    const y = Math.round(crop.y);
    const width = Math.round(crop.width);
    const height = Math.round(crop.height);

    if (width <= 0 || height <= 0) {
      return res.status(400).json({ error: 'Invalid crop dimensions' });
    }

    // Perform the crop
    const croppedBuffer = await sharp(Buffer.from(imageBuffer))
      .extract({ left: x, top: y, width, height })
      .toBuffer();

    // Return as base64 data URL
    const base64Image = `data:image/jpeg;base64,${croppedBuffer.toString('base64')}`;

    res.json({ url: base64Image });
  } catch (error) {
    console.error('Error cropping image:', error);
    res.status(500).json({ error: 'Failed to crop image', details: error.message });
  }
}