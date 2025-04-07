import fs from 'fs-extra';
import { S3Client, PutObjectCommand, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import { randomUUID as uuidv4 } from "crypto";
import dotenv from 'dotenv';

dotenv.config();

// Initialize the S3 client with AWS credentials
export function getS3Client() {
  // Check if AWS credentials are set
  console.log('AWS Credentials Check:');
  console.log(`- AWS_REGION: ${process.env.AWS_REGION ? 'Set' : 'Not set'}`);
  console.log(`- AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? `Set (starts with: ${process.env.AWS_ACCESS_KEY_ID.substring(0, 6)}...)` : 'Not set'}`);
  console.log(`- AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? `Set (length: ${process.env.AWS_SECRET_ACCESS_KEY.length})` : 'Not set'}`);

  if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('S3 Client - Missing AWS credentials');
    return null;
  }

  return new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
}

// Function to check and set S3 bucket CORS configuration
export async function ensureBucketCorsConfig(bucketName: string): Promise<boolean> {
  const s3 = getS3Client();
  if (!s3) return false;

  try {
    console.log(`Checking S3 bucket CORS configuration for ${bucketName}...`);

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

    await s3.send(new PutBucketCorsCommand(corsParams));
    console.log('CORS configuration set successfully');

    return true;
  } catch (error) {
    console.warn('Warning: Failed to set CORS configuration:', error);
    // Continue even if CORS setting fails
    return false;
  }
}

// Get the bucket name based on the current site or default
export function getBucketName(req?: any): string {
  // If a site is present on the request, generate site-specific bucket name
  if (req?.site?.id) {
    // Allow site-specific bucket override from environment (for testing)
    const siteBucketName = process.env[`SITE_${req.site.id}_BUCKET_NAME`];
    if (siteBucketName) {
      return siteBucketName;
    }
    
    // Use site domain as part of bucket name (remove dots for S3 naming rules)
    const siteDomain = req.site.domain.replace(/\./g, '-');
    return `${siteDomain}-content`;
  }
  
  // Default bucket from environment variables
  return process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME || 'lwacontent';
}

// Upload file to S3 with support for site-specific buckets
export async function uploadToS3(file: any, req?: any): Promise<string | null> {
  console.log('==== S3 UPLOAD ATTEMPT ====');
  
  const s3 = getS3Client();
  if (!s3) {
    return null;
  }

  // Validate the file object
  if (!file) {
    console.error('S3 Upload - No file provided');
    return null;
  }

  if (!file.originalname) {
    console.error('S3 Upload - File missing originalname');
    return null;
  }

  // Get the appropriate bucket name
  const bucketName = getBucketName(req);
  console.log(`Using S3 bucket: ${bucketName}`);

  // Set CORS for the bucket (this only needs to be done once per bucket)
  await ensureBucketCorsConfig(bucketName);

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