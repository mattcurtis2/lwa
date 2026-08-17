import { Router } from "express";
import { db } from "../../db/connection";
import { sheep, sheepMedia, sheepDocuments } from "@db/schema";
import { eq, desc, asc, and } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs-extra";
import { nanoid } from "nanoid";
import { uploadToFirebase } from "../utils/firebase-storage";
import { buildSheepWriteData, parseJsonField, errorMessage, getCurrentSiteId } from "../helpers";

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
    const siteId = getCurrentSiteId(req);
    const isAdmin = req.query.admin === 'true';
    
    const whereCondition = isAdmin
      ? eq(sheep.siteId, siteId)
      : and(eq(sheep.siteId, siteId), eq(sheep.display, true), eq(sheep.died, false));
    
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
      const firebaseResult = await uploadToFirebase(req.file);
      profileImageUrl = firebaseResult;
    }
    
    const media = parseJsonField<any[]>(data.media, []);
    const documents = parseJsonField<any[]>(data.documents, []);
    
    const processedData = buildSheepWriteData(data);
    
    // Add profile image URL
    if (profileImageUrl) {
      processedData.profileImageUrl = profileImageUrl;
    }
    
    // Start a transaction
    const insertResult = await db.insert(sheep).values(processedData as any).returning();
    const result = insertResult[0] as typeof processedData & { id: number };
    
    if (media.length > 0) {
      const mediaValues = media.map((item: any, index: number) => ({
        sheepId: result.id,
        url: item.url,
        type: item.type || 'image',
        order: index
      }));
      await db.insert(sheepMedia).values(mediaValues);
    }
    
    if (documents.length > 0) {
      const documentValues = documents.map((doc: any) => ({
        sheepId: result.id,
        url: doc.url,
        type: doc.type || 'health',
        name: doc.name || 'Document',
        mimeType: doc.mimeType || 'application/pdf'
      }));
      await db.insert(sheepDocuments).values(documentValues);
    }
    
    res.json(result);
  } catch (error: any) {
    console.error('Error creating sheep:', error);
    res.status(500).json({ error: errorMessage(error) });
  }
});

// Update sheep by ID
router.put('/api/sheep/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    
    // Extract media and documents from the request body
    const { media = [], documents = [], ...sheepData } = data;
    const processedData = {
      ...buildSheepWriteData(sheepData),
      updatedAt: new Date(),
    };
    
    // Start a transaction
    await db.update(sheep)
      .set(processedData as any)
      .where(eq(sheep.id, id));
    
    await db.delete(sheepMedia).where(eq(sheepMedia.sheepId, id));
    
    if (media.length > 0) {
      const mediaValues = media.map((item: any, index: number) => ({
        sheepId: id,
        url: item.url,
        type: item.type || 'image',
        order: index
      }));
      
      await db.insert(sheepMedia).values(mediaValues);
    }
    
    await db.delete(sheepDocuments).where(eq(sheepDocuments.sheepId, id));
    
    if (documents.length > 0) {
      const documentValues = documents.map((doc: any) => ({
        sheepId: id,
        url: doc.url,
        type: doc.type || 'health',
        name: doc.name || 'Document',
        mimeType: doc.mimeType || 'application/pdf'
      }));
      
      await db.insert(sheepDocuments).values(documentValues);
    }
    
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
    res.status(500).json({ error: errorMessage(error) });
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
    await db.delete(sheepMedia).where(eq(sheepMedia.sheepId, id));
    await db.delete(sheepDocuments).where(eq(sheepDocuments.sheepId, id));
    await db.delete(sheep).where(eq(sheep.id, id));
    
    // Note: Files remain in S3 for now
    // TODO: Implement S3 cleanup if needed
    
    res.json({ message: 'Sheep deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting sheep:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;