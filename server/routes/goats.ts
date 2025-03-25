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
    
    // Process null or empty values properly (to support removing fields like price)
    const processedData: Record<string, any> = {};
    
    // Iterate through all fields in data and properly handle nulls/empty strings
    for (const [key, value] of Object.entries(data)) {
      if (key === 'price') {
        // For price, explicitly allow null/empty values
        if (value === '' || value === null || value === undefined) {
          processedData[key] = null; // Set to null in database
        } else {
          processedData[key] = value;
        }
      } else {
        processedData[key] = value;
      }
    }
    
    // Now update with the processed data
    await db.update(goats)
      .set(processedData)
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