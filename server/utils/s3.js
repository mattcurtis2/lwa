import { S3Client, PutObjectCommand, PutBucketCorsCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const configureCors = async (s3, bucketName) => {
  // Implement your CORS configuration logic here.  Example using a pre-configured bucket policy:
  // ... (Your CORS configuration code) ...

  console.log("CORS configuration attempted (Implementation needed).");
};


export async function uploadToS3(file) {
  console.log('==== S3 UPLOAD ATTEMPT ====');

  try {
    // Use fallback values to prevent "is not defined" errors
    const AWS_REGION = process.env.AWS_REGION || 'us-east-2';
    const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';
    const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';
    const BUCKET_NAME = process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME || 'lwacontent';
    
    // Save to global for debugging
    global.s3CredentialsDebug = {
      region: AWS_REGION,
      keyIdPrefix: AWS_ACCESS_KEY_ID ? AWS_ACCESS_KEY_ID.substring(0, 4) : 'empty',
      secretKeyPrefix: AWS_SECRET_ACCESS_KEY ? AWS_SECRET_ACCESS_KEY.substring(0, 4) : 'empty',
      bucketName: BUCKET_NAME
    };

    console.log('AWS Credentials Check:');
    console.log(`- AWS_REGION: ${AWS_REGION ? AWS_REGION : 'Not set'} (using: ${AWS_REGION})`);
    console.log(`- AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? `Set (starts with: ${AWS_ACCESS_KEY_ID.substring(0, 4)}...)` : 'Not set'} (using key starting with: ${AWS_ACCESS_KEY_ID.substring(0, 4) || 'empty'})`);
    console.log(`- AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? `Set (first 4 chars: ${AWS_SECRET_ACCESS_KEY.substring(0, 4)}..., length: ${AWS_SECRET_ACCESS_KEY.length})` : 'Not set'} (using key starting with: ${AWS_SECRET_ACCESS_KEY.substring(0, 4) || 'empty'})`);
    console.log(`- BUCKET_NAME: ${process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME || 'Not set'} (using: ${BUCKET_NAME})`);
    console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);

    // Log full environment in development mode for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.log('Full environment for debugging:');
      Object.keys(process.env).forEach(key => {
        if (key.includes('AWS') || key.includes('S3')) {
          console.log(`${key}: ${key.includes('SECRET') ? '[REDACTED]' : process.env[key]}`);
        }
      });
    }

    if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !BUCKET_NAME) {
      console.error('AWS credentials missing: ', {
        AWS_REGION_MISSING: !AWS_REGION,
        AWS_ACCESS_KEY_ID_MISSING: !AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY_MISSING: !AWS_SECRET_ACCESS_KEY,
        BUCKET_NAME_MISSING: !BUCKET_NAME
      });
      throw new Error('Missing AWS credentials or bucket name');
    }

    // Create a unique filename to prevent overwriting
    const fileExtension = path.extname(file.originalname || 'unknown.jpg').toLowerCase();
    const sanitizedName = (file.originalname || '').replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30);
    const filename = `${uuidv4()}-${sanitizedName}${fileExtension}`;

    console.log(`S3 Upload - Processing file: ${file.originalname || 'unnamed'}, size: ${file.size || 'unknown'} bytes`);

    // Configure AWS SDK
    const s3 = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
      }
    });

    console.log(`S3 Client initialized with region: ${AWS_REGION}, accessKeyId prefix: ${AWS_ACCESS_KEY_ID.substring(0, 4)}...`);

    // Check CORS configuration of the bucket
    try {
      console.log('Checking S3 bucket CORS configuration...');

      await s3.send(new PutBucketCorsCommand({
        Bucket: BUCKET_NAME,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ['*'],
              AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
              AllowedOrigins: ['*'],
              ExposeHeaders: ['ETag'],
              MaxAgeSeconds: 3000
            }
          ]
        }
      }));

      console.log('CORS configuration set successfully');
    } catch (corsError) {
      console.warn('Could not set CORS configuration:', corsError.message);
      // Continue despite CORS error - not critical
    }

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
    const s3Url = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${filename}`;
    console.log(`S3 upload successful: ${s3Url}`);
    console.log(`Alternative URL (path-style): https://s3.${AWS_REGION}.amazonaws.com/${BUCKET_NAME}/${filename}`);

    return s3Url;
  } catch (error) {
    console.error('S3 Upload - Error during upload:', error);
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}`);
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);

      // Add credentials to the error object for debugging
      error.awsCredentials = {
        region: AWS_REGION,
        accessKeyIdPrefix: AWS_ACCESS_KEY_ID.substring(0, 4),
        secretKeyPrefix: AWS_SECRET_ACCESS_KEY.substring(0, 4),
        fullAccessKeyId: AWS_ACCESS_KEY_ID,  // Include full key in server logs only
        bucketName: BUCKET_NAME
      };

      console.error('AWS Credentials used in failed request:', {
        region: AWS_REGION,
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretKeyPrefix: AWS_SECRET_ACCESS_KEY.substring(0, 4) + '...',
        bucketName: BUCKET_NAME
      });
    }
    throw error; // Re-throw to allow proper error handling at the caller
  }
}

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

export {uploadToS3, uploadBase64ToS3};

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