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
  accessKeyConfigured: !!accessKeyId,
  secretKeyConfigured: !!secretAccessKey,
  bucketName,
});

if (!accessKeyId || !secretAccessKey) {
  console.error('WARNING: AWS credentials are not properly configured');
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
  // Use the original file name but sanitize it and make it unique
  const fileExtension = file.originalname.split('.').pop() || 'jpg';
  const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50);
  const key = `${randomUUID()}-${sanitizedName}.${fileExtension}`;
  
  if (!bucketName) {
    throw new Error('AWS_BUCKET_NAME environment variable is not set');
  }

  // Log upload attempt
  console.log(`Attempting to upload file to S3: ${sanitizedName} (${file.size} bytes)`);

  // Read the file data
  let fileData: Buffer;

  // If file.buffer exists, use it directly (memory storage)
  if (file.buffer) {
    fileData = file.buffer;
    console.log('Using file buffer for upload');
  } else if (file.path) {
    // Otherwise read from the file path (disk storage)
    fileData = fs.readFileSync(file.path);
    console.log(`Reading file from disk: ${file.path}`);
  } else {
    throw new Error('No file data available');
  }

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileData,
    ContentType: file.mimetype,
    ACL: 'public-read', // Make the file publicly accessible
  };

  try {
    console.log(`Sending file to S3 bucket: ${bucketName}`);
    await s3Client.send(new PutObjectCommand(params));
    const s3Url = `https://${bucketName}.s3.amazonaws.com/${key}`;
    console.log(`S3 upload successful: ${s3Url}`);
    return s3Url;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    // Provide more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error(`Failed to upload to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};