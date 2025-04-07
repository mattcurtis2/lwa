import { Router } from 'express';
import { db } from '../../db';
import { styles, selectStyleSchema, insertStyleSchema } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Get all styles
router.get('/', async (req, res) => {
  try {
    const allStyles = await db.select().from(styles);
    res.json(allStyles);
  } catch (error) {
    console.error('Error fetching styles:', error);
    res.status(500).json({ message: 'Failed to fetch styles' });
  }
});

// Get a specific style by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const style = await db.select().from(styles).where(eq(styles.id, parseInt(id))).limit(1);
    
    if (style.length === 0) {
      return res.status(404).json({ message: 'Style not found' });
    }
    
    res.json(style[0]);
  } catch (error) {
    console.error('Error fetching style:', error);
    res.status(500).json({ message: 'Failed to fetch style' });
  }
});

// Create a new style
router.post('/', async (req, res) => {
  try {
    const newStyle = insertStyleSchema.parse(req.body);
    
    // Check if key already exists
    const existingStyle = await db.select().from(styles).where(eq(styles.key, newStyle.key));
    if (existingStyle.length > 0) {
      return res.status(400).json({ message: 'Style with this key already exists' });
    }
    
    const result = await db.insert(styles).values({
      ...newStyle,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    res.status(201).json(result[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid style data', errors: error.errors });
    }
    
    console.error('Error creating style:', error);
    res.status(500).json({ message: 'Failed to create style' });
  }
});

// Update a style
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const styleData = req.body;
    
    // Validate the style data
    const validatedData = selectStyleSchema.partial().parse(styleData);
    
    const result = await db.update(styles)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(styles.id, parseInt(id)))
      .returning();
    
    if (result.length === 0) {
      return res.status(404).json({ message: 'Style not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid style data', errors: error.errors });
    }
    
    console.error('Error updating style:', error);
    res.status(500).json({ message: 'Failed to update style' });
  }
});

// Delete a style
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.delete(styles)
      .where(eq(styles.id, parseInt(id)))
      .returning();
    
    if (result.length === 0) {
      return res.status(404).json({ message: 'Style not found' });
    }
    
    res.json({ message: 'Style deleted successfully' });
  } catch (error) {
    console.error('Error deleting style:', error);
    res.status(500).json({ message: 'Failed to delete style' });
  }
});

export default router;