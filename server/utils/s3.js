import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

// Placeholder for configureCors function -  Needs to be implemented based on your specific CORS requirements.
const configureCors = async (s3, bucketName) => {
  // Implement your CORS configuration logic here.  Example using a pre-configured bucket policy:
  // ... (Your CORS configuration code) ...

  console.log("CORS configuration attempted (Implementation needed).");
};


export const uploadToS3 = async (file) => {
  try {
    console.log('==== S3 UPLOAD ATTEMPT ====');

    // Check AWS credentials
    const AWS_REGION = process.env.AWS_REGION;
    const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
    const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
    const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME;

    console.log('AWS Credentials Check:');
    console.log(`- AWS_REGION: ${AWS_REGION ? 'Set' : 'Not set'}`);
    console.log(`- AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID ? `Set (starts with: ${AWS_ACCESS_KEY_ID.substring(0, 6)}...)` : 'Not set'}`);
    console.log(`- AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY ? `Set (length: ${AWS_SECRET_ACCESS_KEY.length})` : 'Not set'}`);
    console.log(`- AWS_BUCKET_NAME: ${AWS_BUCKET_NAME ? 'Set' : 'Not set'}`);
    console.log(`- S3_BUCKET_NAME: ${process.env.S3_BUCKET_NAME ? 'Set' : 'Not set'}`);

    if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_BUCKET_NAME) {
      throw new Error('Missing AWS credentials. Please check your environment variables.');
    }

    // Create S3 client
    const s3 = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
      }
    });

    // Generate unique file name with UUID
    const fileExtension = path.extname(file.originalname);
    const uuid = randomUUID();
    const key = `${uuid}${fileExtension}`;

    console.log(`S3 Upload - Processing file: ${file.originalname}`);

    // Check and set CORS configuration for the bucket
    await configureCors(s3, AWS_BUCKET_NAME);

    // Check if the file exists
    if (!file.path || !fs.existsSync(file.path)) {
      throw new Error(`File not found at path: ${file.path}`);
    }

    // Create upload parameters
    const uploadParams = {
      Bucket: AWS_BUCKET_NAME,
      Key: key,
      ContentType: file.mimetype,
      ContentLength: file.size,
      ContentDisposition: 'inline',
      Body: fs.createReadStream(file.path)
    };

    console.log('S3 Upload - Params prepared:', uploadParams);
    console.log('S3 Upload - Sending file to S3...');

    // Upload to S3
    const uploadResult = await s3.send(new PutObjectCommand(uploadParams));
    console.log('S3 Upload - Success! Response:', uploadResult);

    // Generate S3 URL
    // Virtual-hosted style URL (default)
    const s3Url = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
    // Path-style URL (alternative)
    const pathStyleUrl = `https://s3.${AWS_REGION}.amazonaws.com/${AWS_BUCKET_NAME}/${key}`;

    console.log(`S3 upload successful: ${s3Url}`);
    console.log(`Alternative URL (path-style): ${pathStyleUrl}`);

    // Clean up temporary file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
      console.log(`Temporary file removed: ${file.path}`);
    }

    return s3Url;
  } catch (error) {
    console.error('S3 Upload - Error during upload:', error);
    // Re-throw the error so the calling function can handle it
    throw error;
  }
};