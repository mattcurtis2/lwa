
// Verify AWS credentials before build
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

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
  console.warn(`\n⚠️  WARNING: AWS environment variables not available at build time: ${missingVars.join(', ')}`);
  console.warn('This is expected during production builds — secrets are only available at runtime.');
  console.warn('Skipping AWS credential verification. The app will validate credentials on startup.');
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
      console.error(`\n❌ ERROR: Target bucket "${process.env.AWS_BUCKET_NAME}" not found`);
      console.log(`Available buckets: ${buckets.map(b => b.Name).join(', ')}`);
      process.exit(1);
    }

    console.log(`\n✅ AWS credentials verified successfully`);
    console.log(`✅ Found ${buckets.length} buckets`);
    console.log(`✅ Target bucket "${process.env.AWS_BUCKET_NAME}" exists and is accessible`);
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ ERROR: AWS credential verification failed: ${error.message}`);
    console.error(`Error code: ${error.code || 'unknown'}`);
    process.exit(1);
  }
}

verifyAwsCredentials();
