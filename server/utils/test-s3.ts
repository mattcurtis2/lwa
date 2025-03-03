
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Test function to check S3 connectivity and permissions
export async function testS3Upload() {
  try {
    console.log('S3 Test - Starting...');
    console.log('- AWS_REGION:', process.env.AWS_REGION || 'Not set');
    console.log('- AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'Set (starts with: ' + process.env.AWS_ACCESS_KEY_ID.substring(0, 4) + '...)' : 'Not set');
    console.log('- AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set (length: ' + process.env.AWS_SECRET_ACCESS_KEY.length + ')' : 'Not set');
    console.log('- AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME || 'Not set');

    const bucketName = process.env.AWS_BUCKET_NAME || 'askanswercontent';
    console.log(`S3 Test - Using bucket: ${bucketName}`);

    // Create an S3 client
    const s3 = new S3Client({
      region: process.env.AWS_REGION || 'us-east-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    });

    // Create a test file
    const testFilePath = path.join(__dirname, '../../', 's3-test.txt');
    fs.writeFileSync(testFilePath, 'This is a test file for S3 upload.');

    // Generate a unique key for the test file
    const key = `test-${randomUUID()}.txt`;

    // Upload the test file to S3
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fs.readFileSync(testFilePath),
      ContentType: 'text/plain',
    };

    console.log('S3 Test - Uploading test file...');
    const command = new PutObjectCommand(params);
    const response = await s3.send(command);

    console.log('S3 Test - Success! Response:', response);

    // Construct the S3 URL
    const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-2'}.amazonaws.com/${key}`;
    console.log(`S3 Test - Test file URL: ${s3Url}`);

    // Clean up the test file
    fs.unlinkSync(testFilePath);
    console.log('S3 Test - Test file deleted from local disk');

    return {
      success: true,
      url: s3Url,
      message: 'S3 test successful'
    };
  } catch (error) {
    console.error('S3 Test - Error:', error);
    return {
      success: false,
      message: `S3 test failed: ${error.message}`
    };
  }
}
