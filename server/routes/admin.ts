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
    const { base64Image } = req.body;
    
    if (!base64Image) {
      return res.status(400).json({ error: 'No base64 image provided' });
    }
    
    // Extract the base64 data (remove data:image/jpeg;base64, prefix)
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    
    // Create a buffer from the base64 data
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Create a mock file object that uploadToS3 can handle
    const mockFile = {
      buffer: imageBuffer,
      mimetype: 'image/jpeg',
      originalname: `principle-${Date.now()}.jpg`
    };
    
    // Import and call the S3 upload function
    const { uploadToS3 } = await import('../utils/s3.js');
    const s3Url = await uploadToS3(mockFile);
    
    if (!s3Url) {
      throw new Error('Failed to upload base64 image to S3');
    }
    
    console.log(`Principle base64 image uploaded to S3: ${s3Url}`);
    
    // Return the S3 URL
    res.json({
      url: s3Url,
      size: imageBuffer.length
    });
  } catch (error) {
    console.error('Error uploading base64 principle image:', error);
    res.status(500).json({ error: 'Failed to upload image', details: error.message });
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
    res.status(500).json({ error: 'Failed to save cropped image', details: error.message });
  }
});