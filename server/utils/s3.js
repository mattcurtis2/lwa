import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

// Placeholder for configureCors function -  Needs to be implemented based on your specific CORS requirements.
const configureCors = async (s3, bucketName) => {
  // Implement your CORS configuration logic here.  Example using a pre-configured bucket policy:
  // ... (Your CORS configuration code) ...

  console.log("CORS configuration attempted (Implementation needed).");
};


async function uploadToS3(file) {
  try {
    // Check that we have the AWS credentials
    console.log('==== S3 UPLOAD ATTEMPT ====');
    console.log('AWS Credentials Check:');
    console.log(`- AWS_REGION: ${process.env.AWS_REGION ? 'Set' : 'Not set'}`);
    console.log(`- AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? `Set (starts with: ${process.env.AWS_ACCESS_KEY_ID.substring(0, 6)}...)` : 'Not set'}`);
    console.log(`- AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? `Set (length: ${process.env.AWS_SECRET_ACCESS_KEY.length})` : 'Not set'}`);
    console.log(`- AWS_BUCKET_NAME: ${process.env.AWS_BUCKET_NAME ? `Set (${process.env.AWS_BUCKET_NAME})` : 'Not set'}`);
    console.log(`- S3_BUCKET_NAME: ${process.env.S3_BUCKET_NAME ? `Set (${process.env.S3_BUCKET_NAME})` : 'Not set'}`);

    const bucketName = process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      console.error('S3 bucket name not configured in environment variables');
      throw new Error('S3 bucket name not configured');
    }

    console.log(`Using S3 bucket: ${bucketName}`);
    console.log(`Initializing S3 client with region: ${process.env.AWS_REGION}`);

    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Generate a unique filename
    const randomId = randomUUID();
    let fileExtension = path.extname(file.originalname || '');
    if (!fileExtension && file.mimetype) {
      const mimeToExt = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'application/pdf': '.pdf',
        'text/plain': '.txt',
      };
      fileExtension = mimeToExt[file.mimetype] || '';
    }

    const key = `${randomId}${fileExtension}`;
    console.log(`S3 Upload - Processing file: ${file.originalname || 'unnamed'} (${file.mimetype || 'unknown type'})`);
    console.log(`Generated key for S3: ${key}`);

    // Ensure CORS is set up on the bucket
    try {
      await configureCors(s3Client, bucketName);
    } catch (corsError) {
      console.warn(`Warning: CORS configuration failed, but continuing with upload: ${corsError.message}`);
    }

    // Get content type and file content
    let contentType = file.mimetype || 'application/octet-stream';
    let fileContent;
    let contentLength = 0;

    console.log(`Processing file content. File has path: ${!!file.path}, File has buffer: ${!!file.buffer}`);

    if (file.path) {
      // File is on disk
      console.log(`Reading file from disk: ${file.path}`);
      fileContent = fs.readFileSync(file.path);
      contentLength = fileContent.length;
      console.log(`File read successfully, size: ${contentLength} bytes`);
    } else if (file.buffer) {
      // File is in memory
      console.log(`Using buffer from memory, size: ${file.buffer.length} bytes`);
      fileContent = file.buffer;
      contentLength = file.buffer.length;
    } else {
      console.error('File has neither path nor buffer');
      throw new Error('File has no path or buffer');
    }

    if (contentLength === 0) {
      console.error('File content is empty');
      throw new Error('Cannot upload empty file');
    }

    // Upload parameters
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
      ContentLength: contentLength,
      ContentDisposition: 'inline'
    };

    console.log('S3 Upload - Params prepared:', JSON.stringify({
      Bucket: params.Bucket,
      Key: params.Key,
      ContentType: params.ContentType,
      ContentLength: params.ContentLength,
      ContentDisposition: params.ContentDisposition
    }, null, 2));

    console.log('S3 Upload - Sending file to S3...');

    // Upload the file
    const command = new PutObjectCommand(params);
    let response;
    try {
      response = await s3Client.send(command);
      console.log('S3 Upload - Success! Response:', JSON.stringify(response, null, 2));
    } catch (uploadError) {
      console.error('S3 Upload - Error during S3 client.send:', uploadError);
      console.error('Upload error details:', JSON.stringify({
        code: uploadError.code,
        message: uploadError.message,
        region: uploadError.$metadata?.region || process.env.AWS_REGION,
        requestId: uploadError.$metadata?.requestId,
        extendedRequestId: uploadError.$metadata?.extendedRequestId,
        statusCode: uploadError.$metadata?.httpStatusCode
      }, null, 2));
      throw uploadError;
    }

    // Generate the URL
    const objectUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    const pathStyleUrl = `https://s3.${process.env.AWS_REGION}.amazonaws.com/${bucketName}/${key}`;

    console.log(`S3 upload successful: ${objectUrl}`);
    console.log(`Alternative URL (path-style): ${pathStyleUrl}`);

    // Verify the URL is accessible
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: bucketName,
        Key: key
      });
      await s3Client.send(headCommand);
      console.log(`S3 object verification successful, object exists`);
    } catch (verifyError) {
      console.warn(`Warning: Couldn't verify object exists: ${verifyError.message}`);
      // Continue anyway since the upload appeared successful
    }

    // Return the virtual-hosted style URL
    return objectUrl;
  } catch (error) {
    console.error('S3 Upload - Error during upload process:', error);
    if (error.code) console.error(`AWS Error Code: ${error.code}`);
    if (error.$metadata) console.error(`AWS Metadata: ${JSON.stringify(error.$metadata)}`);
    if (error.stack) console.error(`Error Stack: ${error.stack}`);
    throw error;
  }
}

export {uploadToS3};