import express from 'express';
import { db } from '@db';
import { goats } from '@db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

router.put('/api/goats/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    
    // Log the request data for debugging
    console.log('Updating goat with ID:', id);
    console.log('Request body:', JSON.stringify(data));
    
    await db.update(goats)
      .set(data)
      .where(eq(goats.id, id));
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating goat:', error);
    res.status(500).json({ 
      error: 'Failed to update goat',
      details: error.message || 'Unknown error' 
    });
  }
});

export default router;