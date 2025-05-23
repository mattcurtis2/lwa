// Script to diagnose S3 access issues
import { S3Client, ListObjectsCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function diagnoseS3Access() {
  console.log('=== S3 ACCESS DIAGNOSIS ===');
  
  // Check environment variables
  const requiredVars = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_BUCKET_NAME'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing required AWS variables: ${missingVars.join(', ')}`);
    return;
  }
  
  // Display masked credentials for verification
  console.log('AWS credentials check:');
  console.log(`- AWS_REGION: ${process.env.AWS_REGION}`);
  
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucketName = process.env.AWS_BUCKET_NAME;
  
  console.log(`- AWS_ACCESS_KEY_ID: ${accessKeyId.substring(0, 4)}...${accessKeyId.substring(accessKeyId.length - 4)}`);
  console.log(`- AWS_SECRET_ACCESS_KEY: ${secretAccessKey.substring(0, 4)}...${secretAccessKey.substring(secretAccessKey.length - 4)}`);
  console.log(`- AWS_BUCKET_NAME: ${bucketName}`);
  
  try {
    // Create S3 client
    console.log('\nCreating S3 client...');
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    
    // Test listing objects
    console.log('\nTesting bucket listing...');
    const listCommand = new ListObjectsCommand({
      Bucket: bucketName,
      MaxKeys: 5
    });
    
    const listResult = await s3Client.send(listCommand);
    
    if (listResult.Contents && listResult.Contents.length > 0) {
      console.log(`✅ Successfully listed ${listResult.Contents.length} objects in bucket`);
      
      // Display the first few objects
      console.log('\nSample objects in bucket:');
      listResult.Contents.slice(0, 3).forEach((item, index) => {
        console.log(`${index + 1}. Key: ${item.Key}, Size: ${item.Size} bytes, Last Modified: ${item.LastModified}`);
      });
      
      // Try to access the first object to check permissions
      if (listResult.Contents[0]) {
        const testObjectKey = listResult.Contents[0].Key;
        console.log(`\nTesting access to object: ${testObjectKey}`);
        
        try {
          const getCommand = new GetObjectCommand({
            Bucket: bucketName,
            Key: testObjectKey
          });
          
          const getResult = await s3Client.send(getCommand);
          console.log(`✅ Successfully accessed object: ${testObjectKey}`);
          console.log(`  - Content Type: ${getResult.ContentType}`);
          console.log(`  - Content Length: ${getResult.ContentLength} bytes`);
        } catch (getError) {
          console.error(`❌ Error accessing object: ${getError.message}`);
          console.error(`  This indicates a permissions issue with individual objects`);
          
          if (getError.message.includes('AccessDenied') || getError.message.includes('AllAccessDisabled')) {
            console.error('\n⚠️ OBJECT ACCESS DENIED');
            console.error('Your AWS credentials can list the bucket contents but cannot access the objects.');
            console.error('This suggests a bucket policy or object ACL issue restricting access.');
          }
        }
      }
    } else {
      console.log('✅ Connected to bucket but it appears to be empty or you don\'t have listing permissions');
    }
  } catch (error) {
    console.error(`❌ S3 Access Error: ${error.message}`);
    
    if (error.message.includes('InvalidAccessKeyId')) {
      console.error('\n⚠️ INVALID ACCESS KEY');
      console.error('Your AWS access key ID appears to be invalid or not recognized by AWS.');
    } else if (error.message.includes('SignatureDoesNotMatch')) {
      console.error('\n⚠️ INVALID SECRET KEY');
      console.error('Your AWS secret access key appears to be invalid or does not match the access key ID.');
    } else if (error.message.includes('AccessDenied') || error.message.includes('AllAccessDisabled')) {
      console.error('\n⚠️ ACCESS DENIED');
      console.error('Your credentials are valid but lack permissions to access this S3 bucket.');
    } else if (error.message.includes('NoSuchBucket')) {
      console.error('\n⚠️ BUCKET NOT FOUND');
      console.error(`The bucket "${bucketName}" does not exist or you don't have permissions to access it.`);
    }
    
    console.error('\nDetailed error:', error);
  }
}

// Run the diagnosis
diagnoseS3Access().catch(error => {
  console.error('Unhandled error during diagnosis:', error);
});