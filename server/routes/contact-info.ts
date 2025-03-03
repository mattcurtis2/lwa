
import { Request, Response } from "express";
import { db } from "@db";
import { contactInfo } from "@db/schema";
import { eq } from "drizzle-orm";
import { authenticateToken } from "../helpers";

export async function getContactInfo(req: Request, res: Response) {
  try {
    const contactInfoRecord = await db.query.contactInfo.findFirst();
    
    if (!contactInfoRecord) {
      return res.status(404).json({ message: "Contact information not found" });
    }
    
    return res.json(contactInfoRecord);
  } catch (error) {
    console.error("Error fetching contact info:", error);
    return res.status(500).json({ message: "Failed to fetch contact information" });
  }
}

export async function updateContactInfo(req: Request, res: Response) {
  try {
    // Verify the user is authenticated
    const user = authenticateToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { email, phone, facebook, instagram } = req.body;
    
    // Basic validation
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    // Find existing record
    const existingRecord = await db.query.contactInfo.findFirst();
    
    if (existingRecord) {
      // Update existing record
      await db.update(contactInfo)
        .set({ 
          email, 
          phone, 
          facebook, 
          instagram,
          updatedAt: new Date()
        })
        .where(eq(contactInfo.id, existingRecord.id));
    } else {
      // Create new record
      await db.insert(contactInfo).values({
        email,
        phone,
        facebook,
        instagram
      });
    }
    
    return res.json({ message: "Contact information updated successfully" });
  } catch (error) {
    console.error("Error updating contact info:", error);
    return res.status(500).json({ message: "Failed to update contact information" });
  }
}
