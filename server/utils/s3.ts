import { S3Client, PutObjectCommand, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import fs from 'fs-extra';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const bucketName = process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME;

// Function to update S3 bucket CORS configuration
async function updateBucketCors() {
  try {
    console.log('Updating S3 bucket CORS configuration...');
    await s3.send(
      new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ['*'],
              AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
              AllowedOrigins: ['*'],
              ExposeHeaders: ['ETag', 'x-amz-meta-custom-header', 'x-amz-server-side-encryption'],
              MaxAgeSeconds: 3600
            }
          ]
        }
      })
    );
    console.log('CORS configuration updated successfully');
  } catch (error) {
    console.error('Error updating CORS configuration:', error);
  }
}

// Initialize S3 configuration when the module loads
updateBucketCors().catch(console.error);

export async function uploadToS3(file: any): Promise<string | null> {
  if (!file) {
    console.error('No file provided for upload');
    return null;
  }

  try {
    // Generate a unique key for the file
    const fileKey = `uploads/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;

    let fileContent;
    if (file.buffer) {
      fileContent = file.buffer;
    } else if (file.path) {
      fileContent = await fs.readFile(file.path);
    } else {
      throw new Error('File has neither buffer nor path');
    }

    // Upload file to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: fileContent,
        ContentType: file.mimetype || 'application/octet-stream',
        // Add cache control and CORS-related headers
        Metadata: {
          'Cache-Control': 'max-age=31536000',
          'x-amz-meta-custom-header': 'custom-value'
        }
      })
    );

    // Return the public URL
    const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    console.log('File uploaded successfully:', url);
    return url;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}