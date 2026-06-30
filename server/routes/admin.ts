// Handle the ImageUpload
app.post('/api/admin/upload-principle-image', upload.single('image'), async (req, res) => {
  try {
    // Get the uploaded file
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to S3 instead of storing locally
    const { uploadToFirebase } = await import('../utils/firebase-storage.js');
    const fileUrl = await uploadToFirebase(file);

    if (!fileUrl) {
      throw new Error('Failed to upload to Firebase Storage');
    }

    console.log(`Principle image uploaded to Firebase: ${fileUrl}`);

    // Return the Firebase URL
    res.json({ 
      url: fileUrl,
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

    // Create a mock file object that uploadToFirebase can handle
    const filename = `principle-${Date.now()}.jpg`;
    const mockFile = {
      buffer: imageBuffer,
      mimetype: 'image/jpeg',
      originalname: filename
    };
    console.log(`Created mock file object with name: ${filename}`);

    // Import and call the S3 upload function
    console.log('Importing S3 utility...');
    const { uploadToFirebase } = await import('../utils/firebase-storage.js');
    console.log('Calling uploadToFirebase...');
    const { isFirebaseUrl } = await import('../utils/firebase-storage.js');
    const fileUrl = await uploadToFirebase(mockFile);

    if (!fileUrl) {
      console.error('Firebase upload failed: No URL returned');
      throw new Error('Failed to upload base64 image to Firebase Storage - No URL returned');
    }

    if (!isFirebaseUrl(fileUrl)) {
      console.error(`Firebase upload returned invalid URL: ${fileUrl}`);
      throw new Error(`Invalid Firebase URL returned: ${fileUrl}`);
    }

    console.log(`Principle base64 image uploaded to Firebase successfully: ${fileUrl}`);

    // Return the Firebase URL
    res.json({
      url: fileUrl,
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
    const { uploadToFirebase } = await import('../utils/firebase-storage.js');
    const s3Url = await uploadToFirebase(file);

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
    const { uploadToFirebase } = await import('../utils/firebase-storage.js');
    const fileUrl = await uploadToFirebase(file);

    if (!fileUrl) {
      throw new Error('Failed to upload to Firebase Storage');
    }

    console.log(`Cropped image uploaded to Firebase: ${fileUrl}`);

    // Clean up temporary file
    fs.unlinkSync(tempPath);

    res.json({ url: fileUrl });
  } catch (error) {
    console.error('Error saving cropped image:', error);

    const errorDetails = {
      message: error.message,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || 'Not set',
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'Not set',
    };

    console.error('Detailed Firebase error information:', errorDetails);
    
    res.status(500).json({ 
      error: 'Failed to save cropped image', 
      details: error.message,
      debug: errorDetails 
    });
  }
});

// Add a test route for Firebase Storage connectivity
app.get('/api/admin/test-firebase-connection', async (req, res) => {
  try {
    console.log('Testing Firebase Storage connection...');

    const envCheck = {
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not set',
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET ? 'Set' : 'Not set',
      FIREBASE_SERVICE_ACCOUNT_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? 'Set' : 'Not set',
      FIREBASE_SERVICE_ACCOUNT_PATH: process.env.FIREBASE_SERVICE_ACCOUNT_PATH ? 'Set' : 'Not set',
    };

    const { isFirebaseConfigured, getFirebaseBucket } = await import('../utils/firebase-storage.js');

    if (!isFirebaseConfigured()) {
      return res.status(500).json({
        success: false,
        message: 'Firebase Storage not configured',
        envCheck,
      });
    }

    const bucket = getFirebaseBucket();
    const [exists] = await bucket.exists();

    res.json({
      success: exists,
      message: exists ? 'Firebase Storage connection successful' : 'Firebase Storage bucket not found',
      bucketName: bucket.name,
      envCheck,
    });
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    res.status(500).json({
      success: false,
      message: `Firebase connection failed: ${error.message}`,
      errorDetails: error.stack,
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
          const { uploadToFirebase } = await import('../utils/firebase-storage.js');
          
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
          
          // Create a mock file object that uploadToFirebase can handle
          const filename = `principle-${id}-${Date.now()}.jpg`;
          const mockFile = {
            buffer: imageBuffer,
            mimetype: mimetype || 'image/jpeg',
            originalname: filename
          };
          console.log(`Created mock file object with name: ${filename}`);
          
          console.log('=== S3 UPLOAD FOR PRINCIPLE UPDATE ===');
          const s3Url = await uploadToFirebase(mockFile);
          
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
    const { uploadToFirebase } = await import('../utils/firebase-storage.js');
    console.log('Calling uploadToFirebase for principle image...');
    const s3Url = await uploadToFirebase(file);

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
