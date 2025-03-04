
// Verify AWS credentials before build
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

dotenv.config();

console.log('=== VERIFYING AWS CREDENTIALS BEFORE BUILD ===');
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 
  `${process.env.AWS_ACCESS_KEY_ID.substring(0, 4)}...` : 
  'NOT SET - BUILD WILL FAIL');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 
  'SET (Hidden for security)' : 
  'NOT SET - BUILD WILL FAIL');
console.log('AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME || 'NOT SET - BUILD WILL FAIL');

async function verifyAwsCredentials() {
  try {
    if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || 
        !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_BUCKET_NAME) {
      console.error('\n❌ ERROR: Required AWS environment variables are missing');
      process.exit(1); // Exit with error
    }

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
    
    // Check if our target bucket exists
    const bucketExists = buckets.some(bucket => bucket.Name === process.env.AWS_BUCKET_NAME);
    
    if (!bucketExists) {
      console.error(`\n❌ ERROR: Target bucket "${process.env.AWS_BUCKET_NAME}" not found`);
      console.log(`Available buckets: ${buckets.map(b => b.Name).join(', ')}`);
      process.exit(1);
    }
    
    console.log(`\n✅ AWS credentials verified successfully`);
    console.log(`✅ Found ${buckets.length} buckets`);
    console.log(`✅ Target bucket "${process.env.AWS_BUCKET_NAME}" exists and is accessible`);
    process.exit(0); // Exit successfully
  } catch (error) {
    console.error(`\n❌ ERROR: AWS credential verification failed: ${error.message}`);
    console.error(`Error code: ${error.code || 'unknown'}`);
    process.exit(1); // Exit with error
  }
}

verifyAwsCredentials();
