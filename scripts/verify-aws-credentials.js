
// AWS credential verification script.
// Run manually with: npm run verify-aws
// Checks that the four required AWS secrets are present and that S3 is reachable.
// This script is NOT called automatically during builds.
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

dotenv.config();

function awsBucketEffective() {
  return process.env.AWS_BUCKET_NAME?.trim()
    || process.env.S3_BUCKET_NAME?.trim()
    || '';
}

const missing = [];
if (!process.env.AWS_REGION) missing.push('AWS_REGION');
if (!process.env.AWS_ACCESS_KEY_ID) missing.push('AWS_ACCESS_KEY_ID');
if (!process.env.AWS_SECRET_ACCESS_KEY) missing.push('AWS_SECRET_ACCESS_KEY');
if (!awsBucketEffective()) missing.push('AWS_BUCKET_NAME');

if (missing.length > 0) {
  console.error(`Missing AWS environment variables: ${missing.join(', ')}`);
  console.error('Add them to Replit Secrets before deploying.');
  process.exit(1);
}

console.log('=== VERIFYING AWS CREDENTIALS ===');
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_BUCKET_NAME:', awsBucketEffective());

const awsBucketTarget = awsBucketEffective();

async function verifyAwsCredentials() {
  try {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    const response = await s3Client.send(new ListBucketsCommand({}));
    const buckets = response.Buckets || [];
    const bucketExists = buckets.some(bucket => bucket.Name === awsBucketTarget);

    if (!bucketExists) {
      console.warn(`WARNING: Target bucket "${awsBucketTarget}" not found`);
      console.warn(`Available buckets: ${buckets.map(b => b.Name).join(', ')}`);
      process.exit(1);
    }

    console.log(`✅ AWS credentials verified`);
    console.log(`✅ Target bucket "${awsBucketTarget}" is accessible`);
    process.exit(0);
  } catch (error) {
    console.error(`AWS credential check failed: ${error.message}`);
    process.exit(1);
  }
}

verifyAwsCredentials();
