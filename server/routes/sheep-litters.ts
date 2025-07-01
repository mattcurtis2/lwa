import { Router } from "express";
import { db } from "../../db/connection";
import { sheep, sheepLitters } from "@db/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

// Get all sheep litters with their relations
router.get('/api/sheep-litters', async (req, res) => {
  try {
    const result = await db.query.sheepLitters.findMany({
      orderBy: [desc(sheepLitters.createdAt)],
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

    // For each litter, get the lambs (sheep with litterId matching this litter's id)
    const littersWithLambs = await Promise.all(
      result.map(async (litter) => {
        const lambs = await db.query.sheep.findMany({
          where: eq(sheep.litterId, litter.id),
          with: {
            media: true
          }
        });
        
        return {
          ...litter,
          lambs
        };
      })
    );

    res.json(littersWithLambs);
  } catch (error: any) {
    console.error('Error fetching sheep litters:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get sheep litter by ID
router.get('/api/sheep-litters/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.query.sheepLitters.findFirst({
      where: eq(sheepLitters.id, id),
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

    if (!result) {
      return res.status(404).json({ error: 'Sheep litter not found' });
    }

    // Get lambs for this litter
    const lambs = await db.query.sheep.findMany({
      where: eq(sheep.litterId, id),
      with: {
        media: true
      }
    });

    res.json({
      ...result,
      lambs
    });
  } catch (error: any) {
    console.error('Error fetching sheep litter by ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new sheep litter
router.post('/api/sheep-litters', async (req, res) => {
  try {
    const data = req.body;
    
    console.log('Creating sheep litter with data:', JSON.stringify(data));
    
    const result = await db.insert(sheepLitters).values({
      motherId: data.motherId,
      fatherId: data.fatherId,
      dueDate: data.dueDate,
      isVisible: data.isVisible,
      isCurrentLitter: data.isCurrentLitter,
      isPastLitter: data.isPastLitter,
      isPlannedLitter: data.isPlannedLitter,
      expectedBreedingDate: data.expectedBreedingDate || null,
      expectedPickupDate: data.expectedPickupDate || null,
      waitlistLink: data.waitlistLink || null
    }).returning();

    // Fetch the created litter with its relations
    const createdLitter = await db.query.sheepLitters.findFirst({
      where: eq(sheepLitters.id, result[0].id),
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

    // Get lambs for this litter (should be empty for new litter)
    const lambs = await db.query.sheep.findMany({
      where: eq(sheep.litterId, result[0].id),
      with: {
        media: true
      }
    });

    res.json({
      ...createdLitter,
      lambs
    });
  } catch (error: any) {
    console.error('Error creating sheep litter:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update sheep litter by ID
router.put('/api/sheep-litters/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    
    console.log('Updating sheep litter with ID:', id);
    console.log('Request body:', JSON.stringify(data));
    
    // Update the litter
    await db.update(sheepLitters)
      .set({
        motherId: data.motherId,
        fatherId: data.fatherId,
        dueDate: data.dueDate,
        isVisible: data.isVisible,
        isCurrentLitter: data.isCurrentLitter,
        isPastLitter: data.isPastLitter,
        isPlannedLitter: data.isPlannedLitter,
        expectedBreedingDate: data.expectedBreedingDate || null,
        expectedPickupDate: data.expectedPickupDate || null,
        waitlistLink: data.waitlistLink || null
      })
      .where(eq(sheepLitters.id, id));
    
    // Fetch the updated litter with its relations
    const updatedLitter = await db.query.sheepLitters.findFirst({
      where: eq(sheepLitters.id, id),
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
    
    // Find lambs (sheep with litterId matching this litter's id)
    const lambs = await db.query.sheep.findMany({
      where: eq(sheep.litterId, id),
      with: {
        media: true
      }
    });
    
    // Return litter with lambs
    res.json({
      ...updatedLitter,
      lambs
    });
  } catch (error: any) {
    console.error('Error updating sheep litter:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete sheep litter by ID
router.delete('/api/sheep-litters/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if there are any sheep associated with this litter
    const associatedSheep = await db.query.sheep.findMany({
      where: eq(sheep.litterId, id)
    });
    
    if (associatedSheep.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete litter with associated sheep. Please remove or reassign the sheep first.' 
      });
    }
    
    // Delete the litter
    await db.delete(sheepLitters).where(eq(sheepLitters.id, id));
    
    res.json({ message: 'Sheep litter deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting sheep litter:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;