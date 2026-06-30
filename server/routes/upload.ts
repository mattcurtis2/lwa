import express from 'express';
import multer from 'multer';
import { uploadToFirebase, isFirebaseConfigured } from '../utils/firebase-storage';

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
  if (!isFirebaseConfigured()) {
    return res.status(503).json({ error: 'Firebase Storage not configured' });
  }
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    console.log('=== Firebase Upload Request Started ===');
    const files = req.files.map(f => ({
      originalName: f.originalname,
      size: f.size,
      mimetype: f.mimetype
    }));
    console.log('Files to process:', files);

    const uploadPromises = req.files.map(async (file) => {
      try {
        const fileUrl = await uploadToFirebase(file);
        console.log(`Successfully uploaded to Firebase: ${file.originalname} -> ${fileUrl}`);
        return {
          url: fileUrl,
          type: file.mimetype.startsWith('image/') ? 'image' : 'video',
          originalName: file.originalname,
          mimeType: file.mimetype
        };
      } catch (err) {
        console.error(`Failed to upload ${file.originalname} to Firebase:`, err);
        throw err;
      }
    });

    const results = await Promise.all(uploadPromises);
    console.log('=== Firebase Upload Complete ===');
    console.log('Results:', results);

    res.json(results);
  } catch (error) {
    console.error('Firebase Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file to Firebase Storage' });
  }
});

export default router;
