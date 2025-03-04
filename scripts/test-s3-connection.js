
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
  // First check if required environment variables exist
  const requiredVars = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_BUCKET_NAME'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error(`❌ ERROR: Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }
  
  // Check if credentials are using placeholder values
  if (process.env.AWS_ACCESS_KEY_ID.includes('YOUR_') || 
      process.env.AWS_SECRET_ACCESS_KEY.includes('YOUR_')) {
    console.error('❌ ERROR: AWS credentials contain placeholder values. Please update with real credentials.');
    return false;  
  }

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
      return true;
    } else if (process.env.AWS_BUCKET_NAME) {
      console.error(`❌ Target bucket '${process.env.AWS_BUCKET_NAME}' not found in your account.`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('S3 Connection test failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error details:', error);
    return false;
  }
}

// Run the test and exit with appropriate code
testS3Connection().then(success => {
  if (success) {
    console.log("\n✅ AWS credentials validation PASSED");
    process.exit(0); // Success exit code
  } else {
    console.error("\n❌ AWS credentials validation FAILED");
    console.error("The build process will be aborted.");
    process.exit(1); // Failure exit code
  }
}).catch(error => {
  console.error("Unexpected error during credentials test:", error);
  process.exit(1); // Failure exit code
});
