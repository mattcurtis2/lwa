
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

dotenv.config();

// Print the environment variables (with sensitive data partially hidden)
console.log('=== AWS CREDENTIALS CHECK ===');
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 
  `${process.env.AWS_ACCESS_KEY_ID.substring(0, 4)}...${process.env.AWS_ACCESS_KEY_ID.substring(process.env.AWS_ACCESS_KEY_ID.length - 4)}` : 
  'Not set');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 
  `${process.env.AWS_SECRET_ACCESS_KEY.substring(0, 4)}...${process.env.AWS_SECRET_ACCESS_KEY.substring(process.env.AWS_SECRET_ACCESS_KEY.length - 4)}` : 
  'Not set');
console.log('AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME);
console.log('===========================');

async function testS3Connection() {
  try {
    console.log('Creating S3 client...');
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    console.log('Testing connection by listing buckets...');
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    
    console.log('Connection successful!');
    console.log('Available buckets:', response.Buckets.map(b => b.Name).join(', '));
    
    // Check if our target bucket exists
    if (process.env.AWS_BUCKET_NAME && 
        response.Buckets.some(b => b.Name === process.env.AWS_BUCKET_NAME)) {
      console.log(`✅ Target bucket '${process.env.AWS_BUCKET_NAME}' exists and is accessible.`);
    } else if (process.env.AWS_BUCKET_NAME) {
      console.log(`❌ Target bucket '${process.env.AWS_BUCKET_NAME}' not found in your account.`);
    }
    
  } catch (error) {
    console.error('S3 Connection test failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error details:', error);
  }
}

testS3Connection();
