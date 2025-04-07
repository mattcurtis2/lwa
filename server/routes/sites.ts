import express, { Request, Response } from 'express';
import { db } from '../../db';
import { sites } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const router = express.Router();

// Validation schema for site
const siteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  domain: z.string().min(1, "Domain is required"),
  siteName: z.string().min(1, "Site display name is required"),
  siteDescription: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  primaryColor: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

// Get all sites
router.get('/', async (req: Request, res: Response) => {
  try {
    const allSites = await db.select().from(sites).orderBy(sites.name);
    res.json(allSites);
  } catch (error) {
    console.error('Error fetching sites:', error);
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

// Get a site by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const site = await db
      .select()
      .from(sites)
      .where(eq(sites.id, parseInt(id)))
      .limit(1);
    
    if (!site || site.length === 0) {
      return res.status(404).json({ error: 'Site not found' });
    }
    
    res.json(site[0]);
  } catch (error) {
    console.error(`Error fetching site with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch site' });
  }
});

// Create a new site
router.post('/', async (req: Request, res: Response) => {
  try {
    const validationResult = siteSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationResult.error.errors 
      });
    }

    const { 
      name, 
      domain, 
      siteName, 
      siteDescription, 
      logoUrl, 
      primaryColor, 
      active 
    } = validationResult.data;

    // Check if a site with this domain already exists
    const existingSite = await db
      .select()
      .from(sites)
      .where(eq(sites.domain, domain))
      .limit(1);
    
    if (existingSite && existingSite.length > 0) {
      return res.status(409).json({ error: 'A site with this domain already exists' });
    }

    const now = new Date();
    
    const insertedSites = await db.insert(sites).values({
      name,
      domain,
      siteName,
      siteDescription,
      logoUrl,
      primaryColor,
      active,
      createdAt: now,
      updatedAt: now,
    }).returning();

    if (!insertedSites || insertedSites.length === 0) {
      return res.status(500).json({ error: 'Failed to create site' });
    }

    res.status(201).json(insertedSites[0]);
  } catch (error) {
    console.error('Error creating site:', error);
    res.status(500).json({ error: 'Failed to create site' });
  }
});

// Update a site
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validationResult = siteSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationResult.error.errors 
      });
    }

    const { 
      name, 
      domain, 
      siteName, 
      siteDescription, 
      logoUrl, 
      primaryColor, 
      active 
    } = validationResult.data;

    // Check if the site exists
    const existingSite = await db
      .select()
      .from(sites)
      .where(eq(sites.id, parseInt(id)))
      .limit(1);
    
    if (!existingSite || existingSite.length === 0) {
      return res.status(404).json({ error: 'Site not found' });
    }

    // Check if domain is being changed and if it conflicts with another site
    if (domain !== existingSite[0].domain) {
      const domainExists = await db
        .select()
        .from(sites)
        .where(eq(sites.domain, domain))
        .limit(1);
      
      if (domainExists && domainExists.length > 0) {
        return res.status(409).json({ error: 'A site with this domain already exists' });
      }
    }

    const updatedSites = await db
      .update(sites)
      .set({
        name,
        domain,
        siteName,
        siteDescription,
        logoUrl,
        primaryColor,
        active,
        updatedAt: new Date(),
      })
      .where(eq(sites.id, parseInt(id)))
      .returning();

    if (!updatedSites || updatedSites.length === 0) {
      return res.status(500).json({ error: 'Failed to update site' });
    }

    res.json(updatedSites[0]);
  } catch (error) {
    console.error(`Error updating site with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update site' });
  }
});

// Delete a site
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if the site exists
    const existingSite = await db
      .select()
      .from(sites)
      .where(eq(sites.id, parseInt(id)))
      .limit(1);
    
    if (!existingSite || existingSite.length === 0) {
      return res.status(404).json({ error: 'Site not found' });
    }

    const deletedSites = await db
      .delete(sites)
      .where(eq(sites.id, parseInt(id)))
      .returning();

    if (!deletedSites || deletedSites.length === 0) {
      return res.status(500).json({ error: 'Failed to delete site' });
    }

    res.json({ message: 'Site deleted successfully', site: deletedSites[0] });
  } catch (error) {
    console.error(`Error deleting site with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete site' });
  }
});

export default router;