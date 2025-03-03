import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { env } from "process";

// Initialize S3 client
const s3Client = new S3Client({
  region: env.AWS_REGION || '',
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
  if (!env.AWS_BUCKET_NAME) {
    throw new Error('AWS_BUCKET_NAME environment variable is not set');
  }

  const fileName = `${crypto.randomUUID()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  try {
    console.log(`Uploading ${fileName} to S3...`);

    const command = new PutObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    });

    await s3Client.send(command);

    // Construct the S3 URL
    const s3Url = `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${fileName}`;
    console.log(`File uploaded successfully. S3 URL: ${s3Url}`);

    return s3Url;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};