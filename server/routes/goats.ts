import express from 'express';
import { db } from '@db';
import { goats } from '@db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Get all goats
router.get('/api/goats', async (req, res) => {
  try {
    const allGoats = await db.query.goats.findMany({
      with: {
        media: true,
        documents: true,
        mother: true,
        father: true,
        litter: true
      }
    });
    res.json(allGoats);
  } catch (error: any) {
    console.error('Error fetching goats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch goats',
      details: error.message || 'Unknown error' 
    });
  }
});

// Update goat by ID
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