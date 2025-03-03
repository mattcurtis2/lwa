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

    const uploadPromises = req.files.map(async (file) => {
      const url = await uploadToS3(file);
      return { url };
    });

    const results = await Promise.all(uploadPromises);
    res.json(results);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

export default router;
