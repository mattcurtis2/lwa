import { Request, Response, Router } from 'express';
import { db } from '@db';
import { styles, selectStyleSchema, insertStyleSchema } from '@db/schema';
import { eq, asc } from 'drizzle-orm';

const router = Router();

// Get all styles
router.get('/', async (req: Request, res: Response) => {
  try {
    const allStyles = await db.query.styles.findMany({
      orderBy: [asc(styles.key)]
    });
    
    return res.status(200).json(allStyles);
  } catch (error) {
    console.error('Error fetching styles:', error);
    return res.status(500).json({ error: 'Failed to fetch styles' });
  }
});

// Get a single style by key
router.get('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    
    const style = await db.query.styles.findFirst({
      where: eq(styles.key, key)
    });
    
    if (!style) {
      return res.status(404).json({ error: 'Style not found' });
    }
    
    return res.status(200).json(style);
  } catch (error) {
    console.error('Error fetching style:', error);
    return res.status(500).json({ error: 'Failed to fetch style' });
  }
});

// Create a new style
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.session.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const newStyle = insertStyleSchema.parse(req.body);
    
    // Check if style with this key already exists
    const existingStyle = await db.query.styles.findFirst({
      where: eq(styles.key, newStyle.key)
    });
    
    if (existingStyle) {
      return res.status(400).json({ error: 'Style with this key already exists' });
    }
    
    const created = await db.insert(styles).values({
      ...newStyle,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    return res.status(201).json(created[0]);
  } catch (error) {
    console.error('Error creating style:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Failed to create style' });
  }
});

// Update a style
router.put('/:key', async (req: Request, res: Response) => {
  try {
    if (!req.session.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { key } = req.params;
    const updateData = req.body;
    
    // Check if style exists
    const existingStyle = await db.query.styles.findFirst({
      where: eq(styles.key, key)
    });
    
    if (!existingStyle) {
      return res.status(404).json({ error: 'Style not found' });
    }
    
    // Add updatedAt timestamp
    const updated = await db.update(styles)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(styles.key, key))
      .returning();
    
    return res.status(200).json(updated[0]);
  } catch (error) {
    console.error('Error updating style:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Failed to update style' });
  }
});

// Bulk update styles
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    if (!req.session.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { styles: stylesData } = req.body;
    
    if (!Array.isArray(stylesData) || stylesData.length === 0) {
      return res.status(400).json({ error: 'Invalid styles data' });
    }
    
    const results = [];
    
    // Use a transaction to ensure all updates succeed or fail together
    await db.transaction(async (tx) => {
      for (const styleData of stylesData) {
        const { id, key, value, category, description } = styleData;
        
        // Validate the style data
        if (!key || !value) {
          throw new Error('Style key and value are required');
        }
        
        // Check if style exists
        const existingStyle = await tx.query.styles.findFirst({
          where: eq(styles.key, key)
        });
        
        if (existingStyle) {
          // Update existing style
          const updated = await tx.update(styles)
            .set({
              value,
              category,
              description,
              updatedAt: new Date()
            })
            .where(eq(styles.key, key))
            .returning();
          
          results.push(updated[0]);
        } else {
          // Create new style
          const created = await tx.insert(styles).values({
            key,
            value,
            category,
            description,
            createdAt: new Date(),
            updatedAt: new Date()
          }).returning();
          
          results.push(created[0]);
        }
      }
    });
    
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error in bulk update:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Failed to update styles' });
  }
});

// Delete a style
router.delete('/:key', async (req: Request, res: Response) => {
  try {
    if (!req.session.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { key } = req.params;
    
    // Check if style exists
    const existingStyle = await db.query.styles.findFirst({
      where: eq(styles.key, key)
    });
    
    if (!existingStyle) {
      return res.status(404).json({ error: 'Style not found' });
    }
    
    await db.delete(styles).where(eq(styles.key, key));
    
    return res.status(200).json({ message: 'Style deleted successfully' });
  } catch (error) {
    console.error('Error deleting style:', error);
    return res.status(500).json({ error: 'Failed to delete style' });
  }
});

export default router;