import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.get('/proxy-image', async (req, res) => {
  try {
    const { url } = req.query;

    console.log('[Image Proxy] Received request for URL:', url);

    if (!url || typeof url !== 'string') {
      console.error('[Image Proxy] Missing or invalid URL parameter');
      return res.status(400).send('URL parameter is required');
    }

    console.log('[Image Proxy] Fetching image from:', url);
    const response = await fetch(url);

    if (!response.ok) {
      console.error('[Image Proxy] Failed to fetch image:', response.statusText);
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    console.log('[Image Proxy] Image fetched successfully, content-type:', response.headers.get('content-type'));

    // Forward the content type
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.set('Content-Type', contentType);
    }

    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    // Stream the response
    response.body.pipe(res);

    response.body.on('end', () => {
      console.log('[Image Proxy] Image streaming completed');
    });

  } catch (error) {
    console.error('[Image Proxy] Error:', error);
    res.status(500).send('Failed to proxy image');
  }
});

export default router;