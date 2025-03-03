
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Check and log S3 configuration
const region = process.env.AWS_REGION || 'us-east-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketName = process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME;

// Log S3 config (excluding secret key)
console.log('S3 Config:', { 
  region,
  accessKeyConfigured: accessKeyId ? "YES" : "NO",
  secretKeyConfigured: secretAccessKey ? "YES" : "NO",
  bucketName,
});

if (!accessKeyId || !secretAccessKey) {
  console.error('WARNING: AWS credentials are not properly configured', { 
    accessKeyId: accessKeyId ? "Key present" : "MISSING", 
    secretAccessKey: secretAccessKey ? "Key present" : "MISSING" 
  });
}

if (!bucketName) {
  console.error('WARNING: AWS_BUCKET_NAME is not configured');
}

// Create an S3 client
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || ''
  }
});

export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
  try {
    console.log("\n=== S3 UPLOAD ATTEMPT ===");
    
    // Check credentials before proceeding
    if (!accessKeyId || !secretAccessKey) {
      console.error("S3 upload aborted: AWS credentials are missing");
      throw new Error('AWS credentials are missing. Check your .env file');
    }
    
    if (!bucketName) {
      console.error("S3 upload aborted: AWS_BUCKET_NAME is missing");
      throw new Error('AWS_BUCKET_NAME environment variable is not set');
    }
    
    // Use the original file name but sanitize it and make it unique
    const fileExtension = file.originalname.split('.').pop() || 'jpg';
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50);
    const key = `${randomUUID()}-${sanitizedName}.${fileExtension}`;
    
    console.log(`S3 Upload - File: ${sanitizedName}, Size: ${file.size} bytes, Type: ${file.mimetype}`);
    console.log(`S3 Upload - Target: s3://${bucketName}/${key}`);

    // Read the file data
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

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fileData,
      ContentType: file.mimetype,
      ACL: 'public-read', // Make the file publicly accessible
    };

    console.log("S3 Upload - Sending PUT request to S3", { bucket: bucketName, key });
    console.log("S3 Upload - Using client with region:", region);
    
    try {
      console.log(`Sending file to S3 bucket: ${bucketName}`);
      const result = await s3Client.send(new PutObjectCommand(params));
      console.log("S3 Upload - S3 response:", result);
      
      const s3Url = `https://${bucketName}.s3.amazonaws.com/${key}`;
      console.log(`S3 Upload - SUCCESS! File URL: ${s3Url}`);
      return s3Url;
    } catch (error) {
      console.error('S3 Upload - ERROR during AWS API call:', error);
      
      // Additional error inspection
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Check for common S3 errors
        if (error.message.includes('AccessDenied')) {
          console.error('S3 Upload - Access Denied. Check your IAM permissions and bucket policy.');
        } else if (error.message.includes('NoSuchBucket')) {
          console.error(`S3 Upload - Bucket not found: ${bucketName}`);
        } else if (error.message.includes('NetworkingError')) {
          console.error('S3 Upload - Network error. Check your internet connection or AWS endpoints.');
        } else if (error.message.includes('CredentialsError')) {
          console.error('S3 Upload - Invalid credentials. Check your AWS access keys.');
        }
      }
      
      // Re-throw with more details
      throw new Error(`Failed to upload to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('S3 Upload - PROCESS FAILED:', error);
    
    // Fall back to local storage - TEMPORARY
    console.warn('S3 Upload - Falling back to local storage due to S3 upload failure');
    if (file.path) {
      const localPath = `/uploads/${file.path.split('/').pop()}`;
      console.log(`S3 Upload - Using local file path as fallback: ${localPath}`);
      return localPath;
    }
    
    throw error;
  }
};
