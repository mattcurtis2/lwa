import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.get('/proxy-image', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).send('URL parameter is required');
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // Forward the content type
    res.set('Content-Type', response.headers.get('content-type'));
    
    // Stream the response
    response.body.pipe(res);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Failed to proxy image');
  }
});

export default router;
