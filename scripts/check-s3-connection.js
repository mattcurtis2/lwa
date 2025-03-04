
// Simple script to verify AWS S3 credentials and connectivity
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkS3Connection() {
  console.log("S3 Connection Test");
  console.log("=================");
  
  // Check environment variables
  const requiredVars = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_BUCKET_NAME'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }
  
  console.log("✅ All required environment variables are set");
  
  try {
    // Create S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    
    console.log(`Attempting to connect to AWS S3 (region: ${process.env.AWS_REGION})...`);
    
    // Test listing buckets
    const response = await s3Client.send(new ListBucketsCommand({}));
    const buckets = response.Buckets || [];
    
    console.log(`✅ Successfully connected to AWS S3`);
    console.log(`Found ${buckets.length} buckets`);
    
    // Check if our target bucket exists
    const targetBucket = process.env.AWS_BUCKET_NAME;
    const bucketExists = buckets.some(bucket => bucket.Name === targetBucket);
    
    if (bucketExists) {
      console.log(`✅ Target bucket "${targetBucket}" exists`);
    } else {
      console.error(`❌ Target bucket "${targetBucket}" not found in your account`);
      console.log(`Available buckets: ${buckets.map(b => b.Name).join(', ')}`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ S3 connection failed: ${error.message}`);
    console.error(`Error code: ${error.code || 'unknown'}`);
    console.error(`Error details: ${error.stack}`);
    return false;
  }
}

// Run the check
checkS3Connection().then(success => {
  if (success) {
    console.log("\n✅ S3 connection test PASSED");
    process.exit(0);
  } else {
    console.error("\n❌ S3 connection test FAILED");
    process.exit(1);
  }
}).catch(error => {
  console.error("Unexpected error during test:", error);
  process.exit(1);
});
