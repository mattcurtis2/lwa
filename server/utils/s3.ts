import fs from 'fs-extra';
import { S3Client, PutObjectCommand, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import path from 'path';
import { randomUUID as uuidv4 } from "crypto";
import dotenv from 'dotenv';
import { sleep } from '../helpers';

dotenv.config();

function getS3Env() {
  return {
    region: process.env.AWS_REGION || process.env.LWA_AWS_REGION || "",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.LWA_AWS_ACCESS_KEY_ID || "",
    secretAccessKey:
      process.env.AWS_SECRET_ACCESS_KEY || process.env.LWA_AWS_SECRET_ACCESS_KEY || "",
    bucketName:
      process.env.AWS_BUCKET_NAME ||
      process.env.S3_BUCKET_NAME ||
      process.env.LWA_AWS_BUCKET_NAME ||
      "",
  };
}

// Function to check and set S3 bucket CORS configuration
async function ensureBucketCorsConfig(s3Client, bucketName) {
  try {
    console.log('Checking S3 bucket CORS configuration...');

    // Set a permissive CORS configuration for the bucket
    const corsParams = {
      Bucket: bucketName,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
            AllowedOrigins: ["*"],
            ExposeHeaders: ["ETag", "Content-Length", "Content-Type"],
            MaxAgeSeconds: 3000
          }
        ]
      }
    };

    // Import the PutBucketCorsCommand dynamically to avoid potential issues
    const { PutBucketCorsCommand } = await import('@aws-sdk/client-s3');
    await s3Client.send(new PutBucketCorsCommand(corsParams));
    console.log('CORS configuration set successfully');

    return true;
  } catch (error) {
    console.warn('Warning: Failed to set CORS configuration:', error);
    // Continue even if CORS setting fails
    return false;
  }
}

// Returns true only when all four required AWS env vars are present
export function isS3Configured(): boolean {
  const env = getS3Env();
  return !!(
    env.region &&
    env.accessKeyId &&
    env.secretAccessKey &&
    env.bucketName
  );
}

// Initialize the S3 client with AWS credentials
export async function uploadToS3(file: any): Promise<string> {
  const env = getS3Env();
  if (!isS3Configured()) {
    throw new Error(
      "S3 not configured: set AWS_* vars (or LWA_AWS_* fallback vars) and AWS_BUCKET_NAME/S3_BUCKET_NAME"
    );
  }

  console.log('==== S3 UPLOAD ATTEMPT ====');

  // Validate the file object
  if (!file) {
    console.error('S3 Upload - No file provided');
    return null;
  }

  if (!file.originalname) {
    console.error('S3 Upload - File missing originalname');
    return null;
  }

  const bucketName = env.bucketName;
  const s3 = new S3Client({
    region: env.region,
    credentials: {
      accessKeyId: env.accessKeyId,
      secretAccessKey: env.secretAccessKey
    }
  });

  // Set CORS for the bucket (this only needs to be done once per bucket)
  try {
    console.log('Checking S3 bucket CORS configuration...');
    await s3.send(
      new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ['*'],
              AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
              AllowedOrigins: ['*'],
              ExposeHeaders: ['ETag']
            }
          ]
        }
      })
    );
    console.log('CORS configuration set successfully');
  } catch (error) {
    console.error('Error setting CORS configuration', error);
    // Continue anyway as this might just be a permissions issue
  }

  try {
    // Generate a unique key for the file
    const fileKey = `uploads/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    console.log(`S3 Upload - Processing file: ${file.originalname}`);

    let fileContent;
    if (file.buffer) {
      // If the file is already in memory (from multer's memoryStorage or manual buffer)
      console.log(`Using buffer content with size: ${file.buffer.length} bytes`);
      fileContent = file.buffer;
    } else if (file.path) {
      // If the file is on disk (from multer's diskStorage)
      console.log(`Reading file from path: ${file.path}`);
      fileContent = await fs.readFile(file.path);
    } else {
      throw new Error('File has neither buffer nor path');
    }

    if (!fileContent) {
      throw new Error('Failed to get file content');
    }

    console.log(`File content obtained, size: ${fileContent.length} bytes`);
    console.log(`Content type: ${file.mimetype || 'application/octet-stream'}`);

    // Upload the file to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: fileContent,
        ContentType: file.mimetype || 'application/octet-stream',
        // Remove ACL setting as it might cause issues with some bucket configurations
      })
    );

    // Return the URL to the uploaded file
    const url = `https://${bucketName}.s3.amazonaws.com/${fileKey}`;
    console.log(`S3 Upload - Success. URL: ${url}`);
    return url;
  } catch (error) {
    console.error('S3 Upload - Error during upload:', error);
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}`);
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }
    throw error; // Re-throw to allow proper error handling at the caller
  }
}