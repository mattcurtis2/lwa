import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Create an S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
  const fileExtension = file.originalname.split('.').pop();
  const key = `${randomUUID()}.${fileExtension}`;
  const bucket = process.env.S3_BUCKET_NAME;

  if (!bucket) {
    throw new Error('S3_BUCKET_NAME environment variable is not set');
  }

  // Read the file data
  let fileData: Buffer;

  // If file.buffer exists, use it directly (memory storage)
  if (file.buffer) {
    fileData = file.buffer;
  } else if (file.path) {
    // Otherwise read from the file path (disk storage)
    fileData = fs.readFileSync(file.path);
  } else {
    throw new Error('No file data available');
  }

  const params = {
    Bucket: bucket,
    Key: key,
    Body: fileData,
    ContentType: file.mimetype,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    return `https://${bucket}.s3.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};