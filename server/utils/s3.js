import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import fs from "fs";
import path from "path";

// Create a single S3 client instance (similar to database pattern)
let s3Client = null;

function getAwsEnv() {
  return {
    region: process.env.AWS_REGION || process.env.LWA_AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.LWA_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.LWA_AWS_SECRET_ACCESS_KEY,
    bucketName:
      process.env.AWS_BUCKET_NAME ||
      process.env.S3_BUCKET_NAME ||
      process.env.LWA_AWS_BUCKET_NAME,
  };
}

// Initialize S3 client with error handling like the DB implementation
function getS3Client() {
  if (s3Client) return s3Client;

  const { region, accessKeyId, secretAccessKey } = getAwsEnv();

  // Log credentials state for debugging
  console.log('S3 Client Initialization:');
  console.log(`- AWS_REGION: ${region ? 'Set' : 'Not set'}`);
  console.log(`- AWS_ACCESS_KEY_ID: ${accessKeyId ? `Set (starts with: ${accessKeyId.substring(0, 4)}...)` : 'Not set'}`);
  console.log(`- AWS_SECRET_ACCESS_KEY: ${secretAccessKey ? 'Set (length: ' + secretAccessKey.length + ')' : 'Not set'}`);

  // Check required credentials (like DATABASE_URL check)
  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'AWS credentials not properly configured. Check AWS_* vars or LWA_AWS_* fallback vars.'
    );
  }

  // Create client once
  s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });

  return s3Client;
}

// Get bucket name with validation
function getBucketName() {
  const bucketName = getAwsEnv().bucketName;
  if (!bucketName) {
    throw new Error(
      'S3 bucket name not configured. Check AWS_BUCKET_NAME, S3_BUCKET_NAME, or LWA_AWS_BUCKET_NAME.'
    );
  }
  return bucketName;
}

export async function uploadToS3(file) {
  console.log('==== S3 UPLOAD ATTEMPT ====');
  const env = getAwsEnv();

  try {
    // Get client and bucket using centralized functions
    const s3 = getS3Client();
    const BUCKET_NAME = getBucketName();

    // Save credentials to global for debugging (can be removed later)
    global.s3CredentialsDebug = {
      region: env.region,
      keyIdPrefix: env.accessKeyId ? env.accessKeyId.substring(0, 4) : 'empty',
      secretKeyPrefix: env.secretAccessKey ? env.secretAccessKey.substring(0, 4) : 'empty',
      bucketName: BUCKET_NAME
    };


    // Create a unique filename to prevent overwriting
    const fileExtension = path.extname(file.originalname || 'unknown.jpg').toLowerCase();
    const sanitizedName = (file.originalname || '').replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30);
    const filename = `${uuidv4()}-${sanitizedName}${fileExtension}`;

    console.log(`S3 Upload - Processing file: ${file.originalname || 'unnamed'}, size: ${file.size || 'unknown'} bytes`);

    // Get the content type
    const contentType = file.mimetype || 'application/octet-stream';

    // Make sure we have a buffer to upload
    let fileBuffer;
    if (file.buffer) {
      fileBuffer = file.buffer;
    } else if (file.path) {
      fileBuffer = fs.readFileSync(file.path);
    } else {
      throw new Error('No file buffer or path provided for S3 upload');
    }

    // Log buffer size to confirm we have data
    console.log(`File buffer size: ${fileBuffer.length} bytes`);

    // Set upload parameters
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: fileBuffer,
      ContentType: contentType,
      ContentDisposition: 'inline',
      ContentLength: fileBuffer.length
    };

    console.log('S3 Upload - Params prepared:', uploadParams);

    // Upload to S3
    console.log('S3 Upload - Sending file to S3...');
    const uploadResult = await s3.send(new PutObjectCommand(uploadParams));
    console.log('S3 Upload - Success! Response:', uploadResult);

    // Construct the URL
    const s3Url = `https://${BUCKET_NAME}.s3.${env.region}.amazonaws.com/${filename}`;
    console.log(`S3 upload successful: ${s3Url}`);
    console.log(`Alternative URL (path-style): https://s3.${env.region}.amazonaws.com/${BUCKET_NAME}/${filename}`);

    return s3Url;
  } catch (error) {
    console.error('S3 Upload - Error during upload:', error);
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}`);
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);

      // Add credentials to the error object for debugging
      error.awsCredentials = {
        region: env.region,
        accessKeyIdPrefix: env.accessKeyId ? env.accessKeyId.substring(0, 4) : 'empty',
        secretKeyPrefix: env.secretAccessKey ? env.secretAccessKey.substring(0, 4) : 'empty',
        fullAccessKeyId: env.accessKeyId,  // Include full key in server logs only
        bucketName: getBucketName()
      };

      console.error('AWS Credentials used in failed request:', {
        region: env.region,
        accessKeyId: env.accessKeyId,
        secretKeyPrefix: env.secretAccessKey ? env.secretAccessKey.substring(0, 4) + '...' : 'empty',
        bucketName: getBucketName()
      });
    }
    throw error; // Re-throw to allow proper error handling at the caller
  }
};

export async function getFromS3(key) {
  try {
    const s3 = getS3Client();
    const BUCKET_NAME = getBucketName();

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3.send(command);
    return response;
  } catch (error) {
    console.error('Error getting file from S3:', error);
    throw error;
  }
};

// Upload a base64 encoded image to S3
async function uploadBase64ToS3(base64Data, fileName) {
  try {
    console.log('Starting base64 to S3 upload process...');

    // Extract the MIME type and binary data
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      console.error('Invalid base64 data URL format');
      throw new Error('Invalid base64 data URL format');
    }

    const type = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    console.log(`Processing base64 image: ${type}, size: ${buffer.length} bytes`);

    const extension = type.split('/')[1] || 'jpeg';
    const generatedFileName = fileName || `image-${Date.now()}.${extension}`;

    // Create a mock file object for the uploadToS3 function
    const mockFile = {
      buffer,
      originalname: generatedFileName,
      mimetype: type,
      size: buffer.length
    };

    console.log(`Created mock file for S3 upload: ${generatedFileName} (${type})`);

    const uploadResult = await uploadToS3(mockFile);
    console.log(`Base64 image successfully uploaded to S3: ${uploadResult}`);

    return uploadResult;
  } catch (error) {
    console.error('Error uploading base64 to S3:', error);
    throw error;
  }
}

export {uploadBase64ToS3};

//Example PUT route handler (needs to be integrated into your existing server code)
//This is a placeholder and needs to be adapted to your specific framework (Express, Fastify etc.)
const handlePutPrinciple = async (req, res) => {
    try {
        const principleId = req.params.id;
        const updatedPrinciple = req.body;

        if (updatedPrinciple.imageUrl && updatedPrinciple.imageUrl.startsWith('data:image/')) {
            const imageUrl = await uploadBase64ToS3(updatedPrinciple.imageUrl, `principle-${principleId}-image.jpg`);
            updatedPrinciple.imageUrl = imageUrl;
        }

        // ... your existing principle update logic ...

        res.status(200).json({ message: 'Principle updated successfully', principle: updatedPrinciple });

    } catch (error) {
        console.error('Error updating principle:', error);
        res.status(500).json({ error: 'Failed to update principle' });
    }
};