import express from 'express';
import { db } from '@db';
import { goats, goatLitters, goatMedia, goatDocuments } from '@db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

const router = express.Router();

// Get current goat litters (all litters, with or without kids)
router.get('/api/goat-litters/list/current', async (req, res) => {
  try {
    // Get all litters
    const allLitters = await db.query.goatLitters.findMany({
      where: and(
        eq(goatLitters.isVisible, true),
        eq(goatLitters.isCurrentLitter, true)
      ),
      orderBy: (goatLitters, { desc }) => [desc(goatLitters.dueDate)],
      with: {
        mother: {
          with: {
            media: true
          }
        },
        father: {
          with: {
            media: true
          }
        }
      }
    });
    
    // For each litter, find kids (kid goats with litterId matching the litter's id)
    const littersWithKids = await Promise.all(allLitters.map(async (litter) => {
      const kids = await db.query.goats.findMany({
        where: eq(goats.litterId, litter.id),
        with: {
          media: true
        }
      });
      
      return {
        ...litter,
        kids: kids || []
      };
    }));
    
    res.json(littersWithKids);
  } catch (error: any) {
    console.error('Error fetching current goat litters:', error);
    res.status(500).json({ 
      error: 'Failed to fetch current goat litters',
      details: error.message || 'Unknown error' 
    });
  }
});

// Get past goat litters
router.get('/api/goat-litters/list/past', async (req, res) => {
  try {
    const pastLitters = await db.query.goatLitters.findMany({
      where: and(
        eq(goatLitters.isVisible, true),
        eq(goatLitters.isPastLitter, true)
      ),
      orderBy: (goatLitters, { desc }) => [desc(goatLitters.dueDate)],
      with: {
        mother: {
          with: {
            media: true
          }
        },
        father: {
          with: {
            media: true
          }
        }
      }
    });
    
    // For each litter, find kids (goats with litterId matching the litter's id)
    const littersWithKids = await Promise.all(pastLitters.map(async (litter) => {
      const kids = await db.query.goats.findMany({
        where: eq(goats.litterId, litter.id),
        with: {
          media: true
        }
      });
      
      return {
        ...litter,
        kids
      };
    }));
    
    res.json(littersWithKids);
  } catch (error: any) {
    console.error('Error fetching past goat litters:', error);
    res.status(500).json({ 
      error: 'Failed to fetch past goat litters',
      details: error.message || 'Unknown error' 
    });
  }
});

// Create new goat litter
router.post('/api/goat-litters', async (req, res) => {
  try {
    const data = req.body;
    console.log('Creating new goat litter with data:', JSON.stringify(data));
    
    // Insert the litter
    const [litterResult] = await db.insert(goatLitters).values({
      motherId: data.motherId,
      fatherId: data.fatherId,
      dueDate: data.dueDate,
      isVisible: data.isVisible ?? true,
      isCurrentLitter: data.isCurrentLitter ?? false,
      isPastLitter: data.isPastLitter ?? false
    }).returning({ id: goatLitters.id });
    
    const litterId = litterResult.id;
    
    // Fetch the newly created litter with its relations
    const createdLitter = await db.query.goatLitters.findFirst({
      where: eq(goatLitters.id, litterId),
      with: {
        mother: {
          with: {
            media: true
          }
        },
        father: {
          with: {
            media: true
          }
        }
      }
    });
    
    res.status(201).json(createdLitter);
  } catch (error: any) {
    console.error('Error creating goat litter:', error);
    res.status(500).json({ 
      error: 'Failed to create goat litter',
      details: error.message || 'Unknown error' 
    });
  }
});

// Update goat litter by ID
router.put('/api/goat-litters/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    
    // Log the request data for debugging
    console.log('Updating goat litter with ID:', id);
    console.log('Request body:', JSON.stringify(data));
    
    // Update the litter
    await db.update(goatLitters)
      .set({
        motherId: data.motherId,
        fatherId: data.fatherId,
        dueDate: data.dueDate,
        isVisible: data.isVisible,
        isCurrentLitter: data.isCurrentLitter,
        isPastLitter: data.isPastLitter
      })
      .where(eq(goatLitters.id, id));
    
    // Fetch the updated litter with its relations
    const updatedLitter = await db.query.goatLitters.findFirst({
      where: eq(goatLitters.id, id),
      with: {
        mother: {
          with: {
            media: true
          }
        },
        father: {
          with: {
            media: true
          }
        }
      }
    });
    
    // Find kids (goats with litterId matching this litter's id)
    const kids = await db.query.goats.findMany({
      where: eq(goats.litterId, id),
      with: {
        media: true
      }
    });
    
    // Return litter with kids
    res.json({
      ...updatedLitter,
      kids
    });
  } catch (error: any) {
    console.error('Error updating goat litter:', error);
    res.status(500).json({ 
      error: 'Failed to update goat litter',
      details: error.message || 'Unknown error' 
    });
  }
});

// Delete goat litter by ID
router.delete('/api/goat-litters/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Get all kids from this litter
    const kids = await db.query.goats.findMany({
      where: eq(goats.litterId, id)
    });
    
    // Start a transaction
    await db.transaction(async (tx) => {
      // Update all kids to remove their litter association
      for (const kid of kids) {
        await tx.update(goats)
          .set({ litterId: null })
          .where(eq(goats.id, kid.id));
      }
      
      // Delete the litter
      await tx.delete(goatLitters).where(eq(goatLitters.id, id));
    });
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting goat litter:', error);
    res.status(500).json({ 
      error: 'Failed to delete goat litter',
      details: error.message || 'Unknown error' 
    });
  }
});

// Get current goat litters (all litters, with or without kids)
router.get('/api/goat-litters/list/current', async (req, res) => {
  try {
    // Get all litters
    const allLitters = await db.query.goatLitters.findMany({
      where: and(
        eq(goatLitters.isVisible, true),
        eq(goatLitters.isCurrentLitter, true)
      ),
      orderBy: (goatLitters, { desc }) => [desc(goatLitters.dueDate)],
      with: {
        mother: {
          with: {
            media: true
          }
        },
        father: {
          with: {
            media: true
          }
        }
      }
    });
    
    // For each litter, find kids (kid goats with litterId matching the litter's id)
    const littersWithKids = await Promise.all(allLitters.map(async (litter) => {
      const kids = await db.query.goats.findMany({
        where: eq(goats.litterId, litter.id),
        with: {
          media: true
        }
      });
      
      return {
        ...litter,
        kids: kids || []
      };
    }));
    
    res.json(littersWithKids);
  } catch (error: any) {
    console.error('Error fetching current goat litters:', error);
    res.status(500).json({ 
      error: 'Failed to fetch current goat litters',
      details: error.message || 'Unknown error' 
    });
  }
});

export default router;