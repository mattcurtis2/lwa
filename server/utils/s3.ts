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
  console.log('- AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'Set (starts with: ' + process.env.AWS_ACCESS_KEY_ID?.substring(0, 4) + '...)' : 'Not set');
  console.log('- AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set (length: ' + (process.env.AWS_SECRET_ACCESS_KEY?.length || 0) + ')' : 'Not set');
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
    console.log(`S3 Upload - Processing file: ${file.originalname}`);

    // Initialize the S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Read the file data
    const fileData = await fs.readFile(file.path);

    // Generate a unique key for the file to avoid overwriting existing files
    const fileExtension = path.extname(file.originalname);
    const key = `${randomUUID()}${fileExtension}`;

    // Prepare the S3 upload parameters
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fileData,
      ContentType: file.mimetype,
      // ACL parameter removed as the bucket doesn't allow ACLs
    };

    console.log('S3 Upload - Params prepared:', {
      Bucket: bucketName,
      Key: key,
      ContentType: file.mimetype,
      ContentLength: fileData.length
    });

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