import express from 'express';
import { db } from '@db';
import { goats, goatMedia, goatDocuments } from '@db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { buildGoatWriteData, errorMessage, getCurrentSiteId } from '../helpers';

const router = express.Router();

// Get all goats
router.get('/api/goats', async (req, res) => {
  try {
    const siteId = getCurrentSiteId(req);
    const isAdmin = req.query.admin === 'true' || Boolean((req as any).session?.isAdmin);
    
    const whereCondition = isAdmin
      ? eq(goats.siteId, siteId)
      : and(eq(goats.siteId, siteId), eq(goats.display, true), eq(goats.died, false));
    
    const allGoats = await db.query.goats.findMany({
      where: whereCondition,
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

// Get single goat by ID
router.get('/api/goats/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const isAdmin = req.query.admin === 'true' || Boolean((req as any).session?.isAdmin);
    
    // For public pages, only show goats with display=true and died=false
    const whereCondition = isAdmin
      ? eq(goats.id, id)
      : and(eq(goats.id, id), eq(goats.display, true), eq(goats.died, false));
    
    const goat = await db.query.goats.findFirst({
      where: whereCondition,
      with: {
        media: true,
        documents: true,
        mother: true,
        father: true,
        litter: true
      }
    });
    
    if (!goat) {
      return res.status(404).json({ error: 'Goat not found' });
    }
    
    res.json(goat);
  } catch (error: any) {
    console.error('Error fetching goat:', error);
    res.status(500).json({ 
      error: 'Failed to fetch goat',
      details: error.message || 'Unknown error' 
    });
  }
});

// Create new goat
router.post('/api/goats', async (req, res) => {
  try {
    const data = req.body;
    console.log('Creating new goat with data:', JSON.stringify(data));
    
    // Extract media and documents from the request body
    const { media = [], documents = [], ...goatData } = data;
    const insertData = buildGoatWriteData(goatData);
    
    const [goatResult] = await db.insert(goats).values(insertData as any).returning({ id: goats.id });
    const goatId = goatResult.id;
    
    // Insert media if present
    if (media.length > 0) {
      const mediaValues = media.map((item: any, index: number) => ({
        goatId: goatId,
        url: item.url,
        type: item.type || 'image',
        order: index
      }));
      
      await db.insert(goatMedia).values(mediaValues);
    }
    
    // Insert documents if present
    if (documents.length > 0) {
      const documentValues = documents.map((doc: any) => ({
        goatId: goatId,
        url: doc.url,
        type: doc.type || 'health',
        name: doc.name || 'Document',
        mimeType: doc.mimeType || 'application/pdf'
      }));
      
      await db.insert(goatDocuments).values(documentValues);
    }
    
    // Fetch the newly created goat with its relations
    const createdGoat = await db.query.goats.findFirst({
      where: eq(goats.id, goatId),
      with: {
        media: true,
        documents: true
      }
    });
    
    res.status(201).json(createdGoat);
  } catch (error: any) {
    console.error('Error creating goat:', error);
    res.status(500).json({ 
      error: 'Failed to create goat',
      details: errorMessage(error)
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
    
    const { media = [], documents = [], ...goatData } = data;
    const processedData = {
      ...buildGoatWriteData(goatData),
      updatedAt: new Date(),
    };
    
    await db.update(goats)
      .set(processedData as any)
      .where(eq(goats.id, id));
    
    await db.delete(goatMedia).where(eq(goatMedia.goatId, id));
    
    if (media.length > 0) {
      const mediaValues = media.map((item: any, index: number) => ({
        goatId: id,
        url: item.url,
        type: item.type || 'image',
        order: index
      }));
      
      await db.insert(goatMedia).values(mediaValues);
    }
    
    await db.delete(goatDocuments).where(eq(goatDocuments.goatId, id));
    
    if (documents.length > 0) {
      const documentValues = documents.map((doc: any) => ({
        goatId: id,
        url: doc.url,
        type: doc.type || 'health',
        name: doc.name || 'Document',
        mimeType: doc.mimeType || 'application/pdf'
      }));
      
      await db.insert(goatDocuments).values(documentValues);
    }
    
    // Fetch the updated goat with its relations
    const updatedGoat = await db.query.goats.findFirst({
      where: eq(goats.id, id),
      with: {
        media: true,
        documents: true
      }
    });
    
    res.json(updatedGoat);
  } catch (error: any) {
    console.error('Error updating goat:', error);
    res.status(500).json({ 
      error: 'Failed to update goat',
      details: error.message || 'Unknown error' 
    });
  }
});

// Delete goat by ID
router.delete('/api/goats/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Start a transaction to delete related records
    await db.delete(goatMedia).where(eq(goatMedia.goatId, id));
    await db.delete(goatDocuments).where(eq(goatDocuments.goatId, id));
    await db.delete(goats).where(eq(goats.id, id));
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting goat:', error);
    res.status(500).json({ 
      error: 'Failed to delete goat',
      details: error.message || 'Unknown error' 
    });
  }
});

// Get goat media by goat ID
router.get('/api/goats/:id/media', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const media = await db.query.goatMedia.findMany({
      where: eq(goatMedia.goatId, id),
      orderBy: [desc(goatMedia.order)]
    });
    
    res.json(media);
  } catch (error: any) {
    console.error('Error fetching goat media:', error);
    res.status(500).json({ 
      error: 'Failed to fetch goat media',
      details: error.message || 'Unknown error' 
    });
  }
});

// Get goat documents by goat ID
router.get('/api/goats/:id/documents', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const documents = await db.query.goatDocuments.findMany({
      where: eq(goatDocuments.goatId, id)
    });
    
    res.json(documents);
  } catch (error: any) {
    console.error('Error fetching goat documents:', error);
    res.status(500).json({ 
      error: 'Failed to fetch goat documents',
      details: error.message || 'Unknown error' 
    });
  }
});

export default router;