
// AWS credential verification script.
// Run manually with: npm run verify-aws
// Checks that the four required AWS secrets are present and that S3 is reachable.
// This script is NOT called automatically during builds.
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

dotenv.config();

function maskValue(value) {
  if (!value) return 'Not set';
  if (value.length <= 8) return `Set (len=${value.length})`;
  return `Set (${value.slice(0, 4)}...${value.slice(-4)}, len=${value.length})`;
}

function awsBucketEffective() {
  return process.env.AWS_BUCKET_NAME?.trim()
    || process.env.S3_BUCKET_NAME?.trim()
    || process.env.LWA_AWS_BUCKET_NAME?.trim()
    || '';
}

function awsRegionEffective() {
  return process.env.AWS_REGION || process.env.LWA_AWS_REGION || '';
}

function awsAccessKeyEffective() {
  return process.env.AWS_ACCESS_KEY_ID || process.env.LWA_AWS_ACCESS_KEY_ID || '';
}

function awsSecretKeyEffective() {
  return process.env.AWS_SECRET_ACCESS_KEY || process.env.LWA_AWS_SECRET_ACCESS_KEY || '';
}

function stripeSecretEffective() {
  return process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY || '';
}

function databaseUrlEffective() {
  return process.env.DATABASE_URL || '';
}

function sourceLabel(primary, fallback) {
  if (primary) return "primary";
  if (fallback) return "fallback";
  return "missing";
}

console.log('=== BUILD ENV CHECK (masked) ===');
console.log('DATABASE_URL:', maskValue(databaseUrlEffective()));
console.log('STRIPE_SECRET_KEY(_LIVE):', maskValue(stripeSecretEffective()));
console.log('AWS_REGION:', maskValue(awsRegionEffective()), `[source=${sourceLabel(process.env.AWS_REGION, process.env.LWA_AWS_REGION)}]`);
console.log('AWS_ACCESS_KEY_ID:', maskValue(awsAccessKeyEffective()), `[source=${sourceLabel(process.env.AWS_ACCESS_KEY_ID, process.env.LWA_AWS_ACCESS_KEY_ID)}]`);
console.log('AWS_SECRET_ACCESS_KEY:', maskValue(awsSecretKeyEffective()), `[source=${sourceLabel(process.env.AWS_SECRET_ACCESS_KEY, process.env.LWA_AWS_SECRET_ACCESS_KEY)}]`);
console.log('AWS_BUCKET_NAME:', maskValue(awsBucketEffective()), `[source=${sourceLabel(process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME, process.env.LWA_AWS_BUCKET_NAME)}]`);

const missing = [];
if (!awsRegionEffective()) missing.push('AWS_REGION or LWA_AWS_REGION');
if (!awsAccessKeyEffective()) missing.push('AWS_ACCESS_KEY_ID or LWA_AWS_ACCESS_KEY_ID');
if (!awsSecretKeyEffective()) missing.push('AWS_SECRET_ACCESS_KEY or LWA_AWS_SECRET_ACCESS_KEY');
if (!awsBucketEffective()) missing.push('AWS_BUCKET_NAME or S3_BUCKET_NAME or LWA_AWS_BUCKET_NAME');

if (missing.length > 0) {
  console.error(`Missing AWS environment variables: ${missing.join(', ')}`);
  console.error('Add them to Replit Secrets before deploying.');
  process.exit(1);
}

const awsBucketTarget = awsBucketEffective();

async function verifyAwsCredentials() {
  try {
    const s3Client = new S3Client({
      region: awsRegionEffective(),
      credentials: {
        accessKeyId: awsAccessKeyEffective(),
        secretAccessKey: awsSecretKeyEffective()
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
