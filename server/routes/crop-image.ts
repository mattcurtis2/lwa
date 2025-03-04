import { Request, Response } from 'express';
import fetch from 'node-fetch';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { uploadToS3, getS3Url } from '../utils/s3';

export const cropImage = async (req: Request, res: Response) => {
  try {
    const { imageUrl, cropData, filename } = req.body;
    
    if (!imageUrl || !cropData) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Parse crop data
    const crop = JSON.parse(cropData);
    
    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return res.status(500).json({ error: 'Failed to fetch source image' });
    }
    
    const imageBuffer = await imageResponse.buffer();
    
    // Use sharp to crop the image
    const croppedBuffer = await sharp(imageBuffer)
      .extract({
        left: Math.round(crop.x),
        top: Math.round(crop.y),
        width: Math.round(crop.width),
        height: Math.round(crop.height)
      })
      .jpeg({ quality: 90 })
      .toBuffer();
    
    // Generate a unique filename
    const uniqueFilename = `${uuidv4()}-${filename || 'cropped-image.jpg'}`;
    
    // Temporary save the file locally
    const localFilePath = path.join(process.cwd(), 'uploads', uniqueFilename);
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Write file to disk
    fs.writeFileSync(localFilePath, croppedBuffer);
    
    // Check if S3 is configured
    const useS3 = process.env.USE_S3 === 'true';
    
    let fileUrl;
    
    if (useS3) {
      try {
        // Upload to S3 using your existing S3 utility
        await uploadToS3(localFilePath, uniqueFilename, 'image/jpeg');
        fileUrl = getS3Url(uniqueFilename);
        
        // Remove local file after S3 upload
        fs.unlinkSync(localFilePath);
      } catch (s3Error) {
        console.error('S3 upload failed, using local file:', s3Error);
        // Fallback to local URL if S3 upload fails
        fileUrl = `/uploads/${uniqueFilename}`;
      }
    } else {
      // Use local file URL
      fileUrl = `/uploads/${uniqueFilename}`;
    }
    
    // Return the URL of the cropped image
    return res.status(200).json({ url: fileUrl });
    
  } catch (error) {
    console.error('Error in image cropping:', error);
    return res.status(500).json({ 
      error: 'Error processing image crop',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Proxy endpoint to fetch images while avoiding CORS issues
export const proxyImage = async (req: Request, res: Response) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid URL parameter' });
    }

    // Fetch the image
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch image' });
    }

    // Get the content type
    const contentType = response.headers.get('content-type');

    // Set appropriate headers
    res.setHeader('Content-Type', contentType || 'image/jpeg');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    // Pipe the response directly to the client
    response.body.pipe(res);
  } catch (error) {
    console.error('Error proxying image:', error);
    res.status(500).json({ 
      error: 'Error processing image proxy request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};