
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
      return res.status(400).json({ error: 'Image URL and crop data are required' });
    }

    console.log('Server-side cropping:', { imageUrl: imageUrl.substring(0, 50) + '...', crop });

    // Fetch the image
    let imageBuffer;
    if (imageUrl.startsWith('data:')) {
      // It's a base64 image
      const base64Data = imageUrl.split(',')[1];
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      // It's a URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return res.status(400).json({ error: 'Failed to fetch image' });
      }
      imageBuffer = await response.arrayBuffer();
    }

    // Use sharp to crop the image
    const croppedBuffer = await sharp(Buffer.from(imageBuffer))
      .extract({
        left: Math.round(crop.x),
        top: Math.round(crop.y),
        width: Math.round(crop.width),
        height: Math.round(crop.height)
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    // Upload to S3 if credentials are available
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && BUCKET_NAME) {
      try {
        console.log('S3 UPLOAD ATTEMPT: AWS Credentials Check', {
          AWS_REGION: !!process.env.AWS_REGION,
          AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
          AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
          BUCKET_NAME: !!BUCKET_NAME
        });

        const fileName = `cropped-${uuidv4()}.jpg`;
        const key = `uploads/${fileName}`;

        const uploadParams = {
          Bucket: BUCKET_NAME,
          Key: key,
          Body: croppedBuffer,
          ContentType: 'image/jpeg'
        };

        await s3Client.send(new PutObjectCommand(uploadParams));
        const s3Url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
        
        console.log('S3 upload successful, URL:', s3Url);
        return res.json({ url: s3Url });
      } catch (s3Error) {
        console.error('S3 Upload Error:', s3Error);
        // Fall back to local storage if S3 fails
      }
    }

    // If S3 upload fails or isn't configured, send back base64
    const base64Image = `data:image/jpeg;base64,${croppedBuffer.toString('base64')}`;
    return res.json({ url: base64Image });
  } catch (error) {
    console.error('Server-side crop error:', error);
    return res.status(500).json({ error: 'Failed to crop image' });
  }
};
