import { Router } from "express";
import { db } from "../../db/connection";
import { sheep, sheepMedia, sheepDocuments } from "@db/schema";
import { eq, desc, asc, and } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs-extra";
import { nanoid } from "nanoid";
import { uploadToS3 } from "../utils/s3";

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = nanoid(10);
    cb(null, `sheep-${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Get all sheep with their relations
router.get('/api/sheep', async (req, res) => {
  try {
    const isAdmin = req.query.admin === 'true';
    
    // Define the where condition based on whether this is an admin request
    // For admin, show all sheep; for public pages, only show sheep with display=true and died=false
    const whereCondition = isAdmin
      ? undefined
      : and(eq(sheep.display, true), eq(sheep.died, false));
    
    const result = await db.query.sheep.findMany({
      where: whereCondition,
      orderBy: [asc(sheep.order), desc(sheep.createdAt)],
      with: {
        media: {
          orderBy: [asc(sheepMedia.order)]
        },
        documents: true,
        mother: true,
        father: true,
        litter: true
      }
    });
    res.json(result);
  } catch (error: any) {
    console.error('Error fetching sheep:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all sheep for admin (includes outside breeders and hidden)
router.get('/api/sheep/admin', async (req, res) => {
  try {
    const result = await db.query.sheep.findMany({
      orderBy: [asc(sheep.order), desc(sheep.createdAt)],
      with: {
        media: {
          orderBy: [asc(sheepMedia.order)]
        },
        documents: true,
        mother: true,
        father: true,
        litter: true
      }
    });
    res.json(result);
  } catch (error: any) {
    console.error('Error fetching sheep for admin:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get sheep by ID
router.get('/api/sheep/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const isAdmin = req.query.admin === 'true';
    
    // For public pages, only show sheep with display=true and died=false
    const whereCondition = isAdmin
      ? eq(sheep.id, id)
      : and(eq(sheep.id, id), eq(sheep.display, true), eq(sheep.died, false));
    
    const result = await db.query.sheep.findFirst({
      where: whereCondition,
      with: {
        media: {
          orderBy: [asc(sheepMedia.order)]
        },
        documents: true,
        mother: true,
        father: true,
        litter: true
      }
    });
    
    if (!result) {
      return res.status(404).json({ error: 'Sheep not found' });
    }
    
    res.json(result);
  } catch (error: any) {
    console.error('Error fetching sheep by ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new sheep
router.post('/api/sheep', upload.single('profileImage'), async (req, res) => {
  try {
    const data = req.body;
    
    // Handle profile image upload
    let profileImageUrl = null;
    if (req.file) {
      const s3Result = await uploadToS3(req.file);
      profileImageUrl = s3Result;
    }
    
    // Parse media and documents (handle both JSON strings and objects)
    const media = data.media ? 
      (typeof data.media === 'string' ? JSON.parse(data.media) : data.media) : [];
    const documents = data.documents ? 
      (typeof data.documents === 'string' ? JSON.parse(data.documents) : data.documents) : [];
    
    // Process boolean fields
    const processedData: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'display' || key === 'sold' || key === 'available' || key === 'lamb' || key === 'outsideBreeder' || key === 'died') {
        processedData[key] = value === true || value === 'true';
      } else if (key === 'price' || key === 'ramPrice' || key === 'wetherPrice') {
        processedData[key] = value === '' || value === null || value === undefined ? null : value;
      } else if (key !== 'media' && key !== 'documents') {
        processedData[key] = value;
      }
    }
    
    // Add profile image URL
    if (profileImageUrl) {
      processedData.profileImageUrl = profileImageUrl;
    }
    
    // Start a transaction
    const result = await db.transaction(async (tx) => {
      // Create the sheep
      const insertResult = await tx.insert(sheep).values(processedData).returning();
      const newSheep = insertResult[0] as typeof processedData & { id: number };
      
      // Insert media if there are any
      if (media.length > 0) {
        const mediaValues = media.map((item: any, index: number) => ({
          sheepId: newSheep.id,
          url: item.url,
          type: item.type || 'image',
          order: index
        }));
        await tx.insert(sheepMedia).values(mediaValues);
      }
      
      // Insert documents if there are any  
      if (documents.length > 0) {
        const documentValues = documents.map((doc: any) => ({
          sheepId: newSheep.id,
          url: doc.url,
          type: doc.type || 'health',
          name: doc.name || 'Document',
          mimeType: doc.mimeType || 'application/pdf'
        }));
        await tx.insert(sheepDocuments).values(documentValues);
      }
      
      return newSheep;
    });
    
    res.json(result);
  } catch (error: any) {
    console.error('Error creating sheep:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update sheep by ID
router.put('/api/sheep/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    
    // Extract media and documents from the request body
    const { media = [], documents = [], ...sheepData } = data;
    
    // Process null or empty values properly (to support removing fields like price)
    const processedData: Record<string, any> = {};
    
    // Iterate through all fields in data and properly handle nulls/empty strings
    for (const [key, value] of Object.entries(sheepData)) {
      if (key === 'price' || key === 'ramPrice' || key === 'wetherPrice') {
        // For price fields, explicitly allow null/empty values
        if (value === '' || value === null || value === undefined) {
          processedData[key] = null; // Set to null in database
        } else {
          processedData[key] = value;
        }
      } else if (key === 'display') {
        // Use strict boolean comparison to interpret display value
        const displayValue = value === true;
        processedData[key] = displayValue;
      } else if (key === 'sold' || key === 'available' || key === 'lamb' || key === 'outsideBreeder' || key === 'died') {
        // Use strict boolean comparison for all boolean fields
        const boolValue = value === true;
        processedData[key] = boolValue;
      } else {
        processedData[key] = value;
      }
    }
    
    // Start a transaction
    await db.transaction(async (tx) => {
      // Update the sheep data
      await tx.update(sheep)
        .set(processedData)
        .where(eq(sheep.id, id));
      
      // Handle media updates
      // Always delete existing media for this sheep
      await tx.delete(sheepMedia).where(eq(sheepMedia.sheepId, id));
      
      // Insert new media if there are any
      if (media.length > 0) {
        const mediaValues = media.map((item: any, index: number) => ({
          sheepId: id,
          url: item.url,
          type: item.type || 'image',
          order: index
        }));
        
        await tx.insert(sheepMedia).values(mediaValues);
      }
      
      // Handle document updates
      // Always delete existing documents for this sheep
      await tx.delete(sheepDocuments).where(eq(sheepDocuments.sheepId, id));
      
      // Insert new documents if there are any
      if (documents.length > 0) {
        const documentValues = documents.map((doc: any) => ({
          sheepId: id,
          url: doc.url,
          type: doc.type || 'health',
          name: doc.name || 'Document',
          mimeType: doc.mimeType || 'application/pdf'
        }));
        
        await tx.insert(sheepDocuments).values(documentValues);
      }
    });
    
    // Fetch the updated sheep with its relations
    const updatedSheep = await db.query.sheep.findFirst({
      where: eq(sheep.id, id),
      with: {
        media: {
          orderBy: [asc(sheepMedia.order)]
        },
        documents: true,
        mother: true,
        father: true,
        litter: true
      }
    });
    
    res.json(updatedSheep);
  } catch (error: any) {
    console.error('Error updating sheep:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete sheep by ID
router.delete('/api/sheep/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Get the sheep first to get profile image URL for S3 deletion
    const sheepToDelete = await db.query.sheep.findFirst({
      where: eq(sheep.id, id),
      with: {
        media: true,
        documents: true
      }
    });
    
    if (!sheepToDelete) {
      return res.status(404).json({ error: 'Sheep not found' });
    }
    
    // Start a transaction to delete everything
    await db.transaction(async (tx) => {
      // Delete media records
      await tx.delete(sheepMedia).where(eq(sheepMedia.sheepId, id));
      
      // Delete document records
      await tx.delete(sheepDocuments).where(eq(sheepDocuments.sheepId, id));
      
      // Delete the sheep
      await tx.delete(sheep).where(eq(sheep.id, id));
    });
    
    // Note: Files remain in S3 for now
    // TODO: Implement S3 cleanup if needed
    
    res.json({ message: 'Sheep deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting sheep:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;