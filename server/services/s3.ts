import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

// Generate a unique filename
const generateUniqueFileName = (originalName: string) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName);
  return `${timestamp}-${randomString}${extension}`;
};

// Upload file to S3
export const uploadToS3 = async (file: Express.Multer.File) => {
  const fileName = generateUniqueFileName(file.originalname);
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME as string,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  try {
    await s3Client.send(command);
    const url = await getSignedUrl(s3Client, new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: fileName,
    }), { expiresIn: 3600 * 24 * 7 }); // URL expires in 7 days

    return {
      url,
      key: fileName,
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
};

// Get a signed URL for an existing object
export const getSignedFileUrl = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME as string,
    Key: key,
  });

  try {
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 * 24 * 7 });
  } catch (error) {
    console.error('Error getting signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
};
