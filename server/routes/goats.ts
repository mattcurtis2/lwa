import express from 'express';
import { db } from '@db';
import { goats, goatMedia, goatDocuments, goatLitters } from '@db/schema';
import { eq, and, desc } from 'drizzle-orm';

const router = express.Router();

// Get all goats
router.get('/api/goats', async (req, res) => {
  try {
    const isAdmin = req.query.admin === 'true';
    
    // Define the where condition based on whether this is an admin request
    // For admin, show all goats; for public pages, only show goats with display=true
    const whereCondition = isAdmin
      ? undefined
      : eq(goats.display, true);
    
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
    const goat = await db.query.goats.findFirst({
      where: eq(goats.id, id),
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
    
    // Insert the goat and get the ID
    const [goatResult] = await db.insert(goats).values(goatData).returning({ id: goats.id });
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
    
    // Extract media and documents from the request body
    const { media = [], documents = [], ...goatData } = data;
    
    // Process null or empty values properly (to support removing fields like price)
    const processedData: Record<string, any> = {};
    
    // Iterate through all fields in data and properly handle nulls/empty strings
    for (const [key, value] of Object.entries(goatData)) {
      if (key === 'price') {
        // For price, explicitly allow null/empty values
        if (value === '' || value === null || value === undefined) {
          processedData[key] = null; // Set to null in database
        } else {
          processedData[key] = value;
        }
      } else if (key === 'display') {
        // Ensure display is a boolean
        processedData[key] = value !== undefined ? Boolean(value) : true;
      } else {
        processedData[key] = value;
      }
    }
    
    // Start a transaction
    await db.transaction(async (tx) => {
      // Update the goat data
      await tx.update(goats)
        .set(processedData)
        .where(eq(goats.id, id));
      
      // Handle media updates
      // Always delete existing media for this goat
      await tx.delete(goatMedia).where(eq(goatMedia.goatId, id));
      
      // Insert new media if there are any
      if (media.length > 0) {
        const mediaValues = media.map((item: any, index: number) => ({
          goatId: id,
          url: item.url,
          type: item.type || 'image',
          order: index
        }));
        
        await tx.insert(goatMedia).values(mediaValues);
      }
      
      // Handle document updates
      // Always delete existing documents for this goat
      await tx.delete(goatDocuments).where(eq(goatDocuments.goatId, id));
      
      // Insert new documents if there are any
      if (documents.length > 0) {
        const documentValues = documents.map((doc: any) => ({
          goatId: id,
          url: doc.url,
          type: doc.type || 'health',
          name: doc.name || 'Document',
          mimeType: doc.mimeType || 'application/pdf'
        }));
        
        await tx.insert(goatDocuments).values(documentValues);
      }
    });
    
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
    await db.transaction(async (tx) => {
      // Delete media
      await tx.delete(goatMedia).where(eq(goatMedia.goatId, id));
      
      // Delete documents
      await tx.delete(goatDocuments).where(eq(goatDocuments.goatId, id));
      
      // Delete the goat
      await tx.delete(goats).where(eq(goats.id, id));
    });
    
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