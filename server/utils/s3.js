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


async function uploadToS3(file, customFileName = null) {
  try {
    // AWS SDK setup
    const { S3Client, PutObjectCommand, GetBucketCorsCommand, PutBucketCorsCommand } = await import('@aws-sdk/client-s3');

    console.log("==== S3 UPLOAD ATTEMPT ====");
    // Check credentials
    console.log("AWS Credentials Check:");
    console.log(`- AWS_REGION: ${process.env.AWS_REGION ? 'Set' : 'Not set'}`);
    console.log(`- AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? `Set (starts with: ${process.env.AWS_ACCESS_KEY_ID.substring(0, 6)}...)` : 'Not set'}`);
    console.log(`- AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? `Set (length: ${process.env.AWS_SECRET_ACCESS_KEY.length})` : 'Not set'}`);
    console.log(`- AWS_BUCKET_NAME: ${process.env.AWS_BUCKET_NAME ? 'Set' : 'Not set'}`);
    console.log(`- S3_BUCKET_NAME: ${process.env.S3_BUCKET_NAME ? 'Set' : 'Not set'}`);

    if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_BUCKET_NAME) {
      throw new Error('Missing AWS credentials. Please check your environment variables.');
    }

    // Create S3 client
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    // Generate unique file name with UUID or use customFileName
    const fileExtension = path.extname(file.originalname || file.name); // Handle both file objects
    const key = customFileName ? customFileName + fileExtension : `${randomUUID()}${fileExtension}`;

    console.log(`S3 Upload - Processing file: ${file.originalname || file.name}`);

    // Check and set CORS configuration for the bucket
    await configureCors(s3, process.env.AWS_BUCKET_NAME);


    // Create upload parameters.  Handle Buffer or file stream.
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ContentType: file.mimetype || 'application/octet-stream', // Handle missing mimetype
      ContentLength: file.size || file.length, //Handle Buffer or file size
      ContentDisposition: 'inline',
      Body: file.path ? fs.createReadStream(file.path) : file // Use file stream if path exists, otherwise use Buffer
    };

    console.log('S3 Upload - Params prepared:', uploadParams);
    console.log('S3 Upload - Sending file to S3...');

    // Upload to S3
    const uploadResult = await s3.send(new PutObjectCommand(uploadParams));
    console.log('S3 Upload - Success! Response:', uploadResult);

    // Generate S3 URL
    // Virtual-hosted style URL (default)
    const s3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    // Path-style URL (alternative)
    const pathStyleUrl = `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_BUCKET_NAME}/${key}`;

    console.log(`S3 upload successful: ${s3Url}`);
    console.log(`Alternative URL (path-style): ${pathStyleUrl}`);

    // Clean up temporary file if it's a file stream
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
      console.log(`Temporary file removed: ${file.path}`);
    }

    return s3Url;
  } catch (error) {
    console.error('S3 Upload - Error during upload:', error);
    // Re-throw the error so the calling function can handle it
    throw error;
  }
}

export {uploadToS3};