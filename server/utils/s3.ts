import fs from 'fs-extra';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import { randomUUID } from "crypto";
import dotenv from 'dotenv';

dotenv.config();

// Initialize the S3 client with AWS credentials
export async function uploadToS3(file: Express.Multer.File): Promise<string> {
  // Log environment variables for debugging
  console.log('==== S3 UPLOAD ATTEMPT ====');
  console.log('AWS Credentials Check:');
  console.log('- AWS_REGION:', process.env.AWS_REGION ? 'Set' : 'Not set');
  console.log('- AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Not set');
  console.log('- AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Not set');
  console.log('- AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME ? 'Set' : 'Not set');
  console.log('- S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME ? 'Set' : 'Not set');

  // Use AWS_BUCKET_NAME or fall back to S3_BUCKET_NAME if present
  const bucketName = process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME;

  if (!bucketName) {
    console.error('S3 Upload Error: No bucket name configured in environment variables');
    throw new Error('S3 bucket name not configured');
  }

  if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('S3 Upload Error: Missing AWS credentials');
    throw new Error('AWS credentials not configured properly');
  }

  try {
    // Create a unique key for the S3 object
    const fileExt = path.extname(file.originalname);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 12);
    const key = `uploads/${timestamp}-${randomString}${fileExt}`;

    console.log(`S3 Upload - Creating S3 client with region: ${process.env.AWS_REGION}`);
    console.log(`S3 Upload - Target bucket: ${bucketName}`);
    console.log(`S3 Upload - File: ${file.originalname} (${file.size} bytes)`);
    console.log(`S3 Upload - Target key: ${key}`);

    // Create S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    // Prepare file data for upload
    let fileData: Buffer;

    // If file.buffer exists, use it directly (memory storage)
    if (file.buffer) {
      fileData = file.buffer;
      console.log('S3 Upload - Using file buffer for upload');
    } else if (file.path) {
      // Otherwise read from the file path (disk storage)
      fileData = fs.readFileSync(file.path);
      console.log(`S3 Upload - Reading file from disk: ${file.path}`);
    } else {
      console.error("S3 Upload - Error: No file data available");
      throw new Error('No file data available');
    }

    // Prepare the S3 upload parameters
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fileData,
      ContentType: file.mimetype,
      ACL: 'public-read', // Make the file publicly accessible
    };

    console.log('S3 Upload - Sending file to S3...');

    // Upload to S3
    const command = new PutObjectCommand(params);
    const response = await s3Client.send(command);

    console.log('S3 Upload - Success! Response:', response);

    // Construct the S3 URL
    const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    console.log(`S3 Upload - Generated URL: ${s3Url}`);

    return s3Url;
  } catch (error) {
    console.error('S3 Upload - Error during upload:', error);
    throw error;
  }
}