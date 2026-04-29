
// Verify AWS credentials before build (runs as `prebuild`; many hosts do NOT inject Secrets here).
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

dotenv.config();

function awsBucketEffective() {
  return process.env.AWS_BUCKET_NAME?.trim()
    || process.env.S3_BUCKET_NAME?.trim()
    || '';
}

function awsBuildTimeNoteMissing(missingHuman) {
  console.warn(`
⚠️  Missing AWS vars at **build time**: ${missingHuman}

Typical causes:
  • Repl / deployment **Secrets exist but are injected when the app runs** (\`npm start\`), not during \`npm run build\`.
  • Local build uses a minimal shell with no Repl Secrets — use a \`.env\` file for local installs.

Secrets are configured for **runtime**. If uploads work after publish, this build warning can be ignored.
Build continues — uploads need these at runtime.\n`);
}

console.log('=== VERIFYING AWS CREDENTIALS BEFORE BUILD ===');

function missingAwsPieces() {
  const missing = [];
  if (!process.env.AWS_REGION) missing.push('AWS_REGION');
  if (!process.env.AWS_ACCESS_KEY_ID) missing.push('AWS_ACCESS_KEY_ID');
  if (!process.env.AWS_SECRET_ACCESS_KEY) missing.push('AWS_SECRET_ACCESS_KEY');
  if (!awsBucketEffective()) missing.push('AWS_BUCKET_NAME or S3_BUCKET_NAME');
  return missing;
}

const missing = missingAwsPieces();
if (missing.length > 0) {
  awsBuildTimeNoteMissing(missing.join(', '));
  process.exit(0);
}

const awsBucketTarget = awsBucketEffective();

// Log status of each variable (partially masked for security)
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_ACCESS_KEY_ID:', `${process.env.AWS_ACCESS_KEY_ID.substring(0, 4)}...${process.env.AWS_ACCESS_KEY_ID.substring(process.env.AWS_ACCESS_KEY_ID.length - 4)}`);
console.log('AWS_SECRET_ACCESS_KEY:', `${process.env.AWS_SECRET_ACCESS_KEY.substring(0, 4)}...${process.env.AWS_SECRET_ACCESS_KEY.substring(process.env.AWS_SECRET_ACCESS_KEY.length - 4)}`);
console.log('AWS_BUCKET_NAME:', awsBucketTarget);

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
    
    const bucketExists = buckets.some(bucket => bucket.Name === awsBucketTarget);
    
    if (!bucketExists) {
      console.warn(`\n⚠️  WARNING: Target bucket "${awsBucketTarget}" not found`);
      console.warn(`Available buckets: ${buckets.map(b => b.Name).join(', ')}`);
      console.warn('Build will continue, but S3 uploads may fail at runtime.\n');
      process.exit(0);
    }
    
    console.log(`\n✅ AWS credentials verified successfully`);
    console.log(`✅ Found ${buckets.length} buckets`);
    console.log(`✅ Target bucket "${awsBucketTarget}" exists and is accessible`);
    process.exit(0);
  } catch (error) {
    console.warn(`\n⚠️  WARNING: AWS credential check failed: ${error.message}`);
    console.warn('Build will continue — verify your AWS secrets are correct in Replit Secrets.\n');
    process.exit(0);
  }
}

verifyAwsCredentials();
