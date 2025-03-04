// Handle the ImageUpload
app.post('/api/admin/upload-principle-image', upload.single('image'), async (req, res) => {
  try {
    // Get the uploaded file
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to S3 instead of storing locally
    const { uploadToS3 } = await import('../utils/s3.js');
    const s3Url = await uploadToS3(file);

    if (!s3Url) {
      throw new Error('Failed to upload to S3');
    }

    console.log(`Principle image uploaded to S3: ${s3Url}`);

    // Return the S3 URL
    res.json({ 
      url: s3Url,
      size: file.size
    });
  } catch (error) {
    console.error('Error uploading principle image:', error);
    res.status(500).json({ error: 'Failed to upload image', details: error.message });
  }
});

// Handle base64 image uploads for principles (from cropper)
app.post('/api/admin/upload-principle-image-base64', async (req, res) => {
  try {
    console.log('==== PROCESSING PRINCIPLE IMAGE UPLOAD (BASE64) ====');
    const { base64Image } = req.body;

    if (!base64Image) {
      console.error('No base64 image provided in request body');
      return res.status(400).json({ error: 'No base64 image provided' });
    }

    console.log(`Received base64 image (length: ${base64Image.length}, starts with: ${base64Image.substring(0, 30)}...)`);

    // Extract the base64 data (remove data:image/jpeg;base64, prefix)
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    console.log(`Extracted base64 data (length: ${base64Data.length})`);

    // Create a buffer from the base64 data
    const imageBuffer = Buffer.from(base64Data, 'base64');
    console.log(`Created buffer from base64 data (size: ${imageBuffer.length} bytes)`);

    // Create a mock file object that uploadToS3 can handle
    const filename = `principle-${Date.now()}.jpg`;
    const mockFile = {
      buffer: imageBuffer,
      mimetype: 'image/jpeg',
      originalname: filename
    };
    console.log(`Created mock file object with name: ${filename}`);

    // Import and call the S3 upload function
    console.log('Importing S3 utility...');
    const { uploadToS3 } = await import('../utils/s3.js');
    console.log('Calling uploadToS3...');
    const s3Url = await uploadToS3(mockFile);

    if (!s3Url) {
      console.error('S3 upload failed: No URL returned');
      throw new Error('Failed to upload base64 image to S3 - No URL returned');
    }

    if (!s3Url.includes('s3.amazonaws.com') && !s3Url.includes('amazonaws.com')) {
      console.error(`S3 upload returned invalid URL: ${s3Url}`);
      throw new Error(`Invalid S3 URL returned: ${s3Url}`);
    }

    console.log(`Principle base64 image uploaded to S3 successfully: ${s3Url}`);

    // Return the S3 URL
    res.json({
      url: s3Url,
      size: imageBuffer.length
    });
  } catch (error) {
    console.error('Error uploading base64 principle image:', error);
    // Log more detailed error information
    if (error.code) console.error(`AWS Error Code: ${error.code}`);
    if (error.statusCode) console.error(`Status Code: ${error.statusCode}`);
    if (error.region) console.error(`Region: ${error.region}`);
    if (error.hostname) console.error(`Hostname: ${error.hostname}`);
    if (error.time) console.error(`Time: ${error.time}`);
    if (error.stack) console.error(`Stack: ${error.stack}`);

    res.status(500).json({ 
      error: 'Failed to upload image', 
      details: error.message,
      code: error.code || 'unknown',
      statusCode: error.statusCode || 500
    });
  }
});

// Handle the ImageUpload
app.post('/api/admin/upload-carousel-image', upload.single('image'), async (req, res) => {
  try {
    // Get the uploaded file
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to S3 instead of storing locally
    const { uploadToS3 } = await import('../utils/s3.js');
    const s3Url = await uploadToS3(file);

    if (!s3Url) {
      throw new Error('Failed to upload to S3');
    }

    console.log(`Carousel image uploaded to S3: ${s3Url}`);

    // Return the S3 URL
    res.json({ 
      url: s3Url,
      size: file.size
    });
  } catch (error) {
    console.error('Error uploading carousel image:', error);
    res.status(500).json({ error: 'Failed to upload image', details: error.message });
  }
});

app.post('/api/admin/save-cropped-image', async (req, res) => {
  try {
    const { dataUrl, fileName } = req.body;

    // Validate input
    if (!dataUrl || !fileName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Extract the base64 data
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid data URL format' });
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    // Create a temporary file
    const tempPath = path.join(uploadDir, fileName);
    fs.writeFileSync(tempPath, buffer);

    // Create a file object for S3 upload
    const file = {
      originalname: fileName,
      path: tempPath,
      mimetype: mimeType,
      size: buffer.length
    };

    // Upload to S3
    const { uploadToS3 } = await import('../utils/s3.js');
    const s3Url = await uploadToS3(file);

    if (!s3Url) {
      throw new Error('Failed to upload to S3');
    }

    console.log(`Cropped image uploaded to S3: ${s3Url}`);

    // Clean up temporary file
    fs.unlinkSync(tempPath);

    // Return the S3 URL
    res.json({ url: s3Url });
  } catch (error) {
    console.error('Error saving cropped image:', error);
    
    // Enhanced error reporting for troubleshooting
    const errorDetails = {
      message: error.message,
      code: error.code || 'unknown',
      requestId: error.$metadata?.requestId || 'N/A',
      awsRegion: process.env.AWS_REGION || 'Not set',
      accessKeyIdPrefix: process.env.AWS_ACCESS_KEY_ID ? process.env.AWS_ACCESS_KEY_ID.substring(0, 4) + '...' : 'Not set',
      secretKeyPrefix: process.env.AWS_SECRET_ACCESS_KEY ? process.env.AWS_SECRET_ACCESS_KEY.substring(0, 4) + '...' : 'Not set',
      s3CredentialsUsed: global.s3CredentialsDebug || 'Not available'
    };
    
    console.error('Detailed S3 error information:', errorDetails);
    
    res.status(500).json({ 
      error: 'Failed to save cropped image', 
      details: error.message,
      debug: errorDetails 
    });
  }
});

// Add a test route for S3 connectivity
app.get('/api/admin/test-s3-connection', async (req, res) => {
  try {
    console.log('Testing S3 connection...');

    // Check environment variables
    const envCheck = {
      AWS_REGION: process.env.AWS_REGION ? 'Set' : 'Not set',
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Not set',
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Not set',
      AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || 'Not set',
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'Not set'
    };

    const bucketName = process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME;

    if (!bucketName) {
      return res.status(500).json({
        success: false,
        message: 'S3 bucket name not configured',
        envCheck
      });
    }

    // Initialize S3 client
    const { S3Client, ListObjectsCommand } = await import('@aws-sdk/client-s3');
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Test connection by listing objects (max 1)
    const command = new ListObjectsCommand({
      Bucket: bucketName,
      MaxKeys: 1
    });

    const response = await s3Client.send(command);

    res.json({
      success: true,
      message: 'S3 connection successful',
      bucketName,
      region: process.env.AWS_REGION,
      objects: response.Contents ? response.Contents.length : 0,
      envCheck
    });
  } catch (error) {
    console.error('S3 connection test failed:', error);
    res.status(500).json({
      success: false,
      message: `S3 connection failed: ${error.message}`,
      code: error.code,
      region: process.env.AWS_REGION,
      errorDetails: error.stack
    });
  }
});

// Update principle
app.put("/api/principles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, imageUrl } = req.body;

      console.log(`Updating principle ${id} with image: ${imageUrl?.substring(0, 100)}...`);

      // Check if image is a base64 string that needs to be uploaded to S3
      let finalImageUrl = imageUrl;
      if (imageUrl && imageUrl.startsWith('data:image')) {
        console.log(`Principle ${id} has a base64 image that needs to be uploaded to S3`);
        try {
          // Use async import to ensure we get the latest version of the module
          const { uploadToS3 } = await import('../utils/s3.js');
          
          // Extract the base64 data and determine mimetype
          const matches = imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          
          if (!matches || matches.length !== 3) {
            throw new Error('Invalid base64 image format');
          }
          
          const mimetype = matches[1];
          const base64Data = matches[2];
          console.log(`Extracted base64 data (length: ${base64Data.length}) with mimetype: ${mimetype}`);
          
          // Create a buffer from the base64 data
          const imageBuffer = Buffer.from(base64Data, 'base64');
          console.log(`Created buffer from base64 data (size: ${imageBuffer.length} bytes)`);
          
          // Create a mock file object that uploadToS3 can handle
          const filename = `principle-${id}-${Date.now()}.jpg`;
          const mockFile = {
            buffer: imageBuffer,
            mimetype: mimetype || 'image/jpeg',
            originalname: filename
          };
          console.log(`Created mock file object with name: ${filename}`);
          
          console.log('=== S3 UPLOAD FOR PRINCIPLE UPDATE ===');
          const s3Url = await uploadToS3(mockFile);
          
          if (!s3Url) {
            throw new Error('Failed to upload to S3 - No URL returned');
          }
          
          console.log(`Successfully uploaded principle image to S3: ${s3Url}`);
          finalImageUrl = s3Url;
        } catch (uploadError) {
          console.error(`Failed to upload principle image to S3:`, uploadError);
          return res.status(500).json({ 
            error: 'Failed to upload image to S3', 
            details: uploadError.message,
            code: uploadError.code || 'unknown'
          });
        }
      } else {
        console.log(`Principle ${id} image is already a URL or empty: ${finalImageUrl?.substring(0, 50)}...`);
      }

      // Update principle
      await db
        .update(principles)
        .set({
          title,
          description,
          imageUrl: finalImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(principles.id, parseInt(id)));

      res.json({ success: true, imageUrl: finalImageUrl });
    } catch (error) {
      console.error("Error updating principle:", error);
      res.status(500).json({ error: "Failed to update principle" });
    }
  });

// Handle direct principle image uploads (for troubleshooting)
app.post('/api/principles/upload-image', upload.single('file'), async (req, res) => {
  try {
    console.log('=== PRINCIPLE IMAGE UPLOAD ENDPOINT ===');
    // Get the uploaded file
    const file = req.file;
    if (!file) {
      console.error('No file uploaded to principle upload endpoint');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`Received file: ${file.originalname}, size: ${file.size}, type: ${file.mimetype}`);

    // Upload to S3
    const { uploadToS3 } = await import('../utils/s3.js');
    console.log('Calling uploadToS3 for principle image...');
    const s3Url = await uploadToS3(file);

    if (!s3Url) {
      console.error('S3 upload failed for principle image - No URL returned');
      throw new Error('Failed to upload to S3');
    }

    console.log(`Principle image uploaded to S3: ${s3Url}`);

    // Return the S3 URL
    res.json({ 
      url: s3Url,
      size: file.size
    });
  } catch (error) {
    console.error('Error uploading principle image:', error);
    res.status(500).json({ 
      error: 'Failed to upload principle image', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});
