
import { Router } from 'express';
import { testS3Upload } from '../utils/test-s3';

const router = Router();

router.get('/test-s3', async (req, res) => {
  try {
    const result = await testS3Upload();
    res.json(result);
  } catch (error) {
    console.error('Error testing S3:', error);
    res.status(500).json({ 
      error: 'S3 test failed', 
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
});

export default router;
