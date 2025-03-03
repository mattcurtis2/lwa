
import { db } from "@db";
import { siteContent, contactInfo } from "@db/schema";
import { eq } from "drizzle-orm";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function auditContactUsage() {
  console.log("=== Contact Information Usage Audit ===\n");
  
  // Get contact info record
  const contactInfoRecord = await db.query.contactInfo.findFirst();
  
  console.log("Current Contact Info Record:");
  if (contactInfoRecord) {
    console.log(`- Email: ${contactInfoRecord.email}`);
    console.log(`- Phone: ${contactInfoRecord.phone}`);
    console.log(`- Facebook: ${contactInfoRecord.facebook}`);
    console.log(`- Instagram: ${contactInfoRecord.instagram || 'Not set'}`);
    console.log(`- Last Updated: ${contactInfoRecord.updatedAt}`);
  } else {
    console.log("No contact info record found!");
  }
  
  // Check for old email/contact entries in site_content
  const emailEntries = await db.query.siteContent.findMany({
    where: (content, { or, like }) => or(
      like(content.key, '%email%'),
      like(content.key, '%contact%'),
      like(content.key, '%phone%')
    )
  });
  
  console.log("\nEmail/Contact Related Site Content Entries:");
  if (emailEntries.length > 0) {
    emailEntries.forEach(entry => {
      console.log(`- ID: ${entry.id}, Key: ${entry.key}, Value: ${entry.value}`);
    });
  } else {
    console.log("No email/contact related entries found in site_content table.");
  }
  
  // Scan client source files for direct email references
  const clientSrcDir = path.join(__dirname, '..', 'client', 'src');
  console.log("\nScanning client source code for email references...");
  
  let emailReferences = [];
  
  function scanDirectoryForEmailReferences(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        scanDirectoryForEmailReferences(filePath);
      } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Look for email patterns
        const emailPattern = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const matches = content.match(emailPattern);
        
        if (matches) {
          emailReferences.push({
            filePath: path.relative(path.join(__dirname, '..'), filePath),
            emails: matches
          });
        }
      }
    }
  }
  
  try {
    scanDirectoryForEmailReferences(clientSrcDir);
    
    if (emailReferences.length > 0) {
      console.log("Found email references in the following files:");
      emailReferences.forEach(ref => {
        console.log(`- ${ref.filePath}: ${ref.emails.join(', ')}`);
      });
    } else {
      console.log("No hardcoded email references found in client source code.");
    }
  } catch (error) {
    console.error("Error scanning client source:", error);
  }
  
  console.log("\n=== Recommendations ===");
  console.log("1. Update the contact info record if needed:");
  console.log("   db.update(contactInfo).set({ email: 'new@email.com' }).where(eq(contactInfo.id, 1));");
  
  if (emailEntries.length > 0) {
    console.log("2. Consider removing or updating these site_content entries:");
    emailEntries.forEach(entry => {
      console.log(`   db.delete(siteContent).where(eq(siteContent.id, ${entry.id})); // Remove ${entry.key}`);
    });
  }
  
  if (emailReferences.length > 0) {
    console.log("3. Update any hardcoded email references in source files.");
  }
}

auditContactUsage()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Audit failed:", error);
    process.exit(1);
  });
