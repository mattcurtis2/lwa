import express from 'express';
import multer from 'multer';
import { uploadToS3 } from '../utils/s3';

const router = express.Router();

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

router.post('/upload', upload.array('file'), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    console.log('=== S3 Upload Request Started ===');
    const files = req.files.map(f => ({
      originalName: f.originalname,
      size: f.size,
      mimetype: f.mimetype
    }));
    console.log('Files to process:', files);

    const uploadPromises = req.files.map(async (file) => {
      try {
        const s3Url = await uploadToS3(file);
        console.log(`Successfully uploaded to S3: ${file.originalname} -> ${s3Url}`);
        return {
          url: s3Url,
          type: file.mimetype.startsWith('image/') ? 'image' : 'video',
          originalName: file.originalname,
          mimeType: file.mimetype
        };
      } catch (err) {
        console.error(`Failed to upload ${file.originalname} to S3:`, err);
        throw err;
      }
    });

    const results = await Promise.all(uploadPromises);
    console.log('=== S3 Upload Complete ===');
    console.log('Results:', results);

    res.json(results);
  } catch (error) {
    console.error('S3 Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file to S3' });
  }
});

export default router;