
// Verify AWS credentials before build
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

dotenv.config();

// Required AWS environment variables
const requiredAwsVars = [
  'AWS_REGION', 
  'AWS_ACCESS_KEY_ID', 
  'AWS_SECRET_ACCESS_KEY', 
  'AWS_BUCKET_NAME'
];

console.log('=== VERIFYING AWS CREDENTIALS BEFORE BUILD ===');

// Check for missing variables
const missingVars = requiredAwsVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.warn(`\n⚠️  WARNING: Missing AWS environment variables: ${missingVars.join(', ')}`);
  console.warn('S3 file uploads will not work until these are set in Replit Secrets.');
  console.warn('Build will continue — set secrets before publishing.\n');
  process.exit(0);
}

// Log status of each variable (partially masked for security)
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_ACCESS_KEY_ID:', `${process.env.AWS_ACCESS_KEY_ID.substring(0, 4)}...${process.env.AWS_ACCESS_KEY_ID.substring(process.env.AWS_ACCESS_KEY_ID.length - 4)}`);
console.log('AWS_SECRET_ACCESS_KEY:', `${process.env.AWS_SECRET_ACCESS_KEY.substring(0, 4)}...${process.env.AWS_SECRET_ACCESS_KEY.substring(process.env.AWS_SECRET_ACCESS_KEY.length - 4)}`);
console.log('AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME);

async function verifyAwsCredentials() {
  try {
    console.log('\nTesting S3 connection...');
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    const response = await s3Client.send(new ListBucketsCommand({}));
    const buckets = response.Buckets || [];
    
    const bucketExists = buckets.some(bucket => bucket.Name === process.env.AWS_BUCKET_NAME);
    
    if (!bucketExists) {
      console.warn(`\n⚠️  WARNING: Target bucket "${process.env.AWS_BUCKET_NAME}" not found`);
      console.warn(`Available buckets: ${buckets.map(b => b.Name).join(', ')}`);
      console.warn('Build will continue, but S3 uploads may fail at runtime.\n');
      process.exit(0);
    }
    
    console.log(`\n✅ AWS credentials verified successfully`);
    console.log(`✅ Found ${buckets.length} buckets`);
    console.log(`✅ Target bucket "${process.env.AWS_BUCKET_NAME}" exists and is accessible`);
    process.exit(0);
  } catch (error) {
    console.warn(`\n⚠️  WARNING: AWS credential check failed: ${error.message}`);
    console.warn('Build will continue — verify your AWS secrets are correct in Replit Secrets.\n');
    process.exit(0);
  }
}

verifyAwsCredentials();
