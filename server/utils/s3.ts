import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { env } from "process";

// Initialize S3 client
const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
  const fileName = `${crypto.randomUUID()}-${file.originalname}`;
  
  const command = new PutObjectCommand({
    Bucket: env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  });

  await s3Client.send(command);

  // Return the public URL
  return `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${fileName}`;
};

export const getSignedS3Url = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: env.AWS_BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};
