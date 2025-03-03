
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import fs from "fs";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || '',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
  if (!process.env.AWS_BUCKET_NAME) {
    throw new Error('AWS_BUCKET_NAME environment variable is not set');
  }

  const fileName = `${crypto.randomUUID()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  try {
    console.log(`Uploading ${fileName} to S3...`);

    // Get file buffer - either directly from file.buffer or read from disk
    let fileBuffer: Buffer;
    if (file.buffer) {
      fileBuffer = file.buffer;
    } else {
      fileBuffer = await fs.promises.readFile(file.path);
    }

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    });

    await s3Client.send(command);

    // Construct the S3 URL
    const s3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    console.log(`File uploaded successfully. S3 URL: ${s3Url}`);

    return s3Url;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
